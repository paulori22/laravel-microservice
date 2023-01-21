import React, { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";

import videoHttp from "../../util/http/video-http";
import DefaultTable, {
  makeActionsStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from "../../components/Table";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Genre, Category, ListReponse, Video } from "../../util/models";
import useFilter from "../../hooks/useFilter";
import FilterResetButton from "../../components/Table/FilterResetButton";

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
    name: "title",
    label: "Título",
    options: {
      filter: false,
    },
  },
  {
    name: "genres",
    label: "Gêneros",
    options: {
      filter: false,
      customBodyRender(genres: Genre[]) {
        return genres.map((c) => c.name).join(", ");
      },
    },
  },
  {
    name: "categories",
    label: "Categorias",
    options: {
      filter: false,
      customBodyRender(categories: Category[]) {
        return categories.map((c) => c.name).join(", ");
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
            to={`/videos/${tableMeta.rowData[0]}/edit`}
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
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

  const {
    columns,
    filterState,
    debouncedFilterState,
    totalRecords,
    setTotalRecords,
    filterManager,
  } = useFilter({
    columns: columnsDefinition,
    debounceTime: debouncedTime,
    rowsPerPage,
    rowsPerPageOptions,
    tableRef,
  });

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
      const { data } = await videoHttp.list<ListReponse<Video>>({
        queryParams: {
          search: filterManager.cleanSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
        },
      });
      if (subscribed.current) {
        setData(data.data);
        setTotalRecords(data.meta.total);
      }
    } catch (error) {
      console.error(error);
      if (videoHttp.isCanceledRequest(error)) {
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
        ref={tableRef}
        title="Listagem de Vídeos"
        columns={columns}
        data={data}
        loading={loading}
        debouncedSearchTime={debouncedSearchTime}
        options={{
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
