import {
  FormControl,
  FormControlProps,
  FormHelperText,
  Typography,
  useTheme,
} from "@material-ui/core";
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
import genreHttp from "../../../util/http/genre-http";
import { getGenresFromCategory } from "../../../util/model-filters";

interface GenreFieldProps {
  genres: any[];
  setGenres: (genres) => void;
  categories: any[];
  setCategories: (categories) => void;
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

export interface GenreFieldComponent {
  clear: () => void;
}

const GenreField = React.forwardRef<GenreFieldComponent, GenreFieldProps>(
  (props, ref) => {
    const { genres, setGenres, error, disabled, categories, setCategories } =
      props;
    const { addItem, removeItem } = useCollectionManager(genres, setGenres);
    const { removeItem: removeCategory } = useCollectionManager(
      categories,
      setCategories
    );
    const autocompleteRef =
      useRef() as MutableRefObject<AsyncAutoCompleteComponent>;

    const autocompleteHttp = useHttpHandler();
    const theme = useTheme();
    const fetchOptions = useCallback(
      (searchText) =>
        autocompleteHttp(
          genreHttp.list({
            queryParams: {
              searchText,
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
            freeSolo: true,
            getOptionLabel(option) {
              return option.name;
            },
            getOptionSelected: (option, value) => option.id === value.id,
            onChange: (_, value) => addItem(value),
            disabled,
          }}
          TextFieldProps={{
            label: "Gêneros",
            error: error !== undefined,
          }}
        />
        <FormHelperText style={{ height: theme.spacing(3) }}>
          Escolha os gêneros do vídeo
        </FormHelperText>
        <FormControl
          margin="normal"
          fullWidth
          disabled={disabled === true}
          error={error !== undefined}
          {...props.FormControlProps}
        >
          <GridSelected>
            {genres.map((genre, index) => (
              <GridSelectedItem
                key={index}
                onDelete={() => {
                  const categoriesWithOneGenre = categories.filter(
                    (category) => {
                      const genresFromCategory = getGenresFromCategory(
                        genres,
                        category
                      );
                      return (
                        genresFromCategory.length === 1 &&
                        genresFromCategory[0].id === genre.id
                      );
                    }
                  );
                  categoriesWithOneGenre.forEach((category) =>
                    removeCategory(category)
                  );
                  removeItem(genre);
                }}
                xs={12}
              >
                <Typography noWrap={true}>{genre.name}</Typography>
              </GridSelectedItem>
            ))}
          </GridSelected>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      </>
    );
  }
);

export default GenreField;
