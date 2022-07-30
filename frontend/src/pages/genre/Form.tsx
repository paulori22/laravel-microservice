import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Input,
  InputLabel,
  makeStyles,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import genreHttp from "../../util/http/genre-http";
import categoryHttp from "../../util/http/category-http";

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

export const Form = () => {
  const classes = useStyles();

  const buttonProps: ButtonProps = {
    className: classes.submit,
    variant: "outlined",
  };

  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      is_active: true,
      categories_id: [],
    },
  });

  const selectedCategories = watch("categories_id", []);

  const onSubmit = (formData, event) => {
    genreHttp.create(formData).then((response) => console.log(response));
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
            onChange={(e) => {
              console.log(e.target.value);
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
