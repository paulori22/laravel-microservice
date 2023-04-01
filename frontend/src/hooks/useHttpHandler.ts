import Axios from "axios";
import { useSnackbar } from "notistack";
import { useCallback } from "react";

const useHttpHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  return useCallback(
    async (request: Promise<any>) => {
      try {
        const { data } = await request;
        return data;
      } catch (error) {
        if (!Axios.isCancel(error)) {
          enqueueSnackbar("Não foi possível carregar as informações", {
            variant: "error",
          });
          return;
        }

        throw error;
      }
    },
    [enqueueSnackbar]
  );
};

export default useHttpHandler;
