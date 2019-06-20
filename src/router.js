import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
// import minimap from "./components/minimap.vue"
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/minimap",
      name: "minimap",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./components/minimap.vue")
    }
  ]
});
