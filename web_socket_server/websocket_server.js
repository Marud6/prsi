const Express = require("express")();
const cors = require("cors");
//const app = Express();
//app.use(cors());

const Http = require("http").Server(Express);
const Socket = require("socket.io")(Http, {
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


Socket.on("connection", (socket) => {
  socket.emit("data", data);
  socket.on("start", async () => {
    data.player_on_turn = 0;
    console.log(data.player_on_turn);
    data.last_played_card = {
      id: 54,
      value: 5,
      card_photo: "cards/54_card.png",
    };
    data.deck_id = "0";
    console.log("starting");
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });

  socket.on("logout", (user) => {
    console.log("user logout");
    data.players_names.splice(data.players_names.indexOf(user), 1);
    data.players_info.splice(data.players_names.indexOf(user), 1);
    if (data.players_info.length == 0) {
      console.log("delete lobby");
      //data.last_played_card=undefined;
      data.game_started = false;
      data.winner = 404;
    }
    socket.emit("data", data);
    socket.broadcast.emit("data", data);
  });
  socket.on("reset_game", () => {});

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
