import { Box, Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import { Link } from "react-router-dom";
import { Page } from "../../components/Page";
import Table from "./Table";

const PageList = () => {
  return (
    <Page title="Listagem Categorias">
      <Box dir="rtl" paddingBottom={2}>
        <Fab
          title="Adicionar categorias"
          color="secondary"
          size="small"
          component={Link}
          to="/categories/create"
        >
          <AddIcon />
        </Fab>
      </Box>
      <Box>
        <Table />
      </Box>
    </Page>
  );
};

export default PageList;
