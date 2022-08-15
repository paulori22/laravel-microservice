import React from "react";
import {
  SnackbarProvider as NotistackProvider,
  SnackbarProviderProps,
} from "notistack";
import { IconButton, makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => {
  return {
    variantSucess: {
      backgroundColor: theme.palette.success.main,
    },
    variantError: {
      backgroundColor: theme.palette.error.main,
    },
    variantInfo: {
      backgroundColor: theme.palette.primary.main,
    },
  };
});

export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {
  let snackbarProviderRef;
  const classes = useStyles();
  const defaultProps: SnackbarProviderProps = {
    classes,
    autoHideDuration: 3000,
    maxSnack: 3,
    anchorOrigin: {
      horizontal: "right",
      vertical: "top",
    },
    ref: (el) => {
      snackbarProviderRef = el;
    },
    action: () => (
      <IconButton
        color="inherit"
        style={{ fontSize: 20 }}
        onClick={(key) => snackbarProviderRef.closeSnackbar(key)}
      >
        <CloseIcon />
      </IconButton>
    ),
  };
  const newProps = { ...defaultProps, ...props };
  return <NotistackProvider {...newProps}>{props.children}</NotistackProvider>;
};
