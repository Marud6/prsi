<script >
</script>

<template>
  <RouterView />
</template>


<style>
.start_menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}
.button {
  margin-top: 10px;
  padding: 20px 30px;
  border-radius: 30px;
  font-size: 20px;
  background: white;
  color: black;
  border: none;
  box-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}
button:hover {
  background: #141414;
  color: white;
}
.text {
  color: white;
  font-size: 80px;
  margin: 10px;
  margin-bottom: 50px;
  text-shadow: 2px 4px 3px rgba(0, 0, 0, 0.4);
}

.input {
  display: block;
  margin-bottom: 15px;
  font-size: 20px;
  color: black;
  width: 300px;
  padding: 15px 20px;
  border: none;
  border-radius: 30px;
  background: transparent;
  font-size: 30px;
  color: #fff;
  text-align: center;
  outline: none;
  box-shadow: 0 0 10px rgb(9, 5, 91), 0 0 20px rgb(9, 5, 91),
  0 0 40px rgb(9, 5, 91);
  transition: 0.3s ease;
}
::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
body {
  background: rgb(2, 0, 36);
  background: linear-gradient(
      90deg,
      rgba(2, 0, 36, 1) 0%,
      rgba(9, 39, 121, 1) 50%,
      rgba(125, 0, 255, 1) 100%
  );
  font-family: "Verdana";
}
</style>