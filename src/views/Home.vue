<template>
  <div class="home">
<!--    <img alt="Vue logo" src="../assets/logo.png" />-->
    <Graph msg="Welcome to Your Vue.js App"></Graph>
  </div>
</template>

<script>
// @ is an alias to /src
import Graph from "@/components/Graph.vue";

export default {
  name: "home",
  components: {
    Graph
  }
};
</script>
