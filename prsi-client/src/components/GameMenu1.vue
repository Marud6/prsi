<script>
export default {
  data() {
    return {
      room_code:404,
    };
  },
  methods: {
    Join_game() {
      if (this.username === "") return;
      console.log("your user name "+this.username);
      sessionStorage.setItem("Username", this.username);
      window.location.href = "/lobby/"+this.$route.params.id;
    },

  },
};
</script>
<template>

  <div>
    <h1>Enter your username</h1>
    <div class="mb-3">
      <input class="input" v-model="username" placeholder="username" />
    </div>
    <div class="mb-3">
      <button class="button"  @click="Join_game">Start Game</button>
    </div>
    <div class="mb-3">
      <a href="/">Back</a>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

a{
  padding: 16px;
}

.mb-3{
  display: flex;
  justify-content: center;

}

h1 {
  color: white;
  text-align: center;
  font-size: 80px;

  text-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}
</style>
