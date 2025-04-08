const express = require("express");
const fs = require("fs");
const cors = require("cors");
const jwt = require('jsonwebtoken');

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000; // Fixed environment variable casing
app.listen(port, () => console.log(`Server running on port ${port}`));

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


async function createDeckWithRandomOrder() {
  try {
    const cards = await prisma.card.findMany();
    if (cards.length !== 32) throw new Error("Deck must contain exactly 32 cards.");

    const shuffledCards = shuffleArray(cards);

    const newDeck = await prisma.deck.create({
      data: {
        deckCards: {
          create: shuffledCards.map((card, index) => ({
            cardId: card.id,
            order: index + 1,
          })),
        },
      },
      include: { deckCards: true },
    });

    console.log("Deck created with ID:", newDeck.id);
    return newDeck.id;
  } catch (error) {
    console.error("Error creating deck:", error);
    throw error;
  }
}

async function decreaseAllCardOrders(deckId) {
  try {
    await prisma.deckCard.updateMany({
      where: { deckId, order: { gt: 1 } },
      data: { order: { decrement: 1 } },
    });
  } catch (error) {
    console.error(`Error decreasing card orders for deck ${deckId}:`, error);
  }
}

async function fetchAndDeleteFirstCard(deckId) {
  try {
    const firstCard = await prisma.deckCard.findFirst({
      where: { deckId, order: 1 },
      include: { card: true },
    });

    if (!firstCard) return null;

    await prisma.deckCard.delete({ where: { id: firstCard.id } });
    await decreaseAllCardOrders(deckId);
    return firstCard.card;
  } catch (error) {
    console.error(`Error fetching and deleting the first card from deck ${deckId}:`, error);
  }
}

async function postCardIntoDeck(deckId, cardId) {
  try {
    const maxOrderCard = await prisma.deckCard.findFirst({
      where: { deckId },
      orderBy: { order: "desc" },
    });

    const newOrder = maxOrderCard ? maxOrderCard.order + 1 : 1;
    const newDeckCard = await prisma.deckCard.create({
      data: { deckId, cardId, order: newOrder },
    });

    return newDeckCard;
  } catch (error) {
    console.error(`Error adding card to deck ${deckId}:`, error);
  }
}

async function deleteDeck(deckId) {
  try {
    await prisma.deck.delete({ where: { id: deckId } });
    console.log(`Deck with ID ${deckId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting deck with ID ${deckId}:`, error);
  }
}

async function createCardsFromFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    for (const card of data.cards) {
      await prisma.card.create({
        data: { id: card.id, imageSrc: card.card_photo },
      });
    }
  } catch (error) {
    console.error("Error creating cards:", error);
  }
}
//createCardsFromFile("jsons/cards.json")///

function validateToken(req, res, next) {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send("Access Denied: No Token Provided!");
  }
  try {
    const verified = jwt.verify(token, jwtSecretKey);
    req.user = verified;
    console.log("token ok")
    next();
  } catch (error) {
    res.status(403).send("Access Denied: Invalid Token!");
  }
}
//
app.get("/api/user/generateToken", (req, res) => {
  console.log("generate token")
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  let data = {
    time: Date(),
    userId: 12,
  }

  const token = jwt.sign(data, jwtSecretKey);

  res.send(JSON.stringify(token));
});

app.get("/api/create_room", async (req, res) => {
  try {
    console.log("create room")

    const randNum = getRandomNumber(100000, 999999);
    await prisma.rooms.create({ data: { room_code: randNum } });
    res.send(randNum.toString());
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to create room" });
  }
});

async function checkRoomExists(roomCode) {
  return await prisma.rooms.findUnique({ where: { room_code: roomCode } }) !== null;
}
//
  app.get("/api/room_exists/:id", validateToken, async (req, res) => {

    const roomCode = parseInt(req.params.id, 10);
    console.log("room exists "+ roomCode)

    const exists = await checkRoomExists(roomCode);
  res.send(exists);
});

async function deleteRoom(roomId) {
  try {
    await prisma.rooms.delete({ where: { room_code: roomId } });
  } catch (error) {
    console.error(`Error deleting room with ID ${roomId}:`, error);
  }
}

app.get("/api/delete_room/:id", async (req, res) => {
  console.log("delete room  "+ req.params.id)



  await deleteRoom(parseInt(req.params.id, 10));
  res.sendStatus(200);
});

function splitNumberIntoDigits(number) {
  return number.toString().split("").map(Number);
}

app.get("/api/create_random_pack", async (req, res) => {
  console.log("create random pack ")

  const deckId = await createDeckWithRandomOrder();
  res.send(deckId.toString());
});

app.get("/api/get_card/:id", async (req, res) => {
  console.log("get card ")

  const card = await fetchAndDeleteFirstCard(parseInt(req.params.id, 10));
  res.send(card);
});

app.get("/api/delete_deck/:id", async (req, res) => {
  console.log("delete deck ")

  await deleteDeck(parseInt(req.params.id, 10));
  res.sendStatus(200);
});

app.post("/api/post_card/:id", async (req, res) => {
  console.log("post card ")

  let cardId = req.body.id;
  if (splitNumberIntoDigits(cardId)[0] === 6) {
    cardId -= 50;
  }
  await postCardIntoDeck(parseInt(req.params.id, 10), cardId);
  res.sendStatus(200);
});

app.post("/api/play_card", (req, res) => {
  console.log("play card ")

  const card1Id = splitNumberIntoDigits(req.body.id1);
  const card2Id = splitNumberIntoDigits(req.body.id2);

  if (
      card1Id[0] === card2Id[0] ||
      (card2Id[0] === 6 && card1Id[0] === 1) ||
      (req.body.id2 === card1Id[1] || card1Id[0] === 7)
  ) {
    return res.send({ status: "ok" });
  }

  if (card1Id[1] === card2Id[1] && card2Id[0] !== 1) {
    return res.send({ status: "ok" });
  }

  res.send({ status: "ko" });
});
