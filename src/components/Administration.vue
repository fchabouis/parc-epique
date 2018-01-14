<template>
  <div>
    <v-container>
      <h1>Outils d'administration</h1>
      <v-btn @click="DeleteAreasEnriched">Supprimer les aires enrichies</v-btn>
      <v-btn @click="copyAires" :loading="copyingAreas">Copier les aires</v-btn>
      <v-btn @click="copyComments">Copier les commentaires</v-btn>
      <v-btn @click="downloadDB">Créer dump base</v-btn>
    </v-container>
  </div>
</template>

<script>
import * as firebase from 'firebase'
import GeoFire from 'geofire'

export default {
  data() {
    return {
      copyingAreas: false
    }
  },
  components: {},
  computed: {},
  methods: {
    downloadDB() {
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
          download(JSON.stringify(data), 'airesdejeux_bkp.txt', 'text/plain')
        })
        .then(function() {
          console.log('succès')
        })
        .then(function(reason) {
          console.log(reason)
        })
    },
    copyComments() {
      let comments = firebase.database().ref('/comments/')
      comments.on('value', function(snapshot) {
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
          console.log('Tous les commentaires ont été copiés dans les aires.')
        }
      })
    },
    copyAires() {
      let vm = this
      let areas = firebase.database().ref('/aires/')
      areas.on('value', function(snapshot) {
        vm.copyingAreas = true
        let areasList = snapshot.val()
        for (let area in areasList) {
          // console.log(areasList[area])
          firebase
            .database()
            .ref('/aires_enrichies/' + area)
            .set(areasList[area])
            .then(
              function(value) {
                // console.log('Nouvelle rentrée avec succès')
              },
              function(reason) {
                // console.log('echec!')
              }
            )
        }
        console.log('Toutes les aires sont copiées.')
        vm.copyingAreas = false
      })
    },
    DeleteAreasEnriched() {
      firebase
        .database()
        .ref('/aires_enrichies/')
        .set({})
        .then(
          function(value) {
            console.log('Toutes les aires enrichies sont supprimées')
          },
          function(reason) {
            console.log('Echec suppression des aires enrichies')
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
  }
}
</script>

<style>

</style>