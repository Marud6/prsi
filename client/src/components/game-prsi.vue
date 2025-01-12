  <script>
  import io from "socket.io-client";


  export default {


    data() {
      return {
        mycards: [],
        socket: {},
        deck: {},
        numbers: 0,
        index: 0,
        users: [""],
        your_username: sessionStorage.getItem("Username"),
        counter: 0,
        deck_id: "0",
        last_card_pl: {},
        your_turn: false,
        skip:false,
        take_cards: false,
        to_take: 0,
      };
    },
    created() {
      this.socket = io("http://localhost:3000");
      for (let i = 0; i < 4; i++) {
        this.get_cardd()
      }
      this.last_card_pl={};
      this.skip=false;
    //this.get_First_cardd();
      //set last card in websocket





    },
    mounted() {
      this.your_username = sessionStorage.getItem("Username");
      this.socket.on("data", (data) => {
        this.numbers = data.number;
        this.users = data.players_names.length;
        this.users_info = data.users_info;
        this.counter = data.counter;
        this.deck_id = data.deck_id;
        this.last_card_pl=data.last_played_card;
        console.log("Received data:", data);
        if(data.players_names[data.player_on_turn]===this.your_username){
          this.your_turn = true;
        }else {
          this.your_turn = false;
        }
        if(this.your_turn && this.last_card_pl.value===1){
          console.log("you can skip your turn button")
          this.skip=true;
        }
        if(this.last_card_pl.value===69){
          this.skip=false;
          this.take_cards = false;
          this.to_take = 0;
        }
        if(this.last_card_pl.value===7){
          this.to_take += 2;
          this.last_card_pl.value=69;
          console.log("you will take " + this.to_take)
          if(this.your_turn){
            this.take_cards=true;
          }
        }












      });
    },

    methods: {

      async can_i_play(id) {
        if(this.last_card_pl.value===69){return "ok";}
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

          return data["status"];

        } catch (error) {
          console.error(error.message);
        }
      },


  next_player_turn(){
    this.socket.emit("next_turn");
  },






      async handleClick(item) {

        //alert(`post card back to pack ${item.id}`);
        const can=await this.can_i_play(item.id)
        if(can==="ko"){
          alert(`you can not play this card ${item.id}`);
        }else {

          fetch("http://localhost:3006/api/post_card/0", {
            method: "POST",
            body: JSON.stringify({
              id: this.last_card_pl.id
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          });
          this.mycards.splice(this.mycards.indexOf(item), 1);
          this.socket.emit("play_card", item);
          this.next_player_turn()

        }
      },

      skip_turn(){
        this.skip=false
        this.next_player_turn()
        this.socket.emit("used_card");

      },
      async get_from_seven(){
        this.take_cards=false;
        console.log(this.to_take)
        for (let i = 0; i <= this.to_take; i++) {
          console.log(i)

          await this.get_cardd();
        }
      },


      async get_cardd(){
        const url = "http://localhost:3006/api/get_card/0";
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          const json = await response.json();
          this.next_player_turn()
          //add element with card number id
          this.mycards.push(json);

          console.log(this.mycards);
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
        <!--<h3>{{ last_card_pl.id }}</h3>
       <p>{{ last_card_pl.value }}</p>-->
       <img :src="'/cards/' + last_card_pl.id + '.png'" alt="Last Played Card" />
       <div class="controls">
         <button v-if="your_turn && !take_cards && !skip" @click="get_cardd()">Get Card</button>
         <button v-if="your_turn && take_cards" @click="get_from_seven()">Get Cards</button>
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
