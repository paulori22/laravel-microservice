import React, { useEffect, useState } from "react";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { format, parseISO } from "date-fns";

import categoryHttp from "../../util/http/category-http";
import { BadgeNo, BadgeYes } from "../../components/Badge";
import { Category, ListReponse } from "../../util/models";

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

type TableProps = {};

export const Table: React.FC<TableProps> = (props) => {
  const [data, setData] = useState<Category[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      const { data } = await categoryHttp.list<ListReponse<Category>>();
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
      title="Listagem de categorias"
      columns={columnsDefinition}
      data={data}
    />
  );
};

export default Table;
