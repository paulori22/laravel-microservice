import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import * as yup from "../../util/vendor/yup";
import { useParams, useHistory } from "react-router";
import { useSnackbar } from "notistack";

import categoryHttp from "../../util/http/category-http";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
});

export const Form = () => {
  const classes = useStyles();

  const {
    register,
    handleSubmit,
    errors,
    reset,
    watch,
    setValue,
    getValues,
    control,
  } = useForm({
    validationSchema,
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [category, setCategory] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const buttonProps: ButtonProps = {
    className: classes.submit,
    color: "secondary",
    variant: "contained",
    disabled: loading,
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    categoryHttp
      .get(id)
      .then(({ data }) => {
        setCategory(data.data);
        reset(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = (formData, event) => {
    setLoading(true);
    const http = !category
      ? categoryHttp.create(formData)
      : categoryHttp.update(category.id, formData);

    http
      .then(({ data }) => {
        snackbar.enqueueSnackbar("Categoria salva com sucesso", {
          variant: "success",
        });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/categories/${data.data.id}/edit`)
              : history.push(`/categories/${data.data.id}/edit`)
            : history.push("/categories");
        });
      })
      .catch((error) => {
        console.log(error);
        snackbar.enqueueSnackbar("Não foi possivel salvar a categoria", {
          variant: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
      <Box dir="rtl">
        <Button {...buttonProps} onClick={() => handleSubmit(onSubmit)()}>
          Salvar
        </Button>
        <Button {...buttonProps} type="submit">
          Salvar e continuar editando
        </Button>
      </Box>
    </form>
  );
};
