import React from "react";

import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import ClearAllIcon from "@material-ui/icons/ClearAll";

const useStyles = makeStyles((theme) => ({
  iconButton: (theme as any).overrides.MUIDataTableToolbar.icon,
}));

interface FilterResetButtonsProps {
  handleClick: () => void;
}

export const FilterResetButton: React.FC<FilterResetButtonsProps> = ({
  handleClick,
}) => {
  const classes = useStyles();
  return (
    <Tooltip title="Limpar Busca">
      <IconButton className={classes.iconButton} onClick={handleClick}>
        <ClearAllIcon />
      </IconButton>
    </Tooltip>
  );
};

export default FilterResetButton;
