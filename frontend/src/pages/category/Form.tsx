import React, { useContext, useEffect, useState } from "react";
import { Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import * as yup from "../../util/vendor/yup";
import { useParams, useHistory } from "react-router";
import { useSnackbar } from "notistack";

import categoryHttp from "../../util/http/category-http";
import { Category } from "../../util/models";
import DefaultForm from "../../components/DefaultForm";
import SubmitActions from "../../components/SubmitActions";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";
import LoadingContext from "../../components/loading/LoadingContext";

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
});

export const Form = () => {
  const {
    register,
    handleSubmit,
    errors,
    reset,
    watch,
    formState,
    setValue,
    control,
  } = useForm({
    validationSchema,
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  useSnackbarFormError(formState.submitCount, errors);

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const loading = useContext(LoadingContext);

  useEffect(() => {
    if (!id) {
      return;
    }
    (async function getCategory() {
      try {
        const { data } = await categoryHttp.get(id);
        setCategory(data.data);
        reset(data.data);
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      }
    })();
  }, [id, reset, enqueueSnackbar]);

  const onSubmit = async (formData, event) => {
    try {
      const http = !category
        ? categoryHttp.create(formData)
        : categoryHttp.update(category.id, formData);
      const { data } = await http;
      enqueueSnackbar("Categoria salva com sucesso", {
        variant: "success",
      });
      setTimeout(() => {
        event
          ? id
            ? history.replace(`/categories/${data.data.id}/edit`)
            : history.push(`/categories/${data.data.id}/edit`)
          : history.push("/categories");
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possivel salvar a categoria", {
        variant: "error",
      });
    }
  };

  return (
    <DefaultForm
      onSubmit={handleSubmit(onSubmit)}
      GridItemProps={{ xs: 12, md: 6 }}
    >
      <TextField
        inputRef={register}
        name="name"
        label="Nome"
        fullWidth
        variant="outlined"
        disabled={loading}
        error={errors.name !== undefined}
        helperText={errors.name && errors.name.message}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        inputRef={register}
        name="description"
        label="Descrição"
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <Controller
        as={
          <FormControlLabel
            disabled={loading}
            control={
              <Checkbox
                color="primary"
                name="is_active"
                checked={watch("is_active")}
                onChange={(_, value) => setValue("is_active", value)}
              />
            }
            label="Ativo?"
            labelPlacement="end"
          />
        }
        name="is_active"
        control={control}
      />
      <SubmitActions
        disabledButtons={loading}
        handleSave={() => handleSubmit(onSubmit)()}
      />
    </DefaultForm>
  );
};
