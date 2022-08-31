import React, { useEffect, useState } from "react";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { format, parseISO } from "date-fns";

import { BadgeNo, BadgeYes } from "../../components/Badge";
import genreHttp from "../../util/http/genre-http";

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
        return categories.map((c) => c.name).join(", ");
      },
    },
  },
  {
    name: "is_active",
    label: "Ativo?",
    options: {
      customBodyRender(value) {
        return value ? <BadgeYes /> : <BadgeNo />;
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
    let isSubscribed = true;
    (async () => {
      const { data } = await genreHttp.list();
      if (isSubscribed) {
        setData(data.data);
      }
    })();

    return () => {
      isSubscribed = false;
    };
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
