<script>
import { call_api } from '@/utils/apiUtils';

export default {
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
  <div>
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





    <!-- Everything else (blurred) -->
    <div class="blur-background">
      <div class="deck">
        <img class="back_card" id="img1" src="/images/back.png" alt="back of the card">
        <img class="back_card" id="img2" src="/images/back.png" alt="back of the card">
        <img class="back_card" id="img3" src="/images/back.png" alt="back of the card">
        <img class="back_card" id="img4" src="/images/back.png" alt="back of the card">
        <img class="back_card" id="img5" src="/images/back.png" alt="back of the card">
        <div class="decorations">
          <img class="front_card" id="img7" src="/cards/94.png" alt="card image">
          <img class="front_card" id="img8" src="/cards/42.png" alt="card image">
          <img class="front_card" id="img6" src="/cards/51.png" alt="card image">
          <img class="front_card" id="img11" src="/cards/83.png" alt="card image">
          <img class="front_card" id="img10" src="/cards/61.png" alt="card image">
          <img class="front_card" id="img9" src="/cards/33.png" alt="card image">
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>






#img1{
  transform: rotate(95deg);
  right: 45%;

}
#img2{
  transform: rotate(93deg);
  right: 45%;

}
#img3{
  transform: rotate(74deg);
  right: 45%;

}
#img4{
  transform: rotate(87deg);
  right: 45%;

}
#img5{
  transform: rotate(85deg);
  right: 45%;

}
#img6{
  right: -5%;
  bottom: -10%;
  transform: rotate(-43deg);
}
#img7{
  right: 4%;
  bottom: -1%;
  transform: rotate(-20deg);
}
#img8{
  bottom: 5vh;
  right: -5%;
  transform: rotate(-72deg);
}
#img9{
left: 3%;
  bottom: -10%;
  transform: rotate(26deg);
}
#img10{
  transform: rotate(-24deg);
bottom: -5%;
  left: 2%;
}
#img11{
  transform: rotate(30deg);
  left: -5%;
  bottom: -3%;
}
body{
  filter: blur(5px);
}

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
