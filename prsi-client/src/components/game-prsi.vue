  <script>
  import { socket } from "@/socket";
  import { call_api } from '@/utils/apiUtils';

  export default {
    data() {
      return {
        mycards: [],
        deck: {},
        index: 0,
        your_username: sessionStorage.getItem("Username"),
        deck_id: "-1",
        last_card_pl: {},
        your_turn: false,
        skip:false,
        take_cards: false,
        to_take: 0,
        room_code:0,
      };
    },
    created() {
      this.skip=false;
      this.room_code = this.$route.params.id;
      socket.emit("get_data",this.room_code );
      //set last card in websocket
    },
    mounted() {
      this.your_username = sessionStorage.getItem("Username");
      socket.on("data", (data) => {
        console.log("data:");
        console.log(data);
        const index = data.players_info.findIndex(item => item.username === this.your_username);
        this.mycards=data.players_info[index].cards;
        this.users_info = data.users_info;
        this.deck_id = data.deck_id;
        this.last_card_pl=data.last_played_card;
        console.log(this.last_card_pl);
        if(data.players_info[data.player_on_turn].username===this.your_username){
          this.your_turn = true;
        }else {
          this.your_turn = false;
        }
      });
      socket.on("update_players", (cards) => {
        console.log(cards);
        this.mycards=cards;
      });

      socket.on("last_played_card", (cards) => {
        this.last_card_pl=cards;
      });
      socket.on("to_take_increase", (to_tk) => {
        this.to_take=to_tk;
      });

      socket.on("turn", (user_on_turn) => {
        if(user_on_turn===this.your_username){
          this.your_turn = true;
          if(this.last_card_pl.id===11 || this.last_card_pl.id===12 || this.last_card_pl.id===13 || this.last_card_pl.id===14  ){
            this.skip=true;
          }else{
            this.skip=false;
          }
          if(this.last_card_pl.id===71 || this.last_card_pl.id===72 || this.last_card_pl.id===73 || this.last_card_pl.id===74){
            this.take_cards=true;
          }else{
          this.take_cards=false;
          }
        }
        else {
          this.your_turn = false;
        }

      });
      socket.on("card_used", (last_card) => {
        this.last_card_pl=last_card;
      });

    },

    methods: {
      async can_i_play(id) {
        const url = "http://localhost:3006/api/Play_card";
        try {
          const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              id1: id,
              id2: this.last_card_pl.id,
            }),
            headers: {
              "Content-type": "application/json"
            }
          });
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          // Wait for the JSON response body
          const data = await response.json();
          if(data["status"]==="ok" && (id===71 || id===72 || id===73 || id===74)){socket.emit("take_increase",this.room_code);}

          return data["status"];

        } catch (error) {
          console.error(error.message);
        }
      },
  next_player_turn(){
    socket.emit("next_turn",this.room_code);
  },
      async handleClick(item) {
        //alert(`post card back to pack ${item.id}`);
        const can=await this.can_i_play(item.id)
        if(can==="ko"){
          alert(`you can not play this card ${item.id}`);
        }else {
          fetch("http://localhost:3006/api/post_card/"+this.deck_id, {
            method: "POST",
            body: JSON.stringify({
              id: this.last_card_pl.id
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          });
         socket.emit("play_card",this.room_code, item,this.your_username);
          this.next_player_turn()

        }
      },
      skip_turn(){
        this.skip=false
       socket.emit("used_card",this.room_code);
        this.next_player_turn()
      },
      async take_card(){
        if(this.your_turn && !this.take_cards && !this.skip){
          await this.get_cardd()
          this.next_player_turn()
        }
        if(this.your_turn && this.take_cards){

          this.take_cards=false;
          for (let i = 0; i < this.to_take; i++) {
            await this.get_cardd();
          }
          socket.emit("used_card",this.room_code);
          this.next_player_turn()
        }
        return 0;




      },

      async get_cardd(){
        const url = "http://localhost:3006/api/get_card/"+this.deck_id;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          const json = await response.json();
          //add element with card number id
          socket.emit("user_got_card",this.room_code,json,this.your_username);


        } catch (error) {
          console.error(error.message);
        }
      }
    },
  };
  </script>

  <template>
    <div class="game-container">
      <div class="controls">
        <button v-if="your_turn && skip" @click="skip_turn()">Skip Turn</button>
      </div>
      <div class="container_deck_take">
        <img id="img1" class="take_img" src="/images/back.png" alt="back of the card">
        <img id="img2" class="take_img" src="/images/back.png" alt="back of the card">
        <img id="img3" class="take_img" src="/images/back.png" alt="back of the card">
        <img id="img4" class="take_img" src="/images/back.png" alt="back of the card">
        <img id="img5" class="take_img" @click="take_card()" src="/images/back.png" alt="back of the card">
      </div>
      <div class="last-card">
       <img :src="'/cards/' + last_card_pl.id + '.png'" class="last_played_card" alt="Last Played Card" />
     </div>
      <div class="enemies_cards">


      </div>
      <h1 v-if="your_turn">ITS YOUR TURN!!</h1>

      <div class="my-cards">
        <div
            v-for="item in mycards"
            :key="item.id"
            class="card"
            @click="your_turn && handleClick(item)"
        >
          <img :src="'/cards/' + item.id + '.png'" class="player_cards" alt="My Card" />
        </div>
      </div>
      <!-- Game Controls -->

    </div>
  </template>



  <style scoped>
  h1{
    padding-top: 25%;
    font-size: 48px;
    width: 100%;
    text-align: center;
  }
  .take_img{
    position: absolute;
   height: 300px;
  }
  #img1{
    transform: rotate(4deg);
  }
  #img2{
    transform: rotate(-8deg);
  }
  #img3{
    transform: rotate(12deg);
  }
  #img4{
    transform: rotate(5deg);
  }
  #img5{
    rotate: -11deg;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }
  .container_deck_take{
    position: absolute;
    top: 20%;
    left: 60%;
    z-index: 1000;

  }
  #img5:hover{
transform: scale(1.05);
  }

  .player_cards, .last_played_card{
    height: 250px;
  }
  .last_played_card{
    position: absolute;
    top: 23%;
    left:45%;
  }
  .player_cards {
    position: relative;
    overflow: visible;
  }

  .my-cards {
    display: flex;
    flex-wrap: nowrap;
  }

  .my-cards > * {
    max-width: 150px;
    flex-shrink: 0;
    margin-right: -50px;
    transition:  transform 0.3s ease;
    position: relative;
  }


  .my-cards > *:hover {
    transform: translateY(-20px);
    z-index: 10;
  }



  .game-container {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }



  h1{
    color: white;
  }





  .controls {
    margin-top: 20px;
    text-align: center;
  }

  button {
    margin: 5px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background-color: #0056b3;
  }
  </style>
