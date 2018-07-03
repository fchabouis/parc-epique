<template>
  <v-app light>
    <v-snackbar v-model="snackbar" app>
      Bienvenue {{ displayName }} <span class="display-1">🤘</span>
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
              <v-list-tile-title @click='home'>{{ displayName }}</v-list-tile-title>
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
            <router-link to="/apropos">
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

    <v-toolbar dense dark app class="primary" style="background: url('static/img/paysage.png') bottom no-repeat; background-size: contain;">
      <v-toolbar-side-icon @click.stop="drawer = !drawer" dark></v-toolbar-side-icon>
      <v-toolbar-title id="toolbarTitle" style="cursor: pointer;" v-text="title" @click="home"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-dialog app v-model="welcomeDialog" max-width="500px">
      <v-card>
        <v-card-media src="/static/img/aire-de-jeux.jpg" height="200px">
        </v-card-media>
        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">Bienvenue sur Parc Épique !</h3>
            <div class="subheading">Une carte
              <span class="strong">collaborative</span> de toutes les aires de jeux pour enfants de France.
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-btn large color="primary" @click="welcomeDialog = false">C'est parti 🚀</v-btn>
          <v-checkbox label="Ne plus montrer" color="primary" v-model="dontShowAnyMore"></v-checkbox>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
      snackbar: false,
      welcomeDialog: !(localStorage.getItem('dontShowAnyMore') === 'true'),
      dontShowAnyMore: localStorage.getItem('dontShowAnyMore') === 'true'
    }
  },
  watch: {
    dontShowAnyMore() {
      localStorage.setItem('dontShowAnyMore', this.dontShowAnyMore)
    }
  },
  methods: {
    home() {
      this.$router.push('/')
    },
    checkConnection() {
      let vm = this
      firebase.auth().onAuthStateChanged(
        function(user) {
          if (user) {
            vm.connected = !user.isAnonymous
            vm.displayName = user.isAnonymous ? 'Utilisateur anonyme' : user.displayName
            vm.uid = user.uid
            vm.snackbar = !user.isAnonymous
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

@media screen and (max-width: 600px) {
  #toolbarTitle {
    display: none;
  }
}

.strong {
  font-weight: 600;
}
</style>