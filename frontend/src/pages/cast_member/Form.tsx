import React from "react";
import {
  Box,
  Button,
  ButtonProps,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  Theme,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";

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

export const Form = () => {
  const classes = useStyles();
  const buttonProps: ButtonProps = {
    className: classes.submit,
    variant: "outlined",
  };

  const { register, handleSubmit, control, setValue } = useForm({
    defaultValues: {
      name: "",
      type: "",
    },
  });

  const onSubmit = (formData, event) => {
    castMemberHttp.create(formData).then((response) => console.log(response));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        inputRef={register}
        name="name"
        label="Nome"
        fullWidth
        variant="outlined"
      />
      <Controller
        as={
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Tipo</FormLabel>
            <RadioGroup
              aria-label="type"
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
