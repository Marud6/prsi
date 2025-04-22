<script>
import { socket } from "@/socket";
import GameCards from "@/components/game-prsi.vue";
import Background from "@/components/background.vue";
import { call_api } from '@/utils/apiUtils';


export default {
  components: {
    Background,
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
      winner:false,
    };
  },
  created() {
    this.room_code = this.$route.params.id;
    this.exits()
    this.your_username = sessionStorage.getItem("Username")
    console.log(this.your_username+"Join game");
    if(this.your_username===null){
      window.location.href = "/room/"+this.$route.params.id;
      return;
    }
    if(!this.game_started){
      console.log("joined game")
      socket.emit("join_room", this.room_code, this.your_username );
    }
  },
  mounted() {
    socket.on("counter", (counter) => {
      this.counter = counter;
    });
    socket.on("winner", () => {
      this.winner = true;
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
   async exits(){
      const existing = await call_api(`room_exists/${this.room_code}`);
      if(!existing){
        window.location.href = "/";
      }
    },
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

  <div v-if="!winner">
  <div v-if="users ===404" >
    <h1>Loading</h1>
  </div >
  <div v-if="users !==404" >
  <div v-if="game_started===false">

    <div class="buttons">
      <div class="text_container">
      <h1 class="text">Lobby</h1>
      </div>
      <ul class="cards">
          <li v-for="item in user_state" :key="item">
            <div v-if="item.state==='online'" class="user">
              <div class="card">
                <h1 class="username_text">{{ item["username"] }}</h1>
                <img v-if="item['status']==='Not ready'" class="player_image" src="/images/player_notready.png" alt="">
                <img v-if="item['status']==='Ready'" class="player_image" src="/images/player_ready.png" alt="">
                <h1 v-if="item['status']==='Not ready'" style="color: red" class="item">{{ item["status"] }}</h1>
                <h1 v-if="item['status']==='Ready'" style="color: green" class="item">{{ item["status"] }}</h1>
              </div>
            </div>
          </li>
        </ul>
      <div class="ready_container">
        <h1 class="text2">Your room code is {{ $route.params.id }}</h1>
      </div>
      <div v-if="!user_ready" class="ready_container">
        <button class="button" @click="get_ready()">Get ready</button>
      </div>
      <div v-if="user_ready" class="ready_container">
        <button class="button" @click="get_unready()">Get unready</button>
      </div>
      <h1 class="counter">{{ counter }}</h1>
    </div>
    <background></background>
  </div>
  <div v-if="game_started===true">
    <game-prsi />
  </div>
  </div>
  </div>
  <div v-if="winner">
    <div class="buttons">
    <div class="text_container">
      <h1 class="winner_text">you won</h1>
    </div>
      <a href="/">Back home</a>
    </div>
    <background></background>
  </div>
</template>

<style scoped>
.text_container{
  padding: 2%;
  width: 100%;
  display: flex;
  justify-content: center;
}
.ready_container{
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1%;

}



.text,.winner_text{
  text-align: center;
  width: 100%;
  font-size: 4rem;
  background: rgba(217, 217, 217, 0.75); /* 75% transparent */
  height: 100px;
  width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: none;
}
.winner_text{
  font-size: 80px;
width: 600px;
  height: 150px;
}




.text2{
  color: white;
  font-size: 2rem;
}

.button{
  background: rgba(217, 217, 217, 0.75); /* 75% transparent */
  height: 100px;
  width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease, transform 0.3s ease;
  font-size: 3rem;
}

.button:hover{
  background: rgba(217, 217, 217, 0.85); /* 75% transparent */
  transform: scale(1.1);
}


.buttons{
  position: absolute;
  z-index: 1000;
  width: 100%;
}
card{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Centers content vertically */
  width: 200px; /* Adjust width as needed */
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
}

.username_text{
position: absolute;
  width: 273px;
  font-size: 22px;
}
.item {
  position: absolute;
  top: 55%;
  width: 273px;
}
.cards{
  display: flex;
}

.player_image{
  width: 100%;
}

li {
  list-style-type: none;
  margin: 0;
  padding: 16px;
  overflow: hidden;
}

.user {
  font-size: 15px;
  text-align: center;
  width: 100%;
}

</style>
