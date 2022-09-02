import React from "react";
import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableOptions,
  MUIDataTableProps,
} from "mui-datatables";
import { cloneDeep, merge, omit } from "lodash";
import { useTheme } from "@material-ui/styles";
import { MuiThemeProvider, Theme, useMediaQuery } from "@material-ui/core";

const defaultOptions: MUIDataTableOptions = {
  print: false,
  download: false,
  textLabels: {
    body: {
      noMatch: "Nenhum registro encontrado",
      toolTip: "Classificar",
    },
    pagination: {
      next: "Próxima página",
      previous: "Página anterior",
      rowsPerPage: "Por página:",
      displayRows: "de",
    },
    toolbar: {
      search: "Busca",
      downloadCsv: "Download CSV",
      print: "Imprimir",
      viewColumns: "Ver Colunas",
      filterTable: "Filtrar Tabela",
    },
    filter: {
      all: "Todos",
      title: "FILTROS",
      reset: "LIMPAR",
    },
    viewColumns: {
      title: "Ver Colunas",
      titleAria: "Ver/Esconder Colunas da Tabela",
    },
    selectedRows: {
      text: "registros(s) selecionados",
      delete: "Excluir",
      deleteAria: "Excluir registros selecionados",
    },
  },
};

export interface TableColumn extends MUIDataTableColumn {
  width?: string;
}

export interface TableProps extends MUIDataTableProps {
  columns: TableColumn[];
  loading?: boolean;
}

const Table: React.FC<TableProps> = (props) => {
  const extracMuiDataTableColumns = (
    columns: TableColumn[]
  ): MUIDataTableColumn[] => {
    setColumnsWidth(columns);
    return columns.map((column) => omit(column, "width"));
  };

  const setColumnsWidth = (columns: TableColumn[]): MUIDataTableColumn[] => {
    columns.forEach((column, key) => {
      const overrides = theme.overrides as any;
      if (column.width) {
        overrides.MUIDataTableHeadCell.fixedHeader[`&:nth-child(${key + 2})`] =
          {
            width: column.width,
          };
      }
    });
    return columns.map((column) => omit(column, "width"));
  };

  const applyLoading = () => {
    const textLabels = (newProps.options as any).textLabels;
    textLabels.body.noMatch =
      newProps.loading === true ? "Carregando..." : textLabels.body.noMatch;
  };

  const applyResponsive = () => {
    newProps.options.responsive = isSmOrSmaller ? "scrollMaxHeight" : "stacked";
  };

  const getOriginalMuiDataTableProps = () => {
    return omit(newProps, "isLoading");
  };

  const theme = cloneDeep<Theme>(useTheme());
  const isSmOrSmaller = useMediaQuery(theme.breakpoints.down("sm"));

  const newProps = merge(
    {
      options: cloneDeep(defaultOptions),
    },
    props,
    { columns: extracMuiDataTableColumns(props.columns) }
  );

  applyLoading();
  applyResponsive();

  const originalProps = getOriginalMuiDataTableProps();

  return (
    <MuiThemeProvider theme={theme}>
      <MUIDataTable {...originalProps} />
    </MuiThemeProvider>
  );
};

export default Table;

export const makeActionsStyles = (column) => {
  return (theme) => {
    const copyTheme = cloneDeep(theme);
    const selector = `&[data-testid^="MuiDataTableBodyCell-${column}"]`;
    (copyTheme.overrides as any).MUIDataTableBodyCell.root[selector] = {
      paddingTop: "0px",
      paddingBottom: "0px",
    };
    return copyTheme;
  };
};
