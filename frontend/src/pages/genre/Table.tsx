import React, { useEffect, useRef, useState } from "react";
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
import { useSnackbar } from "notistack";
import { Genre, ListReponse } from "../../util/models";
import useFilter from "../../hooks/useFilter";
import FilterResetButton from "../../components/Table/FilterResetButton";
import { Creators } from "../../store/filter";
import * as yup from "yup";
import categoryHttp from "../../util/http/category-http";

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
      filter: false,
      sort: false,
    },
  },
  {
    name: "name",
    label: "Nome",
    options: {
      filter: false,
    },
  },
  {
    name: "categories",
    label: "Categorias",
    options: {
      filterType: "multiselect",
      filterOptions: {
        names: [],
      },
      customBodyRender(categories: Category[]) {
        return categories.map((c) => c.name).join(", ");
      },
    },
  },
  {
    name: "is_active",
    label: "Ativo?",
    options: {
      filter: false,
      customBodyRender(value) {
        return value ? <BadgeYes /> : <BadgeNo />;
      },
    },
  },
  {
    name: "created_at",
    label: "Criado em",
    options: {
      filter: false,
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
      filter: false,
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

const debouncedTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

export const Table: React.FC = () => {
  const snackbar = useSnackbar();

  const subscribed = useRef(true);
  const [data, setData] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    columns,
    filterState,
    debouncedFilterState,
    dispatch,
    totalRecords,
    setTotalRecords,
    filterManager,
  } = useFilter({
    columns: columnsDefinition,
    debounceTime: debouncedTime,
    rowsPerPage,
    rowsPerPageOptions,
    extraFilter: {
      createValidationSchema: () => {
        return yup.object().shape({
          categories: yup
            .mixed()
            .nullable()
            .transform((value) => {
              return !value || value === "" ? undefined : value.split(",");
            })
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
          ? {
              ...(debouncedState.extraFilter.categories && {
                categories: debouncedState.extraFilter.categories.join(","),
              }),
            }
          : undefined;
      },
      getStateFromURL: (queryParams) => {
        return {
          categories: queryParams.get("categories"),
        };
      },
    },
  });

  const indexColumnCategories = columns.findIndex(
    (c) => c.name === "categories"
  );
  const columnCategories = columns[indexColumnCategories];
  const categoriesFilterValue =
    filterState.extraFilter && (filterState.extraFilter.categories as never);
  (columnCategories.options as any).filterList = categoriesFilterValue
    ? categoriesFilterValue
    : [];

  const serverSideFilterList = columns.map(() => []);
  if (categoriesFilterValue) {
    serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
  }

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const { data } = await categoryHttp.list({ queryParams: { all: "" } });
        if (isSubscribed) {
          (columnCategories.options as any).filterOptions.names = data.data.map(
            (category) => category.name
          );
        }
      } catch (error) {
        console.error(error);
        snackbar.enqueueSnackbar("Não foi possivel carregar as informações", {
          variant: "error",
        });
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, []);

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

  useEffect(() => {
    subscribed.current = true;
    filterManager.pushHistory();
    getData();
    return () => {
      subscribed.current = false;
    };
  }, [
    filterManager.cleanSearchText(debouncedFilterState.search),
    debouncedFilterState.pagination.page,
    debouncedFilterState.pagination.per_page,
    debouncedFilterState.order,
    JSON.stringify(debouncedFilterState.extraFilter),
  ]);

  const getData = async () => {
    setLoading(true);
    try {
      console.log({
        ...(debouncedFilterState.extraFilter &&
          debouncedFilterState.extraFilter.categories && {
            categories: debouncedFilterState.extraFilter.categories,
          }),
      });
      const { data } = await genreHttp.list<ListReponse<Genre>>({
        queryParams: {
          search: filterManager.cleanSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
          ...(debouncedFilterState.extraFilter &&
            debouncedFilterState.extraFilter.categories && {
              categories: debouncedFilterState.extraFilter.categories.join(","),
            }),
        },
      });
      if (subscribed.current) {
        setData(data.data);
        setTotalRecords(data.meta.total);
      }
    } catch (error) {
      console.error(error);
      if (genreHttp.isCanceledRequest(error)) {
        return;
      }
      snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title="Listagem de Gêneros"
        columns={columns}
        data={data}
        loading={loading}
        debouncedSearchTime={debouncedSearchTime}
        options={{
          serverSideFilterList,
          serverSide: true,
          responsive: "scrollMaxHeight",
          searchText: filterState.search as any,
          page: filterState.pagination.page - 1,
          rowsPerPage: filterState.pagination.per_page,
          rowsPerPageOptions,
          count: totalRecords,
          onFilterChange: (column, filterList) => {
            const columnIndex = columns.findIndex((c) => c.name === column);
            console.log({
              [column]: filterList[columnIndex].length
                ? filterList[columnIndex]
                : null,
            });
            filterManager.changeExtraFilter({
              [column]: filterList[columnIndex].length
                ? filterList[columnIndex]
                : null,
            });
          },
          customToolbar: () => (
            <FilterResetButton
              handleClick={() => dispatch(Creators.setReset())}
            />
          ),
          onSearchChange: (value) => filterManager.changeSearch(value),
          onChangePage: (page) => filterManager.changePage(page),
          onChangeRowsPerPage: (per_page) =>
            filterManager.changeRowsPerPage(per_page),
          onColumnSortChange: (changedColumn, direction) =>
            filterManager.changeColumnSort(changedColumn, direction),
        }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
