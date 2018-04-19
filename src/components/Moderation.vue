<template>
  <div>
    <v-snackbar :color=snackbarColor v-model="snackbar">
      {{ snackbarMsg }}
      <v-btn color="orange" flat @click.native="snackbar = false">fermer</v-btn>
    </v-snackbar>

    <v-bottom-sheet v-model="sheet">
      <div id="moderationMap">
      </div>
    </v-bottom-sheet>

    <!-- <v-container>
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
    </v-container> -->

    <v-container fluid>
      <h1 class="pt-5">Activité non validée</h1>
      <v-data-table :headers="areaNeedingValidation.headers" :items="areaNeedingValidation.list" class="elevation-1">
        <template slot="items" slot-scope="props">
          <td class="text-xs-right" @click="showMap(props.item.area)">{{ props.item.area }}</td>
          <td class="text-xs-right">{{ props.item.activity }}</td>
          <td class="text-xs-right">{{ props.item.timestamp }}</td>
          <td class="text-xs-right">{{ props.item.date }}</td>
          <td class="text-xs-right">{{ props.item.user }}</td>
          <td class="text-xs-right">{{ props.item.comment }}</td>
          <td class="text-xs-right">{{ props.item.equipementRating }}</td>
          <td class="text-xs-right">{{ props.item.surroundingsRating }}</td>
          <td class="text-xs-right">{{ props.item.equipmentList }}</td>
          <!-- <td class="text-xs-right">{{ props.item.Pictures }}</td> -->
          <td class="text-xs-right">
            <v-btn color="success" fab @click="validate(props.item.validationPath)">V</v-btn>
            <v-btn color="error" fab @click="reject(props.item.validationPath)">X</v-btn>
          </td>
        </template>
      </v-data-table>
      <div id="mapAdmin"></div>
    </v-container>
  </div>
</template>

<script>
import * as firebase from 'firebase'
import L from 'leaflet'

export default {
  data() {
    return {
      snackbar: false,
      snackbarMsg: '',
      snackbarColor: '',
      areaNeedingValidation: {},
      map: {},
      sheet: false
    }
  },
  components: {},
  computed: {},
  watch: {},
  methods: {
    showSnackbar(msg, color) {
      this.snackbarMsg = msg
      this.snackbarColor = color
      this.snackbar = true
    },
    showMap(area) {
      let vm = this
      this.sheet = true
      this.$nextTick(() => {
        vm.map.invalidateSize()
      })
      let areaFB = firebase.database().ref('/aires_enrichies/' + area)
      areaFB.once('value', function(snapshot) {
        let a = snapshot.val()
        let latlng = { lat: a.lat, lon: a.lon }
        vm.map.setView(latlng, 18)
        L.popup()
          .setLatLng(latlng)
          .setContent(area)
          .openOn(vm.map)
      })
    },
    // showMap(latlng) {
    //   if ('remove' in this.map) {
    //     this.map.remove()
    //   }
    //   this.map = L.map('mapAdmin', {}).setView(latlng, 15)
    //   L.tileLayer(
    //     'https://api.mapbox.com/styles/v1/istopopoki/cj9ydd0jg7it52sp7pubunya6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXN0b3BvcG9raSIsImEiOiJjaW12eWw2ZHMwMGFxdzVtMWZ5NHcwOHJ4In0.VvZvyvK0UaxbFiAtak7aVw',
    //     {
    //       attribution:
    //         'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    //     }
    //   ).addTo(this.map)
    //   L.marker(latlng).addTo(this.map)
    // },
    lookForNewArea() {
      let vm = this
      this.newAreas = {}
      this.newAreasN = 0

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
              vm.newAreasN++
            }
          }
        })
    },
    // validateNewArea() {
    //   let vm = this

    //   firebase
    //     .database()
    //     .ref('/nouvelle_aire/' + vm.newArea)
    //     .update({ validated: true })
    //     .then(function() {
    //       vm.snackbarColor = 'green'
    //       vm.snackbarMsg = 'nouvelle aire validée'
    //       vm.snackbar = true
    //     })
    // },
    // RejectNewArea() {
    //   let vm = this
    //   firebase
    //     .database()
    //     .ref('/nouvelle_aire/' + vm.newArea)
    //     .remove()
    //     .then(function() {
    //       firebase
    //         .database()
    //         .ref('/aires_enrichies/' + vm.newArea)
    //         .remove()
    //       vm.snackbarColor = 'red'
    //       vm.snackbarMsg = 'nouvelle aire rejetée'
    //       vm.snackbar = true
    //     })
    // },
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
          vm.showSnackbar('contribution validée', 'success')
        })
      vm.lookForNewActivity()
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
          vm.showSnackbar('contribution rejetée', 'error')
        })
      vm.lookForNewActivity()
    },
    lookForNewActivity() {
      let vm = this
      vm.areaNeedingValidation = {
        headers: [
          { text: 'Aire', value: 'area' },
          { text: 'Activité', value: 'activity' },
          { text: 'timestamp', value: 'timestamp', width: '1%' },
          { text: 'date', value: 'date' },
          { text: 'Utilisateur', value: 'user' },
          { text: 'commentaire', value: 'comment', width: '70%' },
          { text: 'Note Equipement', value: 'equipementRating' },
          { text: 'Note Cadre', value: 'surroundingsRating' },
          { text: 'Equipement', value: 'equipmentList' },
          // {text: 'Photos', value: 'Pictures'},
          { text: 'Modération', value: 'validationPath' }
        ],
        list: []
      }

      // get comments
      let comments = firebase.database().ref('/comments/')
      comments.once('value', function(snapshot) {
        let c = snapshot.val()
        for (let area in c) {
          let users = Object.keys(c[area])
          for (let user of users) {
            if (!('validated' in c[area][user])) {
              let contenu = c[area][user]
              vm.areaNeedingValidation.list.push({
                value: false,
                area: area,
                timestamp: contenu.timestamp,
                date: new Date(contenu.timestamp).toUTCString(),
                user: contenu.displayName,
                comment: contenu.comment,
                equipementRating: contenu.ratingEquipment,
                surroundingsRating: contenu.ratingSurroundings,
                activity: 'Commentaire',
                validationPath: ['comments', area, user]
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
          let changes = i[area]
          for (let change in changes) {
            if (!('validated' in changes[change])) {
              vm.areaNeedingValidation.list.push({
                value: false,
                area: area,
                timestamp: i[area][change].timestamp,
                date: new Date(i[area][change].timestamp).toUTCString(),
                user: i[area][change].uid,
                equipmentList: i[area][change].equipements,
                free: i[area][change].gratuit,
                openAtNight: i[area][change].ouvertNuit,
                validationPath: ['aires_infos', area, change],
                activity: 'Equipement'
              })
            }
          }
        }
      })

      // let images = firebase.database().ref('/images/')
      // images
      //   .once('value', function(snapshot) {
      //     let i = snapshot.val()
      //     for (let area in i) {
      //       // console.log(area)
      //       let images = Object.keys(i[area])
      //       for (let image of images) {
      //         // console.log(i[area][image])
      //         if (!('validated' in i[area][image])) {
      //           let areaContent = vm.areaNeedingValidation[area] || {}
      //           areaContent['image ' + image] = { thumbnail: i[area][image].thumbnail }
      //           areaContent['image ' + image].validationPath = ['images', area, image]
      //           vm.$set(vm.areaNeedingValidation, area, areaContent)
      //         }
      //       }
      //     }
      //   })
      //   .then(function() {
      //     for (let area of vm.areasList) {
      //       // console.log(area)
      //       let areaf = firebase.database().ref('/aires_enrichies/' + area)
      //       areaf.once('value', function(snapshot) {
      //         let a = snapshot.val()
      //         // console.log(a)
      //         if (a) {
      //           let areaContent = vm.areaNeedingValidation[area] || {}
      //           areaContent.coordonnees = { lat: a.lat, lon: a.lon }
      //           // console.log(areaContent)
      //           vm.$set(vm.areaNeedingValidation, area, areaContent)
      //         }
      //       })
      //     }
      //   })
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
    this.lookForNewActivity()

    this.map = L.map('moderationMap', {})

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/istopopoki/cj9ydd0jg7it52sp7pubunya6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXN0b3BvcG9raSIsImEiOiJjaW12eWw2ZHMwMGFxdzVtMWZ5NHcwOHJ4In0.VvZvyvK0UaxbFiAtak7aVw'
    ).addTo(this.map)
  }
}
</script>

<style>
#moderationMap {
  height: 500px;
}
</style>