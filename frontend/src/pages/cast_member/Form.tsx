import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonProps,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  Theme,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";

import * as yup from "../../util/vendor/yup";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

const castMembersType = [
  { label: "Diretor", value: "1" },
  { label: "Ator", value: "2" },
];

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
  type: yup.string().label("Tipo").required(),
});

export const Form = () => {
  const classes = useStyles();

  const { register, handleSubmit, control, setValue, errors, reset, watch } =
    useForm({
      validationSchema,
      defaultValues: {
        name: "",
        type: "",
      },
    });

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [castMember, setCastMember] = useState<{ id: string } | null>(null);
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
    castMemberHttp
      .get(id)
      .then(({ data }) => {
        setCastMember(data.data);
        reset(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = (formData, event) => {
    setLoading(true);
    const http = !castMember
      ? castMemberHttp.create(formData)
      : castMemberHttp.update(castMember.id, formData);

    http
      .then(({ data }) => {
        snackbar.enqueueSnackbar("Membro do Elenco salvo com sucesso", {
          variant: "success",
        });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/cast_members/${data.data.id}/edit`)
              : history.push(`/cast_members/${data.data.id}/edit`)
            : history.push("/cast_members");
        });
      })
      .catch((error) => {
        console.log(error);
        snackbar.enqueueSnackbar("Não foi possivel salvar a membro do elenco", {
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
      <Controller
        as={
          <FormControl
            component="fieldset"
            margin="normal"
            disabled={loading}
            error={errors.type !== undefined}
          >
            <FormLabel component="legend">Tipo</FormLabel>
            <RadioGroup
              aria-label="type"
              value={String(watch("type"))}
              onChange={(_, value) => setValue("type", value)}
            >
              {castMembersType.map((type) => {
                return (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio />}
                    label={type.label}
                  />
                );
              })}
            </RadioGroup>
            <FormHelperText>
              {errors.type && errors.type.message}
            </FormHelperText>
          </FormControl>
        }
        name="type"
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
