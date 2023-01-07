import Axios from "axios";
import { useSnackbar } from "notistack";

const useHttpHandler = () => {
  const snackbar = useSnackbar();
  return async (request: Promise<any>) => {
    try {
      const { data } = await request;
      return data;
    } catch (error) {
      if (!Axios.isCancel(error)) {
        snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
        return;
      }

      throw error;
    }
  };
};

export default useHttpHandler;
