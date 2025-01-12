<template>
  <div id="app">
    <div v-if="!game_start">
      <div class="start_menu" v-if="!buttonClicked">
        <menu-1 />
        <div class="mb-3">
          <input class="input" v-model="username" placeholder="Enter name" />
        </div>
        <button class="button" @click="StartGame">Start Game</button>
      </div>
      <div v-if="buttonClicked">
        <lobby-1 />
      </div>
    </div>
    <div v-if="game_start ">
      <game-1 />
    </div>
    <div v-if="game_end">
      <end-screen />
    </div>
  </div>
</template>

<script>
import GameMenu from "./components/GameMenu1.vue";
import GameLobby from "./components/GameLobby.vue";
import GameEndScreen from "./components/GameEndScreen.vue";
import io from "socket.io-client";
import GameCards from "@/components/game-prsi.vue";
export default {
  name: "app",
  components: {
    "lobby-1": GameLobby,
    "menu-1": GameMenu,
    "game-1": GameCards,
    "end-screen": GameEndScreen,
  },
  data() {
    return {
      socket: {},
      buttonClicked: false,
      game_start: false,
      game_end: false,

      username: "",
    };
  },
  created() {
    console.log(process.env);
    this.socket = io("http://localhost:3000");
    this.buttonClicked = false;
    this.game_start = false;
    this.game_end = false;
  },

  mounted() {
    this.socket.on("data", (data) => {
      console.log("communication established");
      if (data.game_started) {
        this.game_start = true;
      }
      if (data.winner !== 404) {
        //wait
        this.game_end = true;
      }
    });
    window.addEventListener("unload", this.handleBeforeUnload);
  },

  methods: {
    StartGame() {
      if (this.username === "") return;
      this.socket.emit("start");
      console.log("your user name "+this.username);
      this.socket.emit("PushUser", this.username);
      sessionStorage.setItem("Username", this.username);
      this.buttonClicked = true;
    },
    handleBeforeUnload() {
      window.removeEventListener("unload", this.handleBeforeUnload);
      this.socket.emit("logout", this.username);
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
