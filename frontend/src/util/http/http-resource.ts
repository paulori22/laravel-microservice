import {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";
import axios from "axios";
import { objectToFormData } from "object-to-formdata";

export default class HttpResource {
  private cancelList: CancelTokenSource | null = null;

  constructor(protected http: AxiosInstance, protected resource) {}

  list<T = any>(options?: { queryParams? }): Promise<AxiosResponse<T>> {
    if (this.cancelList) {
      this.cancelList.cancel("list request canceled");
    }
    this.cancelList = axios.CancelToken.source();

    const config: AxiosRequestConfig = {
      cancelToken: this.cancelList.token,
    };
    if (options && options.queryParams) {
      config.params = options.queryParams;
    }
    return this.http.get<T>(this.resource, config);
  }

  get<T = any>(id) {
    return this.http.get<T>(`${this.resource}/${id}`);
  }

  create<T = any>(data) {
    const sendData = this.makeSendData(data);
    return this.http.post<T>(this.resource, sendData);
  }

  update<T = any>(id, data, options?: { http?: { usePost: boolean } }) {
    let sendData = data;
    if (this.containsFile(data)) {
      sendData = this.getFormData(data);
    }
    const { http } = (options || {}) as any;
    return !options || !http || !http.usePost
      ? this.http.put<T>(`${this.resource}/${id}`, sendData)
      : this.http.post<T>(`${this.resource}/${id}`, sendData);
  }

  delete<T = any>(id) {
    return this.http.delete<T>(`${this.resource}/${id}`);
  }

  deleteCollection<T = any>(queryParams): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {};
    if (queryParams) {
      config["params"] = queryParams;
    }
    return this.http.delete<T>(`${this.resource}`, config);
  }

  isCanceledRequest(error) {
    return axios.isCancel(error);
  }

  private makeSendData(data) {
    return this.containsFile(data) ? this.getFormData(data) : data;
  }

  private containsFile(data) {
    return (
      Object.values(data).filter((field) => field instanceof File).length !== 0
    );
  }

  private getFormData(data) {
    return objectToFormData(data, { booleansAsIntegers: true });
  }
}
