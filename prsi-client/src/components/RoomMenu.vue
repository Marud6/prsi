<script>
import { call_api } from '@/utils/apiUtils';
import Background from "@/components/background.vue";

export default {
  components: {Background},
  data() {
    return {
      room_code: "",
      loading: false,
      Gamemenu: true,

    };
  },
  mounted(){
    this.set_token();
  },
  methods: {

    async set_token(){
        const token=await call_api("user/generateToken")
         sessionStorage.setItem("JWT_token",token );
    },
    Join_lobby() {
      if (this.username === ""||this.username === undefined) return;
      console.log("your user name "+this.username);
      sessionStorage.setItem("Username", this.username);
      window.location.href = `/lobby/${this.room_code}`;
    },


    async Create_room() {
      this.loading = true;
      this.room_code = await call_api("create_room");

      this.loading = false;
      if (this.room_code) {
        console.log("room code:"+this.room_code)
        this.Gamemenu = false;
      } else {
        alert("Failed to create room.");
      }
    },
    isInteger(value) {
      return /^\d+$/.test(value);
    },
    async Join_room() {
      if (!this.isInteger(this.room_code)) {
        alert(`Invalid room code.`);
        return;
      }

      this.loading = true;
      const existing = await call_api(`room_exists/${this.room_code}`);
      this.loading = false;
      if (existing) {
        this.Gamemenu = false;
      } else {
        alert(`Lobby doesn't exist.`);
      }
    }
  }
};
</script>
<template>
    <div v-if="Gamemenu" class="game_buttons">
      <div class="button_outer">
        <div class="button">
          <h2 @click="Create_room">Host room</h2>
        </div>
      </div>
      <div class="join_game">
        <div class="button_static">
          <input class="input" maxlength="6" v-model.number="room_code" placeholder="_ _ _ _ _ _" />
        </div>
        <div class="button">
          <h2 @click="Join_room">Join game</h2>
        </div>
      </div>
    </div>


    <div v-if="!Gamemenu">
      <div class="game_buttons" style="  padding-top: 30vh;">
      <div class="button_static">
        <h2>Enter your username</h2>
      </div>
      <div class="button_static">
        <input class="input" v-model="username" />
      </div>
      <div class="button">
        <h2 @click="Join_lobby">Join lobby</h2>
      </div>
      <div class="mb-3">
        <a href="/">Back</a>
      </div>
      </div>
    </div>
 <background></background>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>



.input{
  background-color: transparent;
  border: none;
  font-size: min(5vw,3rem);
  text-align: center;
  outline: none;
}
h2{
  color:black;
  text-align: center;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
  font-size: min(5vw,3rem);
}
.game_buttons {
  position: absolute; /* Position over other elements */
  top: 10px; /* Adjust as needed */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Adds spacing between buttons */
  z-index: 1000; /* Ensures it's above all images */
}


.join_game {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Adds spacing between buttons */
  padding-top: 50%;
}

.button_outer{
  padding-top: 30%;
}

.button,.button_static {
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
}

.button:hover{
  background: rgba(217, 217, 217, 0.85); /* 75% transparent */
  transform: scale(1.1);
}



input{
  margin: 0;
}




</style>
