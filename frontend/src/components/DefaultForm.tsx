import React from "react";
import { Grid, GridProps, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme, any>((theme) => ({
  gridItem: {
    padding: theme.spacing(1, 0),
  },
}));

interface DefaultFormProps
  extends React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  > {
  GridContainerProps?: GridProps;
  GridItemProps?: GridProps;
}

const DefaultForm: React.FC<DefaultFormProps> = (props) => {
  const classes = useStyles();
  const { GridContainerProps, GridItemProps, ...other } = props;
  return (
    <form {...other}>
      <Grid container {...GridContainerProps}>
        <Grid className={classes.gridItem} item {...GridItemProps}>
          {props.children}
        </Grid>
      </Grid>
    </form>
  );
};

export default DefaultForm;
