import {
  FormControl,
  FormControlProps,
  FormHelperText,
  Typography,
} from "@material-ui/core";
import React from "react";

import AsyncAutoComplete from "../../../components/AsyncAutoComplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandler from "../../../hooks/useHttpHandler";
import categoryHttp from "../../../util/http/category-http";
import { Genre } from "../../../util/models";

interface CategoryFieldProps {
  categories: any[];
  setCategories: (category) => void;
  genres: Genre[];
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
  const { categories, setCategories, genres, error, disabled } = props;
  const { addItem, removeItem } = useCollectionManager(
    categories,
    setCategories
  );

  const autocompleteHttp = useHttpHandler();
  const fetchOptions = () =>
    autocompleteHttp(
      categoryHttp.list({
        queryParams: {
          genres: genres.map((genre) => genre.id).join(","),
          all: "",
        },
      })
    ).then((data) => data.data);

  return (
    <>
      <AsyncAutoComplete
        fetchOptions={fetchOptions}
        AutoCompleteProps={{
          autoSelect: true,
          clearOnEscape: true,
          getOptionLabel(option) {
            return option.name;
          },
          onChange: (_, value) => addItem(value),
          disabled: disabled === true || !genres.length,
        }}
        TextFieldProps={{
          label: "Categorias",
          error: error !== undefined,
        }}
      />
      <FormControl
        margin="normal"
        fullWidth
        disabled={disabled === true}
        error={error !== undefined}
        {...props.FormControlProps}
      >
        <GridSelected>
          {categories.map((category, index) => (
            <GridSelectedItem key={index} onClick={() => {}} xs={12}>
              <Typography noWrap={true}>{category.name}</Typography>
            </GridSelectedItem>
          ))}
        </GridSelected>
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default CategoryField;
