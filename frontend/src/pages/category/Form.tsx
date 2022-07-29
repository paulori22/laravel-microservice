import React from "react";
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import categoryHttp from "../../util/http/category-http";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

export const Form = () => {
  const classes = useStyles();
  const buttonProps: ButtonProps = {
    className: classes.submit,
    variant: "outlined",
  };

  const { register, handleSubmit } = useForm({
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = (formData, event) => {
    console.log(event);
    categoryHttp.create(formData).then((response) => console.log(response));
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
      <TextField
        inputRef={register}
        name="description"
        label="Descrição"
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        margin="normal"
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
