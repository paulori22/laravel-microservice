import React, { useEffect, useReducer, useRef, useState } from "react";
import { format, parseISO } from "date-fns";

import categoryHttp from "../../util/http/category-http";
import { BadgeNo, BadgeYes } from "../../components/Badge";
import { Category, ListReponse } from "../../util/models";
import DefaultTable, {
  makeActionsStyles,
  TableColumn,
} from "../../components/Table";
import { useSnackbar } from "notistack";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { Link } from "react-router-dom";
import FilterResetButton from "../../components/Table/FilterResetButton";
import reducer, { INITIAL_STATE, Creators } from "../../store/filter";

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
    width: "43%",
  },
  {
    name: "is_active",
    label: "Ativo?",
    width: "4%",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value ? <BadgeYes /> : <BadgeNo />;
      },
    },
  },
  {
    name: "created_at",
    label: "Criado em",
    width: "10%",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
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
            to={`/categories/${tableMeta.rowData[0]}/edit`}
          >
            <EditIcon />
          </IconButton>
        );
      },
    },
  },
];

export const Table: React.FC = () => {
  const snackbar = useSnackbar();

  const subscribed = useRef(true);
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterState, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [totalRecords, setTotalRecords] = useState(0);

  const columns = columnsDefinition.map((column) => {
    return column.name === filterState.order.sort
      ? {
          ...column,
          options: {
            ...column.options,
            sortDirection: filterState.order.dir as any,
          },
        }
      : column;
  });

  useEffect(() => {
    subscribed.current = true;
    getData();
    return () => {
      subscribed.current = false;
    };
  }, [
    filterState.search,
    filterState.pagination.page,
    filterState.pagination.per_page,
    filterState.order,
  ]);

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await categoryHttp.list<ListReponse<Category>>({
        queryParams: {
          search: cleanSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
        },
      });
      if (subscribed.current) {
        setData(data.data);
        setTotalRecords(data.meta.total);
        /*         setSearchState((prevState) => ({
          ...prevState,
          pagination: { ...prevState.pagination, total: data.meta.total },
        })); */
      }
    } catch (error) {
      console.error(error);
      if (categoryHttp.isCanceledRequest(error)) {
        return;
      }
      snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanSearchText = (text) => {
    let newText = text;
    if (text && text.value !== undefined) {
      newText = text.value;
    }
    return newText;
  };

  return (
    <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title="Listagem de categorias"
        columns={columns}
        data={data}
        loading={loading}
        debouncedSearchTime={500}
        options={{
          serverSide: true,
          responsive: "scrollMaxHeight",
          searchText: filterState.search as any,
          page: filterState.pagination.page - 1,
          rowsPerPage: filterState.pagination.per_page,
          count: totalRecords,
          customToolbar: () => (
            <FilterResetButton
              handleClick={() => dispatch(Creators.setReset())}
            />
          ),
          onSearchChange: (value) =>
            dispatch(Creators.setSearch({ search: value })),
          onChangePage: (page) =>
            dispatch(Creators.setPage({ page: page + 1 })),
          onChangeRowsPerPage: (per_page) =>
            dispatch(Creators.setPerPage({ per_page })),
          onColumnSortChange: (changedColumn, direction) =>
            dispatch(
              Creators.setOrder({
                sort: changedColumn,
                dir: direction.includes("desc") ? "desc" : "asc",
              })
            ),
        }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
