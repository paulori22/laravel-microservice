import React, { useState } from "react";
import {
  IconButton,
  makeStyles,
  Menu as MuiMenu,
  MenuItem,
  Theme,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

export const Menu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleOpen}
      >
        <MenuIcon />
      </IconButton>
      <MuiMenu
        id="menu-appbar"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={handleClose}>Categorias</MenuItem>
      </MuiMenu>
    </>
  );
};
