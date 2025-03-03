import { Types, Creators } from "./index";
import { eventChannel, END } from "redux-saga";
import { actionChannel, call, put, take } from "redux-saga/effects";
import { AddUploadAction, FileInfo } from "./types";
import { Video } from "../../util/models";
import videoHttp from "../../util/http/video-http";

export function* uploadWatcherSaga() {
  const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);
  while (true) {
    const { payload }: AddUploadAction = yield take(newFilesChannel);

    for (const fileInfo of payload.files) {
      try {
        yield call(uploadFile, {
          video: payload.video,
          fileInfo,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
}

function* uploadFile({
  video,
  fileInfo,
}: {
  video: Video;
  fileInfo: FileInfo;
}) {
  const channel = yield call(sendUpload, { id: video.id, fileInfo });
  while (true) {
    try {
      const { progress, response } = yield take(channel);
      if (response) {
        return response;
      }
      yield put(
        Creators.updateProgress({
          video,
          fileField: fileInfo.fileField,
          progress,
        })
      );
    } catch (error) {
      console.log(error);
      yield put(
        Creators.setUploadError({ video, fileField: fileInfo.fileField, error })
      );
      throw error;
    }
  }
}

function sendUpload({ id, fileInfo }: { id: string; fileInfo: FileInfo }) {
  return eventChannel((emitter) => {
    videoHttp
      .partialUpdate(
        id,
        {
          _method: "PATCH",
          [fileInfo.fileField]: fileInfo.file,
        },
        {
          http: { usePost: true },
          config: {
            headers: {
              "x-ignore-loading": true,
            },
            onUploadProgress(progressEvent: ProgressEvent) {
              if (progressEvent.lengthComputable) {
                const progress = progressEvent.loaded / progressEvent.total;
                emitter({ progress });
              }
            },
          },
        }
      )
      .then((response) => emitter({ response }))
      .catch((error) => emitter(error))
      .finally(() => emitter(END));
    const unsubscribe = () => {};
    return unsubscribe;
  });
}
