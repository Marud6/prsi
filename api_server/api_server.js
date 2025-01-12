const express = require("express");
const fs = require("fs");
const path = require("path");
const deck = require("./jsons/cards.json");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "db",
  user: "root",
  password: "example",
  database: "your_database_name",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function splitNumberIntoDigits(number) {
  return number.toString().split("").map(Number);
}

const port = process.env.Port || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

app.get("/api/create_random_pack", (req, res) => {
  const shuffledDeck = { ...deck, cards: shuffle([...deck.cards]), deck_id: "0" };
  const deckFilePath = path.join(__dirname, "jsons", `Deck_${shuffledDeck.deck_id}.json`);
  try {
    fs.writeFileSync(deckFilePath, JSON.stringify(shuffledDeck, null, 2));
    res.send({ deck_id: shuffledDeck.deck_id });
    console.log("Created random pack");
  } catch (error) {
    console.error("Error creating pack:", error);
    res.status(500).send({ error: "Failed to create pack" });
  }
});

app.get("/api/get_card/:id", (req, res) => {
  const requestedId = req.params.id;
  const deckFilePath = path.join(__dirname, "jsons", `Deck_${requestedId}.json`);

  try {
    const deckData = JSON.parse(fs.readFileSync(deckFilePath));
    if (deckData.cards.length === 0) {
      console.log("Deck is empty");
      return res.status(404).send({ error: "Deck is empty" });
    }
    const card = deckData.cards.shift();
    fs.writeFileSync(deckFilePath, JSON.stringify(deckData, null, 2));
    res.send(card);
    console.log("Retrieved card");
  } catch (error) {
    console.error("Error retrieving card:", error);
    res.status(500).send({ error: "Failed to retrieve card" });
  }
});

app.post("/api/post_card/:id", (req, res) => {
  const cardId = req.body.id;
  const requestedId = req.params.id;
  const deckFilePath = path.join(__dirname, "jsons", `Deck_${requestedId}.json`);

  try {
    const deckData = JSON.parse(fs.readFileSync(deckFilePath));
    const card = deck.cards.find((c) => c.id === cardId);
    if (card) {
      deckData.cards.push(card);
      fs.writeFileSync(deckFilePath, JSON.stringify(deckData, null, 2));
      res.send({ status: "ok" });
      console.log("Posted card into pack");
    } else {
      res.status(404).send({ error: "Card not found" });
    }
  } catch (error) {
    console.error("Error posting card:", error);
    res.status(500).send({ error: "Failed to post card" });
  }
});

app.post("/api/play_card", (req, res) => {
  const card1Id = splitNumberIntoDigits(req.body.id1);
  const card2Id = splitNumberIntoDigits(req.body.id2);
  if (card1Id[0] === 4) {
    res.send({ status: "ok" });
  } else if (card1Id[0] === card2Id[0]) {
    res.send({ status: "ok" });
  } else if (card1Id[1] === card2Id[1]) {
    if (card2Id[0] === 7 || card2Id[0] === 1) {
      res.send({ status: "ko" });
    } else {
      res.send({ status: "ok" });
    }
  } else {
    res.send({ status: "ko" });
  }
  console.log("Played card");
});
