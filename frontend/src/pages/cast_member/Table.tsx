import React, { useEffect, useState } from "react";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { format, parseISO } from "date-fns";

import castMemberHttp from "../../util/http/cast-member-http";
import { CastMember } from "../../util/models";

const castMembersOptions = {
  1: "1 - Diretor",
  2: "2 - Ator",
};

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: "name",
    label: "Nome",
  },
  {
    name: "type",
    label: "Tipo",
    options: {
      customBodyRender(value) {
        return value in castMembersOptions ? castMembersOptions[value] : null;
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
  const [data, setData] = useState<CastMember[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      const { data } = await castMemberHttp.list();
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
      title="Listagem de Membros do Elenco"
      columns={columnsDefinition}
      data={data}
    />
  );
};

export default Table;
