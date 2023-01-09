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
import genreHttp from "../../../util/http/genre-http";

interface GenreFieldProps {
  genres: any[];
  setGenres: (genres) => void;
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

const GenreField: React.FC<GenreFieldProps> = (props) => {
  const { genres, setGenres, error, disabled } = props;
  const { addItem, removeItem } = useCollectionManager(genres, setGenres);

  const autocompleteHttp = useHttpHandler();
  const fetchOptions = (searchText) =>
    autocompleteHttp(
      genreHttp.list({
        queryParams: {
          searchText,
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
          freeSolo: true,
          getOptionLabel(option) {
            return option.name;
          },
          onChange: (_, value) => addItem(value),
          disabled,
        }}
        TextFieldProps={{
          label: "Gêneros",
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
          {genres.map((genre, index) => (
            <GridSelectedItem key={index} onClick={() => {}} xs={12}>
              <Typography noWrap={true}>{genre.name}</Typography>
            </GridSelectedItem>
          ))}
        </GridSelected>
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default GenreField;
