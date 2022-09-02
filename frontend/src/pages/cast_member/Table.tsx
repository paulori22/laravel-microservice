import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

import castMemberHttp from "../../util/http/cast-member-http";
import { CastMember } from "../../util/models";
import DefaultTable, {
  makeActionsStyles,
  TableColumn,
} from "../../components/Table";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { Link } from "react-router-dom";

const castMembersOptions = {
  1: "1 - Diretor",
  2: "2 - Ator",
};

const columnsDefinition: TableColumn[] = [
  {
    name: "id",
    label: "ID",
    width: "30%",
    options: {
      sort: false,
    },
  },
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
  {
    name: "actions",
    label: "Ações",
    width: "13%",
    options: {
      sort: false,
      customBodyRender: (_, tableMeta) => {
        return (
          <IconButton
            color="secondary"
            component={Link}
            to={`/cast_members/${tableMeta.rowData[0]}/edit`}
          >
            <EditIcon />
          </IconButton>
        );
      },
    },
  },
];

export const Table: React.FC = () => {
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
    <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title="Listagem de Membros do Elenco"
        columns={columnsDefinition}
        data={data}
      />
    </MuiThemeProvider>
  );
};

export default Table;
