import { Box } from "@material-ui/core";
import React from "react";
import { Navbar } from "./components/Navbar";
import { Page } from "./components/Page";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Box paddingTop={"70px"}>
        <Page title="Categorias">Conteudo</Page>
      </Box>
    </>
  );
};

export default App;
