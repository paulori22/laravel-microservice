import React, { useContext, useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";

import * as yup from "../../util/vendor/yup";
import { CastMember } from "../../util/models";
import SubmitActions from "../../components/SubmitActions";
import DefaultForm from "../../components/DefaultForm";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";
import LoadingContext from "../../components/loading/LoadingContext";

const castMembersType = [
  { label: "Diretor", value: "1" },
  { label: "Ator", value: "2" },
];

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
  type: yup.string().label("Tipo").required(),
});

export const Form = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState,
    errors,
    reset,
    watch,
  } = useForm({
    validationSchema,
    defaultValues: {
      name: "",
      type: "",
    },
  });

  useSnackbarFormError(formState.submitCount, errors);

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [castMember, setCastMember] = useState<CastMember | null>(null);
  const loading = useContext(LoadingContext);

  useEffect(() => {
    if (!id) {
      return;
    }
    castMemberHttp.get(id).then(({ data }) => {
      setCastMember(data.data);
      reset(data.data);
    });
  }, []);

  const onSubmit = (formData, event) => {
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
      });
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
      <SubmitActions
        disabledButtons={loading}
        handleSave={() => handleSubmit(onSubmit)()}
      />
    </DefaultForm>
  );
};
