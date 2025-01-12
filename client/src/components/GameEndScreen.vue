<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      socket: {},
      winner: "",
      users: [""],

      your_username: "",
    };
  },
  created() {
    this.socket = io("http://localhost:3000");
  },
  mounted() {
    this.your_username = sessionStorage.getItem("Username");
    this.socket.on("data", (data) => {
      if(this.winner==""){
        this.winner = data.players_names[data.winner];
      }

      console.log("Received number:", data);
    });
  },
  methods: {
    back_Menu() {
      this.socket.emit("reset_game", {});
      sessionStorage.removeItem("Username");
      location.reload();
    },
  },
};
</script>

<template>
  <div>
    <h1 class="text">END</h1>
    <h1 class="text">Winner is {{ winner }}</h1>

    <button class="button" @click="back_Menu()">Back to menu</button>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
