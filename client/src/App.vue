<template>
  <div id="app">
    <div v-if="game_stage===4">
      <room-menu />
    </div>

    <div v-if="game_stage===0">
      <menu-1 />
      <div class="mb-3">
        <input class="input" v-model="username" placeholder="Enter name" />
      </div>
      <button class="button" @click="Join_game">Start Game</button>
    </div>
    <div v-if="game_stage===1">

      <lobby-1 />
    </div>
    <div v-if="game_stage===2">
      <game-1 />
    </div>
    <div v-if="game_stage===3">
      <end-screen />
    </div>
  </div>
</template>

<script>

import GameMenu from "./components/GameMenu1.vue";
import GameLobby from "./components/GameLobby.vue";
import GameEndScreen from "./components/GameEndScreen.vue";
import RoomMenu from "./components/RoomMenu.vue";
import GameCards from "@/components/game-prsi.vue";
import { socket } from "@/socket";


export default {
  name: "app",
  components: {
    "lobby-1": GameLobby,
    "menu-1": GameMenu,
    "game-1": GameCards,
    "end-screen": GameEndScreen,
    "room-menu":RoomMenu,
  },
  data() {
    return {
      game_stage: 4,
      username: "",
    };
  },
  created() {
    console.log(process.env);
    socket.connect();
    this.game_stage=4;
  },

  mounted() {
    socket.on("data", (data) => {
      console.log("communication established");
      this.game_stage=data.game_stage;
      if (data.game_started) {
        this.game_stage=2;
      }
      if (data.winner !== 404) {
        //wait
        this.game_stage=3;
      }
    });
    window.addEventListener("unload", this.handleBeforeUnload);
  },
  methods: {
    Join_game() {
      if (this.username === "") return;
      this.game_stage=1;
      console.log("your user name "+this.username);
      socket.emit("PushUser", this.username);
      sessionStorage.setItem("Username", this.username);
    },
    handleBeforeUnload() {
      window.removeEventListener("unload", this.handleBeforeUnload);
      this.game_stage=0;
      socket.emit("logout", this.username);
    },
  },
};
</script>

<style>
.start_menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}
.button {
  margin-top: 10px;
  padding: 20px 30px;
  border-radius: 30px;
  font-size: 20px;
  background: white;
  color: black;
  border: none;
  box-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}
button:hover {
  background: #141414;
  color: white;
}
.text {
  color: white;
  font-size: 80px;
  margin: 10px;
  margin-bottom: 50px;
  text-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}

.input {
  display: block;
  margin-bottom: 15px;
  font-size: 20px;
  color: black;
  width: 300px;
  padding: 15px 20px;
  border: none;
  border-radius: 30px;
  background: transparent;
  font-size: 30px;
  color: #fff;
  text-align: center;
  outline: none;
  box-shadow: 0 0 10px rgb(9, 5, 91), 0 0 20px rgb(9, 5, 91),
    0 0 40px rgb(9, 5, 91);
  transition: 0.3s ease;
}
::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
body {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(9, 39, 121, 1) 50%,
    rgba(125, 0, 255, 1) 100%
  );
  font-family: "Verdana";
}
</style>
