<template>
  <v-app light>
    <v-snackbar v-model="snackbar">
      Bienvenue {{ displayName }} !
      <v-btn flat color="primary" @click.native="snackbar = false">fermer</v-btn>
    </v-snackbar>

    <v-navigation-drawer fixed v-model="drawer" app>
      <v-list>
        <div v-if="connected">
          <v-list-tile>
            <v-list-tile-action>
              <v-icon light>person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ displayName }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon light>exit_to_app</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title @click="signout()" style="cursor: pointer;">Se déconnecter</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </div>
        <div v-else>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon light>person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link to="/login" :key="$route.fullPath">
                <v-list-tile-title>Créer un compte / se connecter</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
        </div>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon light>question_answer</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link to="/aide">
              <v-list-tile-title>A propos & aide </v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon light>layers</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link to="/">
              <v-list-tile-title>Carte</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>

    <v-toolbar dense dark app class="primary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer" dark></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <img src="static/img/logo_white.png" height="25px" style="padding-left: 10px;">
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>

  </v-app>
</template>

<script>
import * as firebase from 'firebase'

// Initialize Firebase
let config = {
  apiKey: 'AIzaSyCQex4JKbyUpZHggelHR9INIIAiMetm6DQ',
  authDomain: 'aires-de-jeux-e8525.firebaseapp.com',
  databaseURL: 'https://aires-de-jeux-e8525.firebaseio.com',
  projectId: 'aires-de-jeux-e8525',
  storageBucket: 'aires-de-jeux-e8525.appspot.com',
  messagingSenderId: '105193380802'
}
if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

export default {
  data() {
    return {
      drawer: false,
      items: [
        {
          icon: 'bubble_chart',
          title: 'Se connecter / créer un compte'
        }
      ],
      title: 'PARC-ÉPIQUE',
      connected: false,
      displayName: '',
      uid: '',
      snackbar: false
    }
  },
  methods: {
    checkConnection() {
      let vm = this
      firebase.auth().onAuthStateChanged(
        function(user) {
          if (user) {
            vm.connected = true
            vm.displayName = user.displayName
            vm.uid = user.uid
            vm.snackbar = true
          } else {
            vm.connected = false
            vm.displayName = ''
            vm.uid = ''
          }
        },
        function(error) {
          console.log(error)
        }
      )
    },
    signout() {
      let vm = this
      firebase
        .auth()
        .signOut()
        .then(function() {
          vm.displayName = ''
          vm.connected = false
        })
    }
  },
  mounted() {
    this.checkConnection()
  }
}
</script>

<style>
html,
body,
#app,
.application--wrap,
.content {
  width: 100%;
  height: 100%;
}

.application {
  font-family: 'Dosis', sans-serif;
}

.application--wrap {
  min-height: 100%;
}

.content--wrap {
  height: calc(100% - 48px);
  height: -webkit-calc(100% - 48px);
}

.container {
  padding: 0;
}
</style>