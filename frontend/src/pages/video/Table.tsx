import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import DeleteDialog from "../../components/DeleteDialog";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import LoadingContext from "../../components/loading/LoadingContext";

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
  const { enqueueSnackbar } = useSnackbar();

  const subscribed = useRef(true);
  const [data, setData] = useState<Video[]>([]);
  const loading = useContext(LoadingContext);

  const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
  const {
    openDeleteDialog,
    rowsToDelete,
    setOpenDeleteDialog,
    setRowsToDelete,
  } = useDeleteCollection();

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
    tableRef,
  });

  const searchText = cleanSearchText(debouncedFilterState.search);

  const getData = useCallback(
    async ({ search, page, per_page, sort, dir }) => {
      try {
        const { data } = await videoHttp.list<ListReponse<Video>>({
          queryParams: {
            search,
            page,
            per_page,
            sort,
            dir,
          },
        });
        if (subscribed.current) {
          setData(data.data);
          setTotalRecords(data.meta.total);
          if (openDeleteDialog) {
            setOpenDeleteDialog(false);
          }
        }
      } catch (error) {
        console.error(error);
        if (videoHttp.isCanceledRequest(error)) {
          return;
        }
        enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      }
    },
    [setTotalRecords, openDeleteDialog, setOpenDeleteDialog, enqueueSnackbar]
  );

  useEffect(() => {
    subscribed.current = true;

    getData({
      search: searchText,
      page: debouncedFilterState.pagination.page,
      per_page: debouncedFilterState.pagination.per_page,
      sort: debouncedFilterState.order.sort,
      dir: debouncedFilterState.order.dir,
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

  const deleteRows = (confirmed: boolean) => {
    if (!confirmed) {
      setOpenDeleteDialog(false);
      return;
    }
    const ids = rowsToDelete.data
      .map((value) => data[value.index].id)
      .join(",");
    videoHttp
      .deleteCollection({ ids })
      .then(() => {
        enqueueSnackbar("Registros excluídos com sucesso", {
          variant: "success",
        });
        if (
          rowsToDelete.data.length === filterState.pagination.per_page &&
          filterState.pagination.page > 1
        ) {
          const page = filterState.pagination.page - 2;
          filterManager.changePage(page);
        } else {
          getData({
            search: searchText,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar("Não foi possível excluir os registros", {
          variant: "error",
        });
      });
  };

  return (
    <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
      <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
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
          onRowsDelete(rowsDeleted: any[]) {
            setRowsToDelete(rowsDeleted as any);
            return false;
          },
        }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
