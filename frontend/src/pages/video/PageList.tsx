import { Box, Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import { Link } from "react-router-dom";
import { Page } from "../../components/Page";
import Table from "./Table";

const PageList = () => {
  return (
    <Page title="Listagem Videos">
      <Box dir="rtl" paddingBottom={2}>
        <Fab
          title="Adicionar Video"
          color="secondary"
          size="small"
          component={Link}
          to="/videos/create"
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
