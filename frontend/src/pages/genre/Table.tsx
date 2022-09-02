import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

import { BadgeNo, BadgeYes } from "../../components/Badge";
import genreHttp from "../../util/http/genre-http";
import DefaultTable, {
  makeActionsStyles,
  TableColumn,
} from "../../components/Table";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { Link } from "react-router-dom";

type Category = {
  id: string;
  name: string;
  is_active: string;
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
            to={`/genres/${tableMeta.rowData[0]}/edit`}
          >
            <EditIcon />
          </IconButton>
        );
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
    <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title="Listagem de Gêneros"
        columns={columnsDefinition}
        data={data}
      />
    </MuiThemeProvider>
  );
};

export default Table;
