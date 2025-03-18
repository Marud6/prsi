  <script>
  import { socket } from "@/socket";
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
          //this.mycards.splice(this.mycards.indexOf(item), 1);
          if(this.mycards.length===0){
            socket.emit("game_end",this.room_code);

          }
         socket.emit("play_card",this.room_code, item,this.your_username);
          this.next_player_turn()

        }
      },
      skip_turn(){
        this.skip=false
        this.next_player_turn()
       socket.emit("used_card",this.room_code);

      },
      take_card(){
        this.get_cardd()
        this.next_player_turn()

      },
      async get_from_seven(){
        this.take_cards=false;
        console.log(this.to_take+"cards to take")
        for (let i = 0; i <= this.to_take; i++) {
          await this.get_cardd();
        }
        socket.emit("used_card",this.room_code);
        this.next_player_turn()
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
      <h1 v-if="your_turn">ITS YOUR TURN!!</h1>
      <!-- Last Played Card in the Center -->
      <div class="last-card">
        <h3>{{ last_card_pl.id }}</h3>
       <p>{{ last_card_pl.value }}</p>
       <img :src="'/cards/' + last_card_pl.id + '.png'" alt="Last Played Card" />
       <div class="controls">
         <button v-if="your_turn && !take_cards && !skip" @click="take_card()">Get Card</button>
         <button v-if="your_turn && take_cards" @click="get_from_seven()">Get {{this.to_take}} Cards</button>
         <button v-if="your_turn && skip" @click="skip_turn()">Skip Turn</button>
       </div>
     </div>

     <!-- Your Cards at the Bottom -->
      <div class="my-cards">
        <div
            v-for="item in mycards"
            :key="item.id"
            class="card"
            @click="your_turn && handleClick(item)"
        >
          <img :src="'/cards/' + item.id + '.png'" alt="My Card" />
        </div>
      </div>

      <!-- Game Controls -->

    </div>
  </template>



  <style scoped>
  .game-container {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }

  .last-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .last-card img {
    height: 200px;
    width: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  h1{
    color: white;
  }

  .my-cards {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 10px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    position: absolute;
    top: 60%;
  }

  .card {
    cursor: pointer;
    transform: scale(1);
    transition: transform 0.2s ease-in-out;
  }

  .card:hover {
    transform: scale(1.1);
  }

  .card img {
    height: 200px;
    border-radius: 4px;
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
