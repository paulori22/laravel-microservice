import { RouteProps } from "react-router-dom";

import PageListCategory from "../pages/category/PageList";
import PageFormCategory from "../pages/category/PageForm";

import PageListCastMember from "../pages/cast_member/PageList";
import PageFormCastMember from "../pages/cast_member/PageForm";

import PageListGenre from "../pages/genre/PageList";
import PageFormGenre from "../pages/genre/PageForm";

import PageListVideo from "../pages/video/PageList";
import PageFormVideo from "../pages/video/PageForm";

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
    component: PageFormCategory,
    exact: true,
  },
  {
    name: "categories.edit",
    label: "Editar categoria",
    path: "/categories/:id/edit",
    component: PageFormCategory,
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
    name: "cast_member.create",
    label: "Criar Membros do Elenco",
    path: "/cast_members/create",
    component: PageFormCastMember,
    exact: true,
  },
  {
    name: "cast_member.edit",
    label: "Editar Membros do Elenco",
    path: "/cast_members/:id/edit",
    component: PageFormCastMember,
    exact: true,
  },
  {
    name: "genres.list",
    label: "Listar Gêneros",
    path: "/genres",
    component: PageListGenre,
    exact: true,
  },
  {
    name: "genres.create",
    label: "Criar Gêneros",
    path: "/genres/create",
    component: PageFormGenre,
    exact: true,
  },
  {
    name: "genres.edit",
    label: "Editar Gênero",
    path: "/genres/:id/edit",
    component: PageFormGenre,
    exact: true,
  },
  {
    name: "videos.list",
    label: "Listar Vídeos",
    path: "/videos",
    component: PageListVideo,
    exact: true,
  },
  {
    name: "videos.create",
    label: "Criar Vídeo",
    path: "/videos/create",
    component: PageFormVideo,
    exact: true,
  },
  {
    name: "videos.edit",
    label: "Editar Vídeo",
    path: "/videos/:id/edit",
    component: PageFormVideo,
    exact: true,
  },
];

export default routes;
