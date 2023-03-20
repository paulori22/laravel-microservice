import React, { useState } from "react";
import {
  Card,
  CardActions,
  Collapse,
  IconButton,
  List,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useSnackbar } from "notistack";
import classnames from "classnames";
import { useSelector } from "react-redux";
import { Upload, UploadModule } from "../../store/upload/types";
import { countInProgress } from "../../store/upload/getters";
import UploadItem from "./UploadItem";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    width: 450,
  },
  cardActionsRoot: {
    padding: "8px 8px 8px 16px",
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
  },
  icons: {
    marginLeft: "auto !important",
    color: theme.palette.primary.contrastText,
  },
  expand: {
    tranform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    tranform: "rotate(180deg)",
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

interface SnackbarUploadProps {
  id: string | number;
}

const SnackbarUpload = React.forwardRef<any, SnackbarUploadProps>(
  (props, ref) => {
    const classes = useStyles();
    const { id } = props;
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState(true);

    const uploads = useSelector<UploadModule, Upload[]>(
      (state) => state.upload.uploads
    );

    const totalInProgress = countInProgress(uploads);

    return (
      <Card ref={ref} className={classes.card}>
        <CardActions classes={{ root: classes.cardActionsRoot }}>
          <Typography variant="subtitle2" className={classes.title}>
            Fazendo upload de {totalInProgress} vídeos
          </Typography>
          <div className={classes.icons}>
            <IconButton
              color="inherit"
              onClick={() => setExpanded(!expanded)}
              className={classnames(classes.expand, {
                [classes.expandOpen]: !expanded,
              })}
            >
              <ExpandMoreIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => closeSnackbar(id)}>
              <CloseIcon />
            </IconButton>
          </div>
        </CardActions>
        <Collapse in={expanded}>
          <List className={classes.list}>
            {uploads.map((upload, key) => (
              <UploadItem key={key} upload={upload} />
            ))}
          </List>
        </Collapse>
      </Card>
    );
  }
);

export default SnackbarUpload;
