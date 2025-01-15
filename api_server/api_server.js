const express = require("express");
const fs = require("fs");
const path = require("path");
const deck = require("./jsons/cards.json");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

async function createDeckWithRandomOrder() {
  try {
    // Fetch all cards from the database
    const cards = await prisma.card.findMany();

    if (cards.length !== 32) {
      throw new Error("There must be exactly 32 cards in the database to create a deck.");
    }

    // Shuffle the cards to create a random order
    const shuffledCards = cards.sort(() => Math.random() - 0.5);

    // Create a new deck
    const newDeck = await prisma.deck.create({
      data: {
        deckCards: {
          create: shuffledCards.map((card, index) => ({
            cardId: card.id,
            order: index + 1, // Assign a unique order
          })),
        },
      },
      include: {
        deckCards: true, // Include deckCards in the response
      },
    });

    console.log('Deck created with ID:', newDeck.id);
    return newDeck.id;
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}



async function decreaseAllCardOrders(deckId) {
  try {
    // Decrease the order of all cards in the specified deck
    const updatedCards = await prisma.deckCard.updateMany({
      where: {
        deckId: deckId,
        order: {
          gt: 1, // Only update cards with an order greater than 1
        },
      },
      data: {
        order: {
          decrement: 1, // Decrease the order by 1
        },
      },
    });

    console.log(
        `Successfully decreased the order of ${updatedCards.count} cards in deck ${deckId}.`
    );

    return updatedCards;
  } catch (error) {
    console.error(`Error decreasing card orders for deck ${deckId}:`, error);
  }
}


async function fetchAndDeleteFirstCard(deckId) {
  try {
    // Find the first card in the deck (order = 1)
    const firstCard = await prisma.deckCard.findFirst({
      where: {
        deckId: deckId,
        order: 1,
      },
      include: {
        card: true, // Include card details
      },
    });

    if (!firstCard) {
      console.log(`No cards found in deck with ID ${deckId}.`);
      return null;
    }

    console.log('First card in the deck:', firstCard.card);

    // Delete the first card from the deck
    await prisma.deckCard.delete({
      where: {
        id: firstCard.id,
      },
    });

    console.log(`First card with ID ${firstCard.cardId} removed from deck ${deckId}.`);
    await decreaseAllCardOrders(deckId);
    return firstCard.card;
  } catch (error) {
    console.error(`Error fetching and deleting the first card from deck ${deckId}:`, error);
  }
}





async function postCardIntoDeck(deckId, cardId) {
  try {
    // Find the maximum order in the deck
    const maxOrderCard = await prisma.deckCard.findFirst({
      where: { deckId: deckId },
      orderBy: { order: 'desc' },
    });

    // Calculate the new order
    const newOrder = maxOrderCard ? maxOrderCard.order + 1 : 1; // If no cards exist, start at 1

    // Add the new card to the deck with the calculated order
    const newDeckCard = await prisma.deckCard.create({
      data: {
        deckId: deckId,
        cardId: cardId,
        order: newOrder,
      },
    });
    console.log(`Card with ID ${cardId} added to deck ${deckId} at order ${newOrder}.`);
    return newDeckCard;
  } catch (error) {
    console.error(`Error adding card to deck ${deckId}:`, error);
  }
}

async function deleteDeck(deckId) {
  try {
    await prisma.deck.delete({
      where: { id: deckId },
    });
    console.log(`Deck with ID ${deckId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting deck with ID ${deckId}:`, error);

  }
}
////



function splitNumberIntoDigits(number) {
  return number.toString().split("").map(Number);
}

const port = process.env.Port || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

app.get("/api/create_random_pack",async  (req, res) => {
 const deck_id= await createDeckWithRandomOrder();

  res.send(deck_id.toString());
});

app.get("/api/get_card/:id", async (req, res) => {
  const deck_id = parseInt(req.params.id,10);
    const response=await fetchAndDeleteFirstCard(deck_id);
  res.send(response);
});

app.get("/api/delete_deck/:id", async (req, res) => {
  const deck_id = parseInt(req.params.id,10);
  const response=await deleteDeck(deck_id);
  res.send("ok");
});
app.post("/api/post_card/:id", (req, res) => {
  let cardId = req.body.id;
  if(splitNumberIntoDigits(cardId)[0]===6){
    cardId=cardId-50;
  };
  const requestedId = parseInt(req.params.id,10);
  postCardIntoDeck(requestedId,cardId)
  res.status(200)

});
app.post("/api/play_card", (req, res) => {
  const card1Id = splitNumberIntoDigits(req.body.id1);
  const card2Id = splitNumberIntoDigits(req.body.id2);
 if (card1Id[0] === card2Id[0]) {
    res.send({ status: "ok" });
 }else if(card2Id[0]===6 && card1Id[0] === 1) {//na 1 skip jde zahrat 1
   res.send({ status: "ok" });
 }
 else if (card1Id[1] === card2Id[1]) {
   // if (card2Id[0] === 7 || card2Id[0] === 1) {
    if (card2Id[0] === 1) {
      res.send({ status: "ko" });
    } else {
      res.send({ status: "ok" });
    }
  } else {
    res.send({ status: "ko" });
  }
  console.log("Played card");
});
