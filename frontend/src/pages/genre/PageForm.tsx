import React from "react";
import { useParams } from "react-router";

import { Page } from "../../components/Page";
import { Form } from "./Form";

const PageForm = () => {
  const { id } = useParams();
  return (
    <Page title={!id ? "Criar Gêneros" : "Editar Gênero"}>
      <Form />
    </Page>
  );
};

export default PageForm;
