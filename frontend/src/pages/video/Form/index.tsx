import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonProps,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Controller, FieldError, useForm } from "react-hook-form";
import videoHttp from "../../../util/http/video-http";
import categoryHttp from "../../../util/http/category-http";

import * as yup from "../../../util/vendor/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router";

import SubmitActions from "../../../components/SubmitActions";
import DefaultForm from "../../../components/DefaultForm";
import RatingField from "./RatingField";
import UploadField from "./UploadField";
import { VideoFileFieldsMap } from "../../../util/models";

const useStyles = makeStyles((theme: Theme) => ({
  cardUpload: {
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    margin: theme.spacing(2, 0),
  },
}));

const validationSchema = yup.object().shape({
  title: yup.string().label("Título").required().max(255),
  description: yup.string().label("Sinopse").required(),
  year_release: yup.number().label("Ano de lançamento").required().min(1),
  duration: yup.number().label("Duração").required().min(1),
  /*   cast_members: yup.array().label("Elenco").required(),
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
  categories: yup.array().label("Categorias").required(), */
  rating: yup.string().label("Classificação").required(),
});

const fileFields = Object.keys(VideoFileFieldsMap);

export const Form = () => {
  const { register, handleSubmit, control, setValue, watch, errors, reset } =
    useForm<{
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

  const classes = useStyles();
  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [genre, setGenre] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isGreaterMd = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    ["rating", "opened", ...fileFields].forEach((name) => register({ name }));
  }, [register]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      setLoading(true);
      const promisses = [categoryHttp.list({ queryParams: { all: "" } })];
      if (id) {
        promisses.push(videoHttp.get(id));
      }
      try {
        const [categoriesResponse, genreResponse] = await Promise.all(
          promisses
        );
        if (isSubscribed) {
          if (id) {
            setGenre(genreResponse.data.data);
            const { categories } = genreResponse.data.data;
            const categories_id = categories.map((category) => category.id);
            reset({ ...genreResponse.data.data, categories_id });
          }
        }
      } catch (error) {
        console.error(error);
        snackbar.enqueueSnackbar("Não foi possivel carregar as informações", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const onSubmit = (formData, event) => {
    const http = !genre
      ? videoHttp.create(formData)
      : videoHttp.update(genre.id, formData);

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
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            as={
              <RatingField
                value={watch("rating")}
                setValue={(value) => setValue("rating", value)}
                error={errors.rating}
                disabled={loading}
                FormControlProps={{ margin: isGreaterMd ? "none" : "normal" }}
              />
            }
            name="rating"
            control={control}
          />
          <br />
          <Card className={classes.cardUpload}>
            <CardContent>
              <Typography color="primary" variant="h6">
                Imagens
              </Typography>
              <UploadField
                accept="image/*"
                label="Thump"
                setValue={(value) => setValue("thumb_file", value)}
              />
              <UploadField
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
                accept="video/mp4"
                label="Trailer"
                setValue={(value) => setValue("trailer_file", value)}
              />
              <UploadField
                accept="video/mp4"
                label="Principal"
                setValue={(value) => setValue("video_file", value)}
              />
            </CardContent>
          </Card>

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
        </Grid>
      </Grid>
      <SubmitActions
        disabledButtons={loading}
        handleSave={() => handleSubmit(onSubmit)()}
      />
    </DefaultForm>
  );
};
