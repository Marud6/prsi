<script setup>

</script>

<template>
  <img src="/images/table.jpg" class="background"  alt="table photo">

  <div class="blur-background">
    <div class="deck">
      <img class="back_card" id="img1" src="/images/back.png" alt="back of the card">
      <img class="back_card" id="img2" src="/images/back.png" alt="back of the card">
      <img class="back_card" id="img3" src="/images/back.png" alt="back of the card">
      <img class="back_card" id="img4" src="/images/back.png" alt="back of the card">
      <img class="back_card" id="img5" src="/images/back.png" alt="back of the card">
      <div class="decorations">
        <img class="front_card" id="img7" src="/cards/94.png" alt="card image">
        <img class="front_card" id="img8" src="/cards/42.png" alt="card image">
        <img class="front_card" id="img6" src="/cards/51.png" alt="card image">
        <img class="front_card" id="img11" src="/cards/83.png" alt="card image">
        <img class="front_card" id="img10" src="/cards/61.png" alt="card image">
        <img class="front_card" id="img9" src="/cards/33.png" alt="card image">
      </div>
    </div>
  </div>

</template>

<style scoped>

.background{
    filter: blur(3px) ;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;

  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

#img1{
  transform: rotate(95deg);
  right: 45%;

}
#img2{
  transform: rotate(93deg);
  right: 45%;

}
#img3{
  transform: rotate(74deg);
  right: 45%;

}
#img4{
  transform: rotate(87deg);
  right: 45%;

}
#img5{
  transform: rotate(85deg);
  right: 45%;

}
#img6{
  right: -5%;
  bottom: -10%;
  transform: rotate(-43deg);
}
#img7{
  right: 4%;
  bottom: -1%;
  transform: rotate(-20deg);
}
#img8{
  bottom: 5vh;
  right: -5%;
  transform: rotate(-72deg);

}
#img9{
  left: 3%;
  bottom: -10%;
  transform: rotate(26deg);

}
#img10{
  transform: rotate(-24deg);
  bottom: -5%;
  left: 2%;

}
#img11{
  transform: rotate(30deg);
  left: -5%;
  bottom: -3%;
}
</style>