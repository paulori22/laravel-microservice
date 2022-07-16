import React from "react";
import { Box, Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { Link } from "react-router-dom";
import { Page } from "../../components/Page";
import Table from "./Table";

const PageList = () => {
  return (
    <Page title="Listagem Membros do Elenco">
      <Box dir="rtl">
        <Fab
          title="Adicionar Membro do Elenco"
          size="small"
          component={Link}
          to="/cast_members/create"
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
