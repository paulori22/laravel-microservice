import { RouteProps } from "react-router-dom";
import PageListCategory from "../pages/category/PageList";
import PageListCastMember from "../pages/cast_member/PageList";
import PageListGenre from "../pages/genre/PageList";
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
    component: PageListCategory,
    exact: true,
  },
  {
    name: "categories.create",
    label: "Criar categoria",
    path: "/categories/create",
    component: PageListCategory,
    exact: true,
  },
  {
    name: "cast_members.list",
    label: "Listar Membros do Elenco",
    path: "/cast_members",
    component: PageListCastMember,
    exact: true,
  },
  {
    name: "genres.list",
    label: "Listar Gêneros",
    path: "/genres",
    component: PageListGenre,
    exact: true,
  },
];

export default routes;
