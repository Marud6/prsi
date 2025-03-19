<script>
import { call_api } from '@/utils/apiUtils';

export default {
  data() {
    return {
      room_code: "",
      loading: false
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


    async Create_room() {
      this.loading = true;
      const room_code = await call_api("create_room");
      this.loading = false;
      if (room_code) {
        window.location.href = `/room/${room_code}`;
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
        window.location.href = `/room/${this.room_code}`;
      } else {
        alert(`Lobby doesn't exist.`);
      }
    }
  }
};
</script>

<template>
  <div>
    <div>
      <h1>Prší</h1>
      <div class="choices">
        <div class="but2">
          <button class="button" @click="Create_room()">create room</button>
        </div>
        <div class="join_game">
          <input class="input"  maxlength="6" v-model.number="room_code" placeholder="_ _ _ _ _ _" />
          <div class="but">
            <button class="button" @click="Join_room()">join room</button>
          </div>


        </div>

      </div>
    </div>
  </div>
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


.join_game{
display: flex;
}

.but{
  padding: 8px;
}
.but2{
  padding: 24px;
}
input{
  margin: 0;
}


.choices{
display: flex;
  flex-direction: column;
  align-items: center;


}


h1 {
  color: white;
  text-align: center;
  font-size: 80px;

  text-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}
</style>
