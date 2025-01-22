<script>
import { socket } from "@/socket";

export default {
  data() {
    return {
      choice:0,
      socket:{},
      room_code:"",
    };
  },
  created() {


  },
  mounted() {

  },
  methods: {


    async call_api(api){
      const url = "http://localhost:3006/api/"+api;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        return json;
      } catch (error) {
        console.error(error.message);
      }
    },



    async Create_room(){
     const room_code= await this.call_api("create_room");
     socket.emit("join_room", room_code);

    },
     isInteger(value) {
  return /^\d+$/.test(value);
   },

   async Join_room(){
     let existing
      console.log(this.room_code);
      if(this.isInteger(this.room_code)){
        existing = await this.call_api("room_exists/"+this.room_code);
        console.log(existing);
      }else{
        existing=false;
      }
      if(existing){
        socket.emit("join_room", this.room_code);
      }else{
        alert(`lobby doesn't exist`);
      }

    },



     change_choice(){
      if(this.choice===0){
        this.choice=1;
      }else{
        this.choice=0
      }
    },
  }
};
</script>
<template>
  <div>

    <div v-if="choice===0">
      <button class="button" @click="change_choice">Join?</button>
      <h1>Create room</h1>
      <button class="button" @click="Create_room()">create room</button>
    </div>
   <div v-if="choice===1">
     <button class="button" @click="change_choice">Create?</button>
     <h1>Join room</h1>

     <input class="input"  maxlength="6" v-model.number="room_code" placeholder="_ _ _ _ _ _" />
     <button class="button" @click="Join_room()">join room</button>

   </div>

  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: white;
  text-align: center;
  font-size: 80px;

  text-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}
</style>
