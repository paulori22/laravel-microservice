import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  AutocompleteProps,
  UseAutocompleteSingleProps,
} from "@material-ui/lab";
import { CircularProgress, TextField, TextFieldProps } from "@material-ui/core";
import { useDebounce } from "use-debounce/lib";

interface AsyncAutoCompleteProps {
  fetchOptions: (searchText) => Promise<any>;
  debounceTime?: number;
  TextFieldProps?: TextFieldProps;
  AutoCompleteProps?: Omit<AutocompleteProps<any>, "renderInput"> &
    UseAutocompleteSingleProps<any>;
}

const AsyncAutoComplete: React.FC<AsyncAutoCompleteProps> = (props) => {
  const { AutoCompleteProps, debounceTime = 300 } = props;
  const {
    onOpen,
    onClose,
    onInputChange,
    freeSolo = false,
  } = AutoCompleteProps as any;

  const [open, setOpen] = useState(false);
  const [searchText, setSerchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, debounceTime);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const textFieldProps: TextFieldProps = {
    margin: "normal",
    variant: "outlined",
    fullWidth: true,
    InputLabelProps: { shrink: true },
    ...(props.TextFieldProps && { ...props.TextFieldProps }),
  };

  const autocompleteProps: AutocompleteProps<any> = {
    loadingText: "Carregando...",
    noOptionsText: "Nenhum item encontrado",
    ...(props.AutoCompleteProps && { ...props.AutoCompleteProps }),
    open,
    options,
    loading,
    onOpen() {
      setOpen(true);
      onOpen && onOpen();
    },
    onClose() {
      setOpen(false);
      onClose && onClose();
    },
    onInputChange(event, value, reason) {
      setSerchText(value);
      onInputChange && onInputChange();
    },
    renderInput: (params) => (
      <TextField
        {...params}
        {...textFieldProps}
        InputProps={{
          ...params.InputProps,
          endAdornment: loading && (
            <>
              <CircularProgress color="inherit" size={20} />
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    ),
  };

  useEffect(() => {
    if (!open && !freeSolo) {
      setOptions([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || (debouncedSearchText === "" && freeSolo)) {
      return;
    }

    let isSubscribed = true;

    (async function getCategory() {
      setLoading(true);
      try {
        const data = await props.fetchOptions(debouncedSearchText);
        if (isSubscribed) {
          setOptions(data);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, [freeSolo ? debouncedSearchText : open]);

  return <Autocomplete {...autocompleteProps} />;
};

export default AsyncAutoComplete;
