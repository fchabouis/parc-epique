<template>
  <div>
    <v-snackbar :color=snackbarColor v-model="snackbar">
      {{ snackbarMsg }}
      <v-btn color="orange" flat @click.native="snackbar = false">fermer</v-btn>
    </v-snackbar>

    <v-container>
      <h1>Outils d'administration</h1>
      <v-btn @click="DeleteAreasEnriched">Supprimer les aires enrichies</v-btn>
      <v-btn @click="copyAires" :loading="copyingAreas">Copier les aires</v-btn>
      <v-btn @click="copyComments">Copier les commentaires</v-btn>
      <v-btn @click="downloadDB">Créer dump base</v-btn>

      <h1 class="pt-5">Nouvelles aires</h1>
      <v-btn @click="lookForNewArea">Chercher nouvelles aires</v-btn>
      <v-select v-bind:items="newAreasList" v-model="newArea" label="Nouvelles Aires" single-line bottom></v-select>

      <p>
        <ul>
          <li v-for="(v, k) in newAreaDetails">
            {{ k }} : {{ v }}
          </li>
          <v-btn v-if="newAreaDetails" @click="validateNewArea">Valider nouvelle aire</v-btn>
          <v-btn v-if="newAreaDetails" @click="RejectNewArea">Rejeter nouvelle aire</v-btn>

        </ul>
      </p>
      <h1 class="pt-5">Validation de commentaires</h1>
      <v-btn @click="lookForNewActivity">Chercher activité non vérifiée</v-btn>
      <v-select v-bind:items="areasList" v-model="areaValidation" label="Aires" single-line bottom></v-select>

      <ul>
        <span v-for="(v, k) in details">
          <h4>
            {{ k }}
          </h4>
          <span v-for="(val, key) in v">
            <span v-if="key == 'validationPath'">
              <v-btn @click="validate(val)">Valider</v-btn>
              <v-btn @click="reject(val)">Rejeter</v-btn>
            </span>
            <li v-else-if="key == 'thumbnail'">
              <img :src="val">
            </li>
            <li v-else>
              {{ key }} : {{ val }}
            </li>
          </span>

          <div class="pb-3"></div>
        </span>
      </ul>
      <div id="mapAdmin"></div>

    </v-container>
  </div>
</template>

<script>
import * as firebase from 'firebase'
import GeoFire from 'geofire'
import L from 'leaflet'

export default {
  data() {
    return {
      copyingAreas: false,
      areaNeedingValidation: {},
      areaValidation: '',
      map: {},
      snackbar: false,
      snackbarMsg: '',
      snackbarColor: 'green',
      newAreas: {},
      newArea: ''
    }
  },
  components: {},
  computed: {
    areasList() {
      return Object.keys(this.areaNeedingValidation)
    },
    details() {
      return this.areaNeedingValidation[this.areaValidation]
    },
    newAreasList() {
      return Object.keys(this.newAreas)
    },
    newAreaDetails() {
      return this.newAreas[this.newArea]
    }
  },
  watch: {
    newArea() {
      this.showMap([this.newAreas[this.newArea].lat, this.newAreas[this.newArea].lon])
    },
    areaValidation() {
      this.showMap([this.details.coordonnees.lat, this.details.coordonnees.lon])
    }
  },
  methods: {
    showMap(latlng) {
      if ('remove' in this.map) {
        this.map.remove()
      }
      this.map = L.map('mapAdmin', {}).setView(latlng, 15)
      L.tileLayer(
        'https://api.mapbox.com/styles/v1/istopopoki/cj9ydd0jg7it52sp7pubunya6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXN0b3BvcG9raSIsImEiOiJjaW12eWw2ZHMwMGFxdzVtMWZ5NHcwOHJ4In0.VvZvyvK0UaxbFiAtak7aVw',
        {
          attribution:
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }
      ).addTo(this.map)
      L.marker(latlng).addTo(this.map)
    },
    lookForNewArea() {
      let vm = this
      this.newAreas = {}

      firebase
        .database()
        .ref('/nouvelle_aire/')
        .once('value', function(snapshot) {
          let na = snapshot.val()
          for (let area in na) {
            // console.log(area)
            let details = na[area]
            if (!('validated' in details)) {
              vm.$set(vm.newAreas, area, details)
            }
          }
        })
    },
    validateNewArea() {
      let vm = this
      firebase
        .database()
        .ref('/nouvelle_aire/' + vm.newArea)
        .update({ validated: true })
        .then(function() {
          vm.snackbarColor = 'green'
          vm.snackbarMsg = 'nouvelle aire validée'
          vm.snackbar = true
        })
    },
    RejectNewArea() {
      let vm = this
      firebase
        .database()
        .ref('/nouvelle_aire/' + vm.newArea)
        .remove()
        .then(function() {
          firebase
            .database()
            .ref('/aires_enrichies/' + vm.newArea)
            .remove()
          vm.snackbarColor = 'red'
          vm.snackbarMsg = 'nouvelle aire rejetée'
          vm.snackbar = true
        })
    },
    reject(rejectPath) {
      let vm = this
      let path = '/'
      for (let item of rejectPath) {
        path += item + '/'
      }
      firebase
        .database()
        .ref(path)
        .remove()
        .then(function() {
          vm.snackbarColor = 'red'
          vm.snackbarMsg = 'contribution rejetée'
          vm.snackbar = true
        })
      vm.lookForNewActivity()
    },
    validate(validationPath) {
      let vm = this
      let path = '/'
      for (let item of validationPath) {
        path += item + '/'
      }
      firebase
        .database()
        .ref(path)
        .update({ validated: true })
        .then(function() {
          vm.snackbarColor = 'green'
          vm.snackbarMsg = 'contribution validée'
          vm.snackbar = true
        })
      vm.lookForNewActivity()
    },
    lookForNewActivity() {
      let vm = this
      vm.areaNeedingValidation = {}

      // get comments
      let comments = firebase.database().ref('/comments/')
      comments.once('value', function(snapshot) {
        let c = snapshot.val()
        for (let area in c) {
          let users = Object.keys(c[area])
          for (let user of users) {
            // console.log(c[area][user])
            if (!('validated' in c[area][user])) {
              let contenu = c[area][user]
              contenu.uid = user
              contenu.validationPath = ['comments', area, user]
              vm.$set(vm.areaNeedingValidation, area, {
                commentaire: contenu
              })
            }
          }
        }
      })

      // get aires infos
      let infos = firebase.database().ref('/aires_infos/')
      infos.once('value', function(snapshot) {
        let i = snapshot.val()
        for (let area in i) {
          // console.log(area)
          let changes = i[area]
          // console.log(changes)
          for (let change in changes) {
            // console.log(change)
            if (!('validated' in changes[change])) {
              let areaContent = vm.areaNeedingValidation[area] || {}
              areaContent['infos ' + change] = i[area][change]
              areaContent['infos ' + change].validationPath = ['aires_infos', area, change]
              vm.$set(vm.areaNeedingValidation, area, areaContent)
            }
          }
        }
      })

      let images = firebase.database().ref('/images/')
      images
        .once('value', function(snapshot) {
          let i = snapshot.val()
          for (let area in i) {
            // console.log(area)
            let images = Object.keys(i[area])
            for (let image of images) {
              // console.log(i[area][image])
              if (!('validated' in i[area][image])) {
                let areaContent = vm.areaNeedingValidation[area] || {}
                areaContent['image ' + image] = { thumbnail: i[area][image].thumbnail }
                areaContent['image ' + image].validationPath = ['images', area, image]
                vm.$set(vm.areaNeedingValidation, area, areaContent)
              }
            }
          }
        })
        .then(function() {
          for (let area of vm.areasList) {
            // console.log(area)
            let areaf = firebase.database().ref('/aires_enrichies/' + area)
            areaf.once('value', function(snapshot) {
              let a = snapshot.val()
              // console.log(a)
              if (a) {
                let areaContent = vm.areaNeedingValidation[area] || {}
                areaContent.coordonnees = { lat: a.lat, lon: a.lon }
                // console.log(areaContent)
                vm.$set(vm.areaNeedingValidation, area, areaContent)
              }
            })
          }
        })
    },
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
          download(JSON.stringify(data), 'airesdejeux_bkp_' + Date.now() + '.json', 'text/plain')
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
#mapAdmin {
  height: 400px;
  z-index: 0;
}
</style>