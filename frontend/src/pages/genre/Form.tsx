import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  makeStyles,
  MenuItem,
  TextField,
  Theme,
} from "@material-ui/core";
import { Controller, FieldError, useForm } from "react-hook-form";
import genreHttp from "../../util/http/genre-http";
import categoryHttp from "../../util/http/category-http";

import * as yup from "../../util/vendor/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
    chips: {
      display: "flex",
      flexWrap: "wrap",
    },
    chip: {
      margin: 2,
    },
  };
});

type Category = {
  id: string;
  name: string;
};

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
  categories_id: yup.array(yup.string()).label("Categorias").required(),
});

export const Form = () => {
  const classes = useStyles();

  const { register, handleSubmit, control, setValue, watch, errors, reset } =
    useForm({
      validationSchema,
      defaultValues: {
        name: "",
        is_active: true,
        categories_id: [],
      },
    });

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [genre, setGenre] = useState<{ id: string } | null>(null);
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
    genreHttp
      .get(id)
      .then(({ data }) => {
        setGenre(data.data);
        const { categories } = data.data;
        const categories_id = categories.map((category) => category.id);
        reset({ ...data.data, categories_id });
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCategories = watch("categories_id", []);

  const onSubmit = (formData, event) => {
    const http = !genre
      ? genreHttp.create(formData)
      : genreHttp.update(genre.id, formData);

    http
      .then(({ data }) => {
        snackbar.enqueueSnackbar("Gênero salvo com sucesso", {
          variant: "success",
        });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/genres/${data.data.id}/edit`)
              : history.push(`/genres/${data.data.id}/edit`)
            : history.push("/genres");
        });
      })
      .catch((error) => {
        console.log(error);
        snackbar.enqueueSnackbar("Não foi possivel salvar o gênero", {
          variant: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryHttp.list().then((response) => {
      setCategories(response.data.data);
    });
    return () => {};
  }, []);

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
      <Controller
        as={
          <TextField
            select
            name="categories_id"
            value={selectedCategories}
            label="Categorias"
            margin={"normal"}
            variant={"outlined"}
            fullWidth
            disabled={loading}
            error={errors.categories_id !== undefined}
            helperText={
              errors.categories_id && (errors.categories_id as any).message
            }
            InputLabelProps={{ shrink: true }}
            onChange={(e) => {
              setValue("categories_id", e.target.value as any);
            }}
            SelectProps={{
              multiple: true,
            }}
          >
            <MenuItem value="" disabled>
              <em>Selecione categorias</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        }
        name="categories_id"
        control={control}
      />
      <Checkbox inputRef={register} name="is_active" defaultChecked />
      Ativo
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
