import React, {
  createRef,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  makeStyles,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import videoHttp from "../../../util/http/video-http";

import * as yup from "../../../util/vendor/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router";

import SubmitActions from "../../../components/SubmitActions";
import DefaultForm from "../../../components/DefaultForm";
import RatingField from "./RatingField";
import UploadField from "./UploadField";
import { Video, VideoFileFieldsMap } from "../../../util/models";
import GenreField, { GenreFieldComponent } from "./GenreField";
import CategoryField, { CategoryFieldComponent } from "./CategoryField";
import CastMemberField, { CastMemberFieldComponent } from "./CastMemberField";
import { omit, zipObject } from "lodash";
import { InputFileComponent } from "../../../components/InputFile";
import useSnackbarFormError from "../../../hooks/useSnackbarFormError";
import LoadingContext from "../../../components/loading/LoadingContext";
import { useDispatch, useSelector } from "react-redux";
import {
  UploadState as UploadState,
  Upload,
  UploadModule,
  FileInfo,
} from "../../../store/upload/types";
import { Creators } from "../../../store/upload";
import SnackbarUpload from "../../../components/SnackbarUpload";

const useStyles = makeStyles((theme: Theme) => ({
  cardUpload: {
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    margin: theme.spacing(2, 0),
  },
  cardOpened: {
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
  },
  cardContentOpened: {
    paddingBottom: theme.spacing(2) + "px !important",
  },
}));

const validationSchema = yup.object().shape({
  title: yup.string().label("Título").required().max(255),
  description: yup.string().label("Sinopse").required(),
  year_release: yup.number().label("Ano de lançamento").required().min(1),
  duration: yup.number().label("Duração").required().min(1),
  cast_members: yup.array().label("Elenco").required(),
  genres: yup
    .array()
    .label("Gêneros")
    .required()
    .test({
      message:
        "Cada gênero escolhido precisa ter pelo menos uma categoria selecionada",
      test(value) {
        //array genres [{name, categories: []}]
        return value.every(
          (v) =>
            v.categories.filter((cat) =>
              this.parent.categories.map((c) => c.id).includes(cat.id)
            ).length !== 0
        );
      },
    }),
  categories: yup.array().label("Categorias").required(),
  rating: yup.string().label("Classificação").required(),
});

const fileFields = Object.keys(VideoFileFieldsMap);

export const Form = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState,
    errors,
    reset,
    getValues,
  } = useForm<{
    title;
    description;
    year_release;
    duration;
    rating;
    cast_members;
    genres;
    categories;
    opened;
  }>({
    validationSchema,
    defaultValues: {
      rating: null,
      cast_members: [],
      genres: [],
      categories: [],
      opened: false,
    },
  });
  useSnackbarFormError(formState.submitCount, errors);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const loading = useContext(LoadingContext);

  const theme = useTheme();
  const isGreaterMd = useMediaQuery(theme.breakpoints.up("md"));
  const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
  const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
  const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
  const uploadsRef = useRef(
    zipObject(
      fileFields,
      fileFields.map(() => createRef())
    )
  ) as MutableRefObject<{
    [key: string]: MutableRefObject<InputFileComponent>;
  }>;

  const uploads = useSelector<UploadModule, Upload[]>(
    (state) => state.upload.uploads
  );

  const dispatch = useDispatch();

  useEffect(() => {
    [
      "rating",
      "opened",
      "genres",
      "categories",
      "cast_members",
      ...fileFields,
    ].forEach((name) => register({ name }));
  }, [register]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let isSubscribed = true;

    (async () => {
      try {
        const { data } = await videoHttp.get(id);
        if (isSubscribed) {
          setVideo(data.data);
          reset({ ...data.data });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const onSubmit = async (formData, event) => {
    const sendData = omit(formData, [
      "genres",
      "categories",
      "cast_members",
      ...fileFields,
    ]);
    sendData["genres_id"] = formData["genres"].map((genre) => genre.id);
    sendData["categories_id"] = formData["categories"].map(
      (category) => category.id
    );
    sendData["cast_members_id"] = formData["cast_members"].map(
      (castMember) => castMember.id
    );

    try {
      const http = !video
        ? videoHttp.create(sendData)
        : videoHttp.update(video.id, sendData);
      const { data } = await http;
      enqueueSnackbar("Vídeo salvo com sucesso", {
        variant: "success",
      });
      uploadFiles(data.data);
      id && resetForm(data);
      setTimeout(() => {
        event
          ? id
            ? history.replace(`/videos/${data.data.id}/edit`)
            : history.push(`/videos/${data.data.id}/edit`)
          : history.push("/videos");
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Não foi possivel salvar o vídeo", {
        variant: "error",
      });
    }
  };

  const resetForm = (data) => {
    Object.keys(uploadsRef.current).forEach((field) =>
      uploadsRef.current[field].current.clear()
    );
    castMemberRef.current.clear();
    genreRef.current.clear();
    categoryRef.current.clear();
    //reset(data);
  };

  const uploadFiles = (video) => {
    const files: FileInfo[] = fileFields
      .filter((fileField) => getValues()[fileField])
      .map((fileField) => ({ fileField, file: getValues()[fileField] }));

    console.log(video, files);

    if (!files.length) {
      return;
    }

    dispatch(Creators.addUpload({ video, files }));

    enqueueSnackbar("", {
      key: "snackbar-upload",
      persist: true,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right",
      },
      content: (key) => {
        const id = key as any;
        return <SnackbarUpload id={id} />;
      },
    });
  };

  return (
    <DefaultForm onSubmit={handleSubmit(onSubmit)} GridItemProps={{ xs: 12 }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <TextField
            inputRef={register}
            name="title"
            label="Título"
            fullWidth
            variant="outlined"
            disabled={loading}
            error={errors.title !== undefined}
            helperText={errors.title && errors.title.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            inputRef={register}
            name="description"
            label="Sinopse"
            margin="normal"
            multiline
            rows="4"
            fullWidth
            variant="outlined"
            disabled={loading}
            error={errors.description !== undefined}
            helperText={errors.description && errors.description.message}
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                type="number"
                margin="normal"
                name="year_release"
                label="Ano de lançamento"
                fullWidth
                variant="outlined"
                inputRef={register}
                disabled={loading}
                error={errors.year_release !== undefined}
                helperText={errors.year_release && errors.year_release.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                margin="normal"
                name="duration"
                label="Duração"
                fullWidth
                inputRef={register}
                variant="outlined"
                disabled={loading}
                error={errors.duration !== undefined}
                helperText={errors.duration && errors.duration.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <CastMemberField
                ref={castMemberRef}
                castMembers={watch("cast_members")}
                setCastMembers={(value) =>
                  setValue("cast_members", value, true)
                }
                error={errors.cast_members}
                disabled={loading}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <GenreField
                ref={genreRef}
                genres={watch("genres")}
                setGenres={(value) => setValue("genres", value, true)}
                categories={watch("categories")}
                setCategories={(value) => setValue("categories", value, true)}
                error={errors.genres}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CategoryField
                ref={categoryRef}
                categories={watch("categories")}
                setCategories={(value) => setValue("categories", value, true)}
                genres={watch("genres")}
                error={errors.categories}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <RatingField
            value={watch("rating")}
            setValue={(value) => setValue("rating", value)}
            error={errors.rating}
            disabled={loading}
            FormControlProps={{ margin: isGreaterMd ? "none" : "normal" }}
          />

          <br />
          <Card className={classes.cardUpload}>
            <CardContent>
              <Typography color="primary" variant="h6">
                Imagens
              </Typography>
              <UploadField
                ref={uploadsRef.current["thumb_file"]}
                accept="image/*"
                label="Thump"
                setValue={(value) => setValue("thumb_file", value)}
              />
              <UploadField
                ref={uploadsRef.current["banner_file"]}
                accept="image/*"
                label="Banner"
                setValue={(value) => setValue("banner_file", value)}
              />
            </CardContent>
          </Card>
          <Card className={classes.cardUpload}>
            <CardContent>
              <Typography color="primary" variant="h6">
                Videos
              </Typography>
              <UploadField
                ref={uploadsRef.current["trailer_file"]}
                accept="video/mp4"
                label="Trailer"
                setValue={(value) => setValue("trailer_file", value)}
              />
              <UploadField
                ref={uploadsRef.current["video_file"]}
                accept="video/mp4"
                label="Principal"
                setValue={(value) => setValue("video_file", value)}
              />
            </CardContent>
          </Card>

          <Card className={classes.cardOpened}>
            <CardContent className={classes.cardContentOpened}>
              <Controller
                as={
                  <FormControlLabel
                    disabled={loading}
                    control={
                      <Checkbox
                        color="primary"
                        name="opened"
                        checked={watch("opened")}
                        onChange={(_, value) => setValue("opened", value)}
                      />
                    }
                    label={
                      <Typography color="primary" variant="subtitle2">
                        Quero que este conteúdo apareça na seção lançamentos
                      </Typography>
                    }
                    labelPlacement="end"
                  />
                }
                name="opened"
                control={control}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <SubmitActions
        disabledButtons={loading}
        handleSave={() => handleSubmit(onSubmit)()}
      />
    </DefaultForm>
  );
};
