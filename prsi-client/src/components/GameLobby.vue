<script>
import { socket } from "@/socket";
import GameCards from "@/components/game-prsi.vue";


export default {

  components: {
    "game-prsi": GameCards,
  },

  data() {
    return {
      deck: {},
      users: 404,
      image_url: "",
      your_username: "",
      user_state: [],
      user_ready: false,
      counter: "",
      room_code: 404,
      game_started: false,
    };
  },
  created() {
    this.room_code = this.$route.params.id;
    this.your_username = sessionStorage.getItem("Username")
    console.log(this.your_username+" Join game");
    if(this.your_username===null){
      window.location.href = "/room/"+this.$route.params.id;
      return;
    }
    socket.emit("join_room", this.room_code, this.your_username );
  },
  mounted() {
    socket.on("counter", (counter) => {
      this.counter = counter;
    });
    socket.on("player_joined_game", (players_info,game_start) => {
      if(players_info==null){
        window.location.href = "/";
        return;
      }

        this.users = players_info.length;
      this.user_state = players_info;
      if(game_start!==undefined){
        this.game_started = game_start;
      }
    });

    window.addEventListener("unload", this.handleBeforeUnload);
  },
  methods: {
    get_ready() {
      this.user_ready = true;
      socket.emit("get_ready", this.room_code, this.your_username );
    },
    get_unready() {
      this.user_ready = false;
      socket.emit("get_unready", this.room_code, this.your_username );

    },
    handleBeforeUnload() {
      window.removeEventListener("unload", this.handleBeforeUnload);
      socket.emit("logout", this.room_code, this.your_username);
    },
  },
};

</script>

<template>

  <div v-if="users ===404" >
    <h1>Loading</h1>
  </div >
  <div v-if="users !==404" >
  <div v-if="game_started===false">
    <div class="left">
      <ul id="example-1">
        <li v-for="item in user_state" :key="item">
          <div v-if="item.state==='online'" class="user">
            <h1 class="item" ref="number">{{ item["username"] }} is sdafd </h1><h1 v-if="item['status']==='Not ready'" style="color: red" class="item">{{ item["status"] }}</h1><h1 v-if="item['status']==='Ready'"   style="color: green" class="item">{{ item["status"] }}</h1>
          </div>
        </li>
      </ul>
    </div>
    <div class="right">
      <h1 class="text1">Game Lobby</h1>
      <h1 class="text2">Your room code is {{ $route.params.id }}</h1>

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
  <div v-if="game_started===true">
    <game-prsi />




  </div>
  </div>




</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

ul{
  width: 300px;
   box-sizing: content-box;

}

.item{
  color: black;
  padding: 8px;
}


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
  padding: 16px;
  overflow: hidden;
}

.user {
  background-color: aliceblue;
  border-radius: 10px;
  font-size: 15px;
  text-align: center;
  width: 100%;
}

.right {
  width: 60%;
  float: right;
  color: white;
  text-align: center;
}
</style>
