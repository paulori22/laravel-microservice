import {
  FormControl,
  FormControlProps,
  FormHelperText,
  makeStyles,
  Theme,
  Typography,
  useTheme,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import React, {
  MutableRefObject,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";

import AsyncAutoComplete, {
  AsyncAutoCompleteComponent,
} from "../../../components/AsyncAutoComplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandler from "../../../hooks/useHttpHandler";
import categoryHttp from "../../../util/http/category-http";
import { getGenresFromCategory } from "../../../util/model-filters";
import { Genre } from "../../../util/models";

const useStyles = makeStyles((theme: Theme) => ({
  genresSubtitle: {
    color: grey["800"],
    fontSize: "0.8rem",
  },
}));
interface CategoryFieldProps {
  categories: any[];
  setCategories: (category) => void;
  genres: Genre[];
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

export interface CategoryFieldComponent {
  clear: () => void;
}

const CategoryField = React.forwardRef<
  CategoryFieldComponent,
  CategoryFieldProps
>((props, ref) => {
  const { categories, setCategories, genres, error, disabled } = props;
  const classes = useStyles();
  const { addItem, removeItem } = useCollectionManager(
    categories,
    setCategories
  );
  const autocompleteRef =
    useRef() as MutableRefObject<AsyncAutoCompleteComponent>;

  const autocompleteHttp = useHttpHandler();
  const theme = useTheme();
  const fetchOptions = useCallback(
    () =>
      autocompleteHttp(
        categoryHttp.list({
          queryParams: {
            genres: genres.map((genre) => genre.id).join(","),
            all: "",
          },
        })
      ).then((data) => data.data),
    [autocompleteHttp]
  );

  useImperativeHandle(ref, () => ({
    clear: () => autocompleteRef.current.clear(),
  }));

  return (
    <>
      <AsyncAutoComplete
        ref={autocompleteRef}
        fetchOptions={fetchOptions}
        AutoCompleteProps={{
          //autoSelect: true,
          clearOnEscape: true,
          getOptionLabel(option) {
            return option.name;
          },
          getOptionSelected: (option, value) => option.id === value.id,
          onChange: (_, value) => addItem(value),
          disabled: disabled === true || !genres.length,
        }}
        TextFieldProps={{
          label: "Categorias",
          error: error !== undefined,
        }}
      />
      <FormHelperText style={{ height: theme.spacing(3) }}>
        Escolha pelo menos uma categoria de cada gênero
      </FormHelperText>
      <FormControl
        margin="normal"
        fullWidth
        disabled={disabled === true}
        error={error !== undefined}
        {...props.FormControlProps}
      >
        <GridSelected>
          {categories.map((category, index) => {
            const genreFromCategory = getGenresFromCategory(genres, category)
              .map((genre) => genre.name)
              .join(",");
            return (
              <GridSelectedItem
                key={index}
                onDelete={() => {
                  removeItem(category);
                }}
                xs={12}
              >
                <Typography noWrap={true}>{category.name}</Typography>
                <Typography noWrap={true} className={classes.genresSubtitle}>
                  Genêros: {genreFromCategory}
                </Typography>
              </GridSelectedItem>
            );
          })}
        </GridSelected>
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    </>
  );
});

export default CategoryField;
