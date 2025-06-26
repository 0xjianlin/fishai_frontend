<template>
  <div id="app">
    <FishIdentifier />
  </div>
</template>

<script>
import FishIdentifier from './components/FishIdentifier.vue'
export default {
  name: 'App',
  components: { FishIdentifier }
}
</script>

<style>
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f5f8fa;
  margin: 0;
  padding: 0;
}
#app {
  min-height: 100vh;
}
</style> 