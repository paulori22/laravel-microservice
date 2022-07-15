import { RouteProps } from "react-router-dom";
import PageList from "../pages/category/PageList";
import Dashboard from "../pages/Dashboard";

export interface MyRouteProps extends RouteProps {
  name: string;
  label: string;
}

const routes: MyRouteProps[] = [
  {
    name: "dashboard",
    label: "Dashboard",
    path: "/",
    component: Dashboard,
    exact: true,
  },
  {
    name: "categories.list",
    label: "Listar categorias",
    path: "/categories",
    component: PageList,
    exact: true,
  },
  {
    name: "categories.create",
    label: "Criar categoria",
    path: "/categories/create",
    component: PageList,
    exact: true,
  },
];

export default routes;
