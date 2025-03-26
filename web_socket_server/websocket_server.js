const Express = require("express")();
const cors = require("cors");
const Http = require("http").Server(Express);
const Socket_io = require("socket.io")(Http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let token="null";
get_token();
// Store room-specific game data
const Room_data = new Map();
function createRoomData(room_code) {
  return {
    winner: "404",
    game_started: false,
    players_info: [],
    deck_id: "404",
    player_on_turn: 404,
    last_played_card: {},
    to_take: 0,
    game_stage: 4,
    room_code: room_code,
  };
}

function Create_User(username, status, state,cards) {
  this.username = username;
  this.status = status;
  this.state = state;
  this.cards = cards;
}

async function fetchData(api) {
  const url = `http://api_server:3006/api/${api}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authorization': `${token}`, // Add JWT token to header
      }
    });  if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    try{
      return await response.json();

    }catch{
      return response
    }

  } catch (error) {
    console.error(error.message);
  }
}
async function get_token(){
  token= await fetchData("user/generateToken")
  console.log("got token");
}




Socket_io.on("connection", (socket) => {
  console.log(socket.id + " JOINED");

  socket.on("join_room", (room_id, user) => {
    socket.join(room_id);
    console.log(`Socket ${socket.id} joined room ${room_id}`);
    // Check if room exists, if not create new room data
    if (!Room_data.has(room_id)) {
      Room_data.set(room_id, createRoomData(room_id));
    }
    const data = Room_data.get(room_id);
    if(data.players_info.some(item => item.username === user)){
      const index = data.players_info.findIndex(item => item.username === user);
      data.players_info[index].state="online";
      console.log("reconnected");
      Socket_io.to(room_id).emit("player_joined_game", data.players_info,data.game_started);
      return;
    }else if(data.game_started===true){
      Socket_io.to(room_id).emit("player_joined_game", null ,data.game_started);
    }

    data.players_info.push(new Create_User(user, "Not ready", "online", [] ));
    socket.name = user;
    Socket_io.to(room_id).emit("player_joined_game", data.players_info);
  });

  async function start_game(room_id) {
    const data = Room_data.get(room_id);
    if (!data) return;
    data.player_on_turn = 0;
    data.deck_id = await fetchData("create_random_pack");
    console.log("Deck ID:", data.deck_id);
    data.last_played_card = await fetchData("get_card/" + data.deck_id);
    console.log("last card: "+data.last_played_card.id);
    if (data.last_played_card.id===11||data.last_played_card.id===12||data.last_played_card.id===13||data.last_played_card.id===14) {data.last_played_card.id=data.last_played_card.id+50}
    for (const item of data.players_info) {
      for (let i = 0; i < 4; i++) {
        const card = await fetchData("get_card/" + data.deck_id);
       item.cards.push(card);
      }
    }
    console.log("Starting game...");
    Socket_io.to(room_id).emit("data", data);
  }


  socket.on("user_got_card", (room_id,json,user) => {
    const data = Room_data.get(room_id);
    if (!data) return;
    const index = data.players_info.findIndex(item => item.username === user);
    data.players_info[index].cards.push(json);
    socket.emit("update_players", data.players_info[index].cards);
  });

  socket.on("next_turn", (room_id) => {
    const data = Room_data.get(room_id);
    if (!data) return;
    data.player_on_turn = (data.player_on_turn + 1) % data.players_info.length;
    Socket_io.to(room_id).emit("turn", data.players_info[data.player_on_turn].username);
  });

  socket.on("play_card", (room_id, card,username) => {
    const data = Room_data.get(room_id);
    if (!data) return;
    const user_index = data.players_info.findIndex(item => item.username === username);
    const index = data.players_info[user_index].cards.findIndex(item => item.id === card.id);
    if (index !== -1) {
      data.players_info[user_index].cards.splice(index, 1);
    }
    data.last_played_card = card;

    Socket_io.to(room_id).emit("data", data);
  });

  socket.on("take_increase", (room_id) => {
    const data = Room_data.get(room_id);
    if (!data) return;
    data.to_take += 2;
    Socket_io.to(room_id).emit("to_take_increase", data.to_take);
  });

  socket.on("game_end", (room_id) => {
    const data = Room_data.get(room_id);
    if (!data) return;
    data.winner = socket.name;
    Socket_io.to(room_id).emit("data", data);
  });

  socket.on("get_ready", async (room_id, user) => {
    const data = Room_data.get(room_id);
    if (!data) return;
    const index = data.players_info.findIndex(item => item.username === user);
    if (index !== -1) {
      data.players_info[index].status = "Ready";
      console.log(user+" ready " +room_id);
    }else{
      console.log(user+" ERROR! " +room_id);
    }
    // Check if all players are ready
    const allReady = data.players_info.every(player => player.status === "Ready");
    if (allReady) {
      console.log("Game starting...");
      await start_game(room_id);
      let count = 5;
      const countdown = setInterval(() => {
        Socket_io.to(room_id).emit("counter", count);
        count--;
        if (count < 0) {
          clearInterval(countdown);
          data.game_started = true;
          Socket_io.to(room_id).emit("player_joined_game", data.players_info,data.game_started);
        }
      }, 1000);
    }
    Socket_io.to(room_id).emit("player_joined_game", data.players_info,data.game_started);
  });

  socket.on("get_unready",(room_id, user)  => {
    const data = Room_data.get(room_id);
    if (!data) return;
    const index = data.players_info.findIndex(item => item.username === user);
    if (index !== -1) {
      console.log(user+" unready")
      data.players_info[index].status = "Not ready";
    }else{
      console.log(user+" ERROR!")
    }
    Socket_io.to(room_id).emit("player_joined_game", data.players_info,data.game_started);
  });

  socket.on("logout",async (room_id, user) => {

    const data = Room_data.get(room_id);
    if (!data){

      if(room_id===""){
        return;
      }

      if(await fetchData("room_exists/" + room_id)!==undefined){
        fetchData("delete_room/" + room_id);
      }

      return;
    }
    console.log(`${socket.id} disconnected, username: ${user}`);

    const index = data.players_info.findIndex(item => item.username === user);
    if (index !== -1) {
      data.players_info[index].state="offline";
    }

    if (data.players_info.every(user => user.state === "offline")) {
      data.game_stage = 0;
      console.log("Lobby deleting...");

      if (data.deck_id !== "404") {
        fetchData("delete_deck/" + data.deck_id);
        data.deck_id = "404";
      }
      if (data.room_code !== 404) {
        fetchData("delete_room/" + data.room_code);
        data.room_code = 404;
      }

      Room_data.delete(room_id); // Remove room data if empty
    }

    Socket_io.to(room_id).emit("data", data);
  });

  socket.on("get_data", (room_id) => {
    console.log("get data of "+room_id)
    const data = Room_data.get(room_id);
    if (data) {
      socket.emit("data", data);
    }
  });



  socket.on("used_card", (room_id) => {
    const data = Room_data.get(room_id);
    if (!data) return;

    if((data.last_played_card.id===71 || data.last_played_card.id===72 || data.last_played_card.id===73 || data.last_played_card.id===74)&&data.last_played_card.id !== undefined){
      data.last_played_card.id= data.last_played_card.id-70;
      data.to_take=0;
    }
    else {
      data.last_played_card.id= 50+data.last_played_card.id;
    }
    Socket_io.to(room_id).emit("card_used", data.last_played_card);
  });
});

Http.listen(3000, () => {
  console.log("Listening on port 3000...");

});
