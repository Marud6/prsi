const Express = require("express")();
const cors = require("cors");
//const app = Express();
//app.use(cors());

const Http = require("http").Server(Express);
const Socket_io = require("socket.io")(Http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


const data = {};
data.winner = 404;
data.game_started = false;
data.players_names = [];
data.players_info = [];
data.counter;
data.deck_id = "404";
data.player_on_turn = 404;
data.last_played_card = {};
data.to_take=0;
data.game_stage=4;

function Create_User(username, status, card) {
  this.username = username;
  this.status = status;
  this.card_value = card;
}
function indexOfMax(arr) {
  let maxIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i]["deck_value"] > arr[maxIndex]["deck_value"]) {
      maxIndex = i;
    }
  }
  return maxIndex;
}





async function fetchData(url) {
  const apiUrl = 'http://api_server:3006/api/'+url;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${apiUrl} `);

    }
    const data = await response.json(); // Parse the JSON response
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


Socket_io.on("connection", (socket) => {
  socket.emit("data", data);
  console.log(socket.id +"  JOINED");
  async function start_game(){
    data.player_on_turn = 0;
    data.deck_id=await fetchData("create_random_pack");
    console.log(data.deck_id);
    data.last_played_card = await fetchData("get_card/"+data.deck_id);
    console.log(data.last_played_card);
    console.log("starting");
    socket.emit("data", data);
    socket.broadcast.emit("data", data);


  }
  socket.on("logout", (user) => {
    console.log(socket.id + " disconnected");
    data.players_names.splice(data.players_names.indexOf(user), 1);
    data.players_info.splice(data.players_names.indexOf(user), 1);
    if (data.players_info.length === 0) {
      if(data.deck_id==="404"){

      }else{
        console.log("delete deck "+data.deck_id);
        fetchData("delete_deck/"+data.deck_id);
      }
      data.game_stage=4;
     // fetchData("delete_room/"+);
      data.game_started = false;
      data.winner = 404;
    }
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });




  socket.on("next_turn", () => {
    if (data.player_on_turn === data.players_names.length - 1) {
      data.player_on_turn = 0;
    } else {
      data.player_on_turn++;
    }
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
    console.log(data.player_on_turn);
  });

  socket.on("play_card", (card) => {
    console.log("user join");
    data.last_played_card = card;
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });

  socket.on("take_increase", () => {
    console.log("take increase");
    data.to_take =data.to_take+ 2;
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });


  socket.on("join_room", (room_id) => {
    socket.join(room_id)
    console.log("socket: "+socket.id+" joined "+socket.rooms);
    data.game_stage=0;
    socket.emit("data", data);
  });





  socket.on("used_card", () => {
    data.last_played_card.id +=50;
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });

  socket.on("PushUser", (user) => {
    console.log("user joined");
    data.players_info.push(new Create_User(user, "not ready", "not set"));
    data.players_names.push(user);
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });

  socket.on("get_ready", (user) => {
    data.players_info[data.players_names.indexOf(user["username"])]["status"] =
      "Ready";
    let players = 0;
    for (let i = 0; i < data.players_names.length; i++) {
      let status = data.players_info[i]["status"];
      if (status === "Ready") {
        players++;
      }
    }
    if (players === data.players_names.length) {
      console.log("game starting...");
      start_game();
      let count = 5;
      const countdown = setInterval(() => {
        data.counter = count; // Display in the console
        socket.emit("data", data);
        socket.broadcast.emit("data", data);
        count--;
        if (count < 0) {
          console.log("Time's up!");
          clearInterval(countdown);
          data.game_started = true;
          for (let i = 0; i < data.players_names.length; i++) {
            data.players_info[i]["status"] = "Not ready";
          }
          socket.emit("data", data);
          socket.broadcast.emit("data", data);
        }
      }, 1000);
    }
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });
  socket.on("get_unready", (user) => {
    data.players_info[data.players_names.indexOf(user["username"])]["status"] =
      "Not ready";
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });
});

Http.listen(3000, () => {
  console.log("listening on port 3000...");
});
