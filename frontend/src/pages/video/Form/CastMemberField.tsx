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
import castMemberHttp from "../../../util/http/cast-member-http";

interface CastMemberFieldFieldProps {
  castMembers: any[];
  setCastMembers: (category) => void;
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

const CastMemberField: React.FC<CastMemberFieldFieldProps> = (props) => {
  const { castMembers, setCastMembers, error, disabled } = props;
  const { addItem, removeItem } = useCollectionManager(
    castMembers,
    setCastMembers
  );

  const autocompleteHttp = useHttpHandler();
  const fetchOptions = (searchText) =>
    autocompleteHttp(
      castMemberHttp.list({
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
          //autoSelect: true,
          clearOnEscape: true,
          getOptionLabel(option) {
            return option.name;
          },
          getOptionSelected: (option, value) => option.id === value.id,
          onChange: (_, value) => addItem(value),
          disabled,
        }}
        TextFieldProps={{
          label: "Elenco",
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
          {castMembers.map((castMember, index) => {
            return (
              <GridSelectedItem
                key={index}
                onDelete={() => {
                  removeItem(castMember);
                }}
                xs={12}
              >
                <Typography noWrap={true}>{castMember.name}</Typography>
              </GridSelectedItem>
            );
          })}
        </GridSelected>
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default CastMemberField;
