import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { format, parseISO } from "date-fns";

import { BadgeNo, BadgeYes } from "../../components/Badge";
import genreHttp from "../../util/http/genre-http";
import DefaultTable, {
  makeActionsStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from "../../components/Table";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Genre, ListReponse } from "../../util/models";
import useFilter from "../../hooks/useFilter";
import FilterResetButton from "../../components/Table/FilterResetButton";
import * as yup from "yup";
import categoryHttp from "../../util/http/category-http";
import LoadingContext from "../../components/loading/LoadingContext";

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
  const { enqueueSnackbar } = useSnackbar();

  const subscribed = useRef(true);
  const [data, setData] = useState<Genre[]>([]);
  const loading = useContext(LoadingContext);
  const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

  const extraFilter = useMemo(
    () => ({
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
    }),
    []
  );

  const {
    columns,
    filterState,
    debouncedFilterState,
    totalRecords,
    setTotalRecords,
    filterManager,
    cleanSearchText,
  } = useFilter({
    columns: columnsDefinition,
    debounceTime: debouncedTime,
    rowsPerPage,
    rowsPerPageOptions,
    extraFilter,
    tableRef,
  });

  const searchText = cleanSearchText(debouncedFilterState.search);

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
        enqueueSnackbar("Não foi possivel carregar as informações", {
          variant: "error",
        });
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [columnCategories.options, enqueueSnackbar]);

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

  const getData = useCallback(
    async ({ search, page, per_page, sort, dir, categories }) => {
      try {
        const { data } = await genreHttp.list<ListReponse<Genre>>({
          queryParams: {
            search,
            page,
            per_page,
            sort,
            dir,
            ...(categories && {
              categories: categories.join(","),
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
        enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      }
    },
    [setTotalRecords, enqueueSnackbar]
  );

  useEffect(() => {
    subscribed.current = true;
    getData({
      search: searchText,
      page: debouncedFilterState.pagination.page,
      per_page: debouncedFilterState.pagination.per_page,
      sort: debouncedFilterState.order.sort,
      dir: debouncedFilterState.order.dir,
      ...(debouncedFilterState.extraFilter &&
        debouncedFilterState.extraFilter.categories && {
          categories: debouncedFilterState.extraFilter.categories,
        }),
    });
    return () => {
      subscribed.current = false;
    };
  }, [
    getData,
    searchText,
    debouncedFilterState.pagination.page,
    debouncedFilterState.pagination.per_page,
    debouncedFilterState.order,
    debouncedFilterState.extraFilter,
  ]);

  return (
    <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        ref={tableRef}
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
            filterManager.changeExtraFilter({
              [column]: filterList[columnIndex].length
                ? filterList[columnIndex]
                : null,
            });
          },
          customToolbar: () => (
            <FilterResetButton
              handleClick={() => filterManager.resetFilter()}
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
