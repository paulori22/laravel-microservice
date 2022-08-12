import { Chip } from "@material-ui/core";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

import categoryHttp from "../../util/http/category-http";
import { BadgeNo, BadgeYes } from "../../components/Badge";

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: "name",
    label: "Nome",
  },
  {
    name: "is_active",
    label: "Ativo?",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value ? <BadgeYes /> : <BadgeNo />;
      },
    },
  },
  {
    name: "created_at",
    label: "Criado em",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>;
      },
    },
  },
];

interface Category {
  id: string;
  name: string;
}

type TableProps = {};

export const Table: React.FC<TableProps> = (props) => {
  const [data, setData] = useState<Category[]>([]);

  useEffect(() => {
    categoryHttp
      .list<{ data: Category[] }>()
      .then((response) => setData(response.data.data));
  }, []);

  return (
    <MUIDataTable
      title="Listagem de categorias"
      columns={columnsDefinition}
      data={data}
    />
  );
};

export default Table;
