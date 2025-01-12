<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      socket: {},
      deck: {},


      users: [""],
      image_url: "",
      your_username: "",
      user_state: [],
      user_ready: false,
      counter: 0,
    };
  },
  created() {
    this.socket = io("http://localhost:3000");
  },
  mounted() {
    this.create_pack();
    this.your_username = sessionStorage.getItem("Username");
    this.socket.on("data", (data) => {
      this.numbers = data.number;
      this.users = data.players_names.length;
      this.user_state = data.players_info;
      this.counter = data.counter;
      console.log("Received data:", data);
    });
  },
  methods: {
    async create_pack(){
      const url = "http://localhost:3006/api/create_random_pack";
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log("created pack: "+json);
      } catch (error) {
        console.error(error.message);
      }

    },
    get_ready() {
      this.user_ready = true;

      this.socket.emit("get_ready", {
        username: this.your_username,
      });
    },
    get_unready() {
      this.user_ready = false;
      this.socket.emit("get_unready", {
        username: this.your_username,
      });
    },
  },
};
</script>

<template>
  <div>
    <div class="left">
      <ul id="example-1">
        <li v-for="item in user_state" :key="item">
          <div class="user">
            <h1 ref="number">{{ item["username"] }} is {{ item["status"] }}</h1>
          </div>
        </li>
      </ul>
    </div>
    <div class="right">
      <h1 class="text1">Game Lobby</h1>

      <h1 class="text2">Your username is {{ your_username }}</h1>
      <!-- <h1 ref="number">there are {{ users }} users</h1> -->

      <h1 class="users_count">there are: {{ users }} users online</h1>
      <div v-if="!user_ready">
        <button class="button" @click="get_ready()">Get ready</button>
      </div>
      <div v-if="user_ready">
        <button class="button" @click="get_unready()">Get unready</button>
      </div>
      <h1 class="counter">{{ counter }}</h1>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.left {
  width: 30%;
  float: left;
}
.text1 {
  color: white;
  font-size: 80px;
  margin: 10px;
  margin-bottom: 50px;
  text-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}
.users_count {
  font-size: 25px;
  margin-bottom: 50px;
}
.button {
  font-size: 35px;
}
li {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.user {
  background-color: aliceblue;
  border-radius: 10px;
  font-size: 15px;
  text-align: center;
}

.right {
  width: 60%;
  float: right;
  color: white;
  text-align: center;
}
</style>
