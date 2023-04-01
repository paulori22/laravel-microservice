import React, { useContext, useEffect, useState } from "react";
import {
  ButtonProps,
  Checkbox,
  makeStyles,
  MenuItem,
  TextField,
  Theme,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import genreHttp from "../../util/http/genre-http";
import categoryHttp from "../../util/http/category-http";

import * as yup from "../../util/vendor/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router";
import { Category } from "../../util/models";
import SubmitActions from "../../components/SubmitActions";
import DefaultForm from "../../components/DefaultForm";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";
import LoadingContext from "../../components/loading/LoadingContext";

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

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
  categories_id: yup.array(yup.string()).label("Categorias").required(),
});

export const Form = () => {
  const classes = useStyles();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState,
    errors,
    reset,
  } = useForm({
    validationSchema,
    defaultValues: {
      name: "",
      is_active: true,
      categories_id: [],
    },
  });
  useSnackbarFormError(formState.submitCount, errors);

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [genre, setGenre] = useState<{ id: string } | null>(null);
  const loading = useContext(LoadingContext);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      const promisses = [categoryHttp.list({ queryParams: { all: "" } })];
      if (id) {
        promisses.push(genreHttp.get(id));
      }
      try {
        const [categoriesResponse, genreResponse] = await Promise.all(
          promisses
        );
        if (isSubscribed) {
          setCategories(categoriesResponse.data.data);
          if (id) {
            setGenre(genreResponse.data.data);
            const { categories } = genreResponse.data.data;
            const categories_id = categories.map((category) => category.id);
            reset({ ...genreResponse.data.data, categories_id });
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Não foi possivel carregar as informações", {
          variant: "error",
        });
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [id, reset, enqueueSnackbar]);

  const selectedCategories = watch("categories_id", []);

  const onSubmit = (formData, event) => {
    const http = !genre
      ? genreHttp.create(formData)
      : genreHttp.update(genre.id, formData);

    http
      .then(({ data }) => {
        enqueueSnackbar("Gênero salvo com sucesso", {
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
        enqueueSnackbar("Não foi possivel salvar o gênero", {
          variant: "error",
        });
      });
  };

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryHttp.list().then((response) => {
      setCategories(response.data.data);
    });
    return () => {};
  }, []);

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
      <SubmitActions
        disabledButtons={loading}
        handleSave={() => handleSubmit(onSubmit)()}
      />
    </DefaultForm>
  );
};
