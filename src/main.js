import { createApp } from 'vue';
import App from './App.vue';
import Notifications from '@kyvg/vue3-notification';
// If you use vue-router and/or vuex, import them:
// import router from './router'
// import store from './store'

const app = createApp(App);
// If you use router or store, uncomment below:
// app.use(router)
// app.use(store)
app.use(Notifications);
app.mount('#app');
