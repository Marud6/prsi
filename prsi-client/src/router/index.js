import { createRouter, createWebHistory } from "vue-router";
import RoomMenu from "../components/RoomMenu.vue";
import Menu from "../components/GameMenu1.vue";
import lobby from "../components/GameLobby.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: RoomMenu,
    },
    {
      path: '/lobby/:id/', component: lobby
    },
  ],
});

export default router;
