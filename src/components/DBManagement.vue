<template>
  <div>
    <v-snackbar :color=snackbarColor v-model="snackbar">
      {{ snackbarMsg }}
      <v-btn color="orange" flat @click.native="snackbar = false">fermer</v-btn>
    </v-snackbar>

    <v-container>
      <h1 class="pt-5 red--text" color="error">Gestion de la base</h1>
      <v-btn @click="DeleteAreasEnriched">Supprimer les aires enrichies</v-btn>
      <v-btn @click="copyAires" :loading="copyingAreas">Copier les aires</v-btn>
      <v-btn @click="copyComments">Copier les commentaires</v-btn>
      <v-btn @click="downloadDB">Créer dump base</v-btn>
    </v-container>
  </div>
</template>

<script>
import firebase from 'firebase/compat/app'
import GeoFire from 'geofire'

export default {
  data() {
    return {
      copyingAreas: false,
      snackbar: false,
      snackbarMsg: '',
      snackbarColor: ''
    }
  },
  computed: {},
  watch: {},
  methods: {
    showSnackbar(msg, color) {
      this.snackbarMsg = msg
      this.snackbarColor = color
      this.snackbar = true
    },
    downloadDB() {
      let vm = this
      function download(text, name, type) {
        let a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'
        let file = new Blob([text], { type: type })
        let url = URL.createObjectURL(file)
        a.href = url
        a.download = name
        a.click()
        window.URL.revokeObjectURL(url)
      }
      let db = firebase.database().ref('/')
      db
        .once('value', function(snapshot) {
          let data = snapshot.val()
          download(JSON.stringify(data), 'airesdejeux_bkp_' + Date.now() + '.json', 'text/plain')
        })
        .then(function() {
          vm.showSnackbar('succès du téléchargement de la base', 'success')
        })
        .then(function(reason) {
          vm.showSnackbar('echec du téléchargement de la base : ' + reason, 'error')
        })
    },
    copyComments() {
      let vm = this
      let comments = firebase.database().ref('/comments/')
      comments.once('value', function(snapshot) {
        let c = snapshot.val()
        for (let area in c) {
          let users = Object.keys(c[area])
          for (let user of users) {
            let newuid = firebase
              .database()
              .ref('/aires_enrichies/' + area + '/uid_comments')
              .push()
            newuid.set(user)
          }
          vm.showSnackbar('Tous les commentaires ont été copiés dans les aires.', 'success')
        }
      })
    },
    copyAires() {
      let vm = this
      let areas = firebase.database().ref('/aires/')
      areas.once('value', function(snapshot) {
        vm.copyingAreas = true
        let areasList = snapshot.val()
        for (let area in areasList) {
          firebase
            .database()
            .ref('/aires_enrichies/' + area)
            .set(areasList[area])
            .then(
              function(value) {
                // console.log('Nouvelle rentrée avec succès')
              },
              function(reason) {
                vm.showSnackbar("Une aire n'a pas pu être copiée", 'error')
              }
            )
        }
        vm.showSnackbar('Fin de la copie des aires', 'success')
        vm.copyingAreas = false
      })
    },
    DeleteAreasEnriched() {
      let vm = this
      firebase
        .database()
        .ref('/aires_enrichies/')
        .set({})
        .then(
          function(value) {
            vm.showSnackbar('Toutes les aires enrichies sont supprimées', 'success')
          },
          function(reason) {
            vm.showSnackbar('Echec suppression des aires enrichies', 'error')
            console.log(reason)
          }
        )
    },
    geoFireInitialize() {
      // GeoFire initialisation
      let firebaseRef = firebase.database().ref('geofire')
      let geofire = new GeoFire(firebaseRef)
      let aires = firebase.database().ref('aires')
      aires.once('value', function(snapshot) {
        let val = snapshot.val()
        for (let a in val) {
          let aire = val[a]
          geofire.set(a, [aire.lat, aire.lon]).then(function() {
            console.log(a + ' initially set to [' + [aire.lat, aire.lon] + ']')
          })
        }
      })
    }
  },
  mounted() {
    // Initialize Firebase
    let config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(config)
    }
  }
}
</script>

<style>

</style>
