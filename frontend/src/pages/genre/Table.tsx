import React, { useEffect, useState } from "react";
import { Chip } from "@material-ui/core";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { format, parseISO } from "date-fns";

import { httpVideo } from "../../util/http";

type Category = {
  id: string;
  name: string;
  is_active: string;
};

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: "name",
    label: "Nome",
  },
  {
    name: "categories",
    label: "Categorias",
    options: {
      customBodyRender(categories: Category[]) {
        return categories.map((c) => c.name).join(",");
      },
    },
  },
  {
    name: "is_active",
    label: "Ativo?",
    options: {
      customBodyRender(value) {
        return value ? (
          <Chip label="Sim" color="primary" />
        ) : (
          <Chip label="Não" color="secondary" />
        );
      },
    },
  },
  {
    name: "created_at",
    label: "Criado em",
    options: {
      customBodyRender(value) {
        return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>;
      },
    },
  },
];

type TableProps = {};

export const Table: React.FC<TableProps> = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    httpVideo.get("genres").then((response) => setData(response.data.data));
  }, []);

  return (
    <MUIDataTable
      title="Listagem de Gêneros"
      columns={columnsDefinition}
      data={data}
    />
  );
};

export default Table;
