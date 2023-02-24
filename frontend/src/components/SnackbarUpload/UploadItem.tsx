import React from "react";
import {
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import MovieIcon from "@material-ui/icons/Movie";

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    paddingTop: "7px",
    paddingBottom: "7px",
    height: "53px",
  },
  movieIcon: {
    color: theme.palette.error.main,
    minWidth: "40px",
  },
  listItemText: {
    marginLeft: "6px",
    marginRight: "24px",
    color: theme.palette.text.secondary,
  },
}));

interface UploadItemProps {
  id: string | number;
}

const UploadItem: React.FC<UploadItemProps> = (props) => {
  const classes = useStyles();

  return (
    <>
      <Tooltip
        title="Não foi possivel fazer o upload, clique para mais detalhes"
        placement="left"
      >
        <ListItem className={classes.listItem} button>
          <ListItemIcon className={classes.movieIcon}>
            <MovieIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primary={
              <Typography noWrap={true} variant="subtitle2" color="inherit">
                E o vento levou
              </Typography>
            }
          />
        </ListItem>
      </Tooltip>

      <Divider component="li" />
    </>
  );
};

export default UploadItem;
