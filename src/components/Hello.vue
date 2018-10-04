<template>
  <div style="height: 100%;">

    <div id="map"></div>

    <v-snackbar v-model="snackbar">
      {{ snackbarMsg }}
      <v-btn flat color="primary" @click.native="snackbar = false">fermer</v-btn>
    </v-snackbar>

    <v-dialog v-model="askForSignIn" transition="scale-transition" :overlay="false" max-width="290">
      <v-card>
        <v-card-title class="headline">Petite question 🙈</v-card-title>
        <v-card-text>
          <v-container>
            <p>
              Votre contribution en tant qu'
              <strong>utilisateur anonyme</strong> est enregistrée. Merci !
            </p>
            <p>
              Ça vous dit de vous
              <strong>enregistrer</strong> pour que vos contributions portent votre nom ?
            </p>
            <p>
              C'est trèèès rapide 🚀
            </p>
            <router-link to="/login">
              <v-btn color="primary" dark flat @click.stop="addArea">Oui</v-btn>
            </router-link>
            <v-btn color="secondary" dark flat @click.stop="askForSignIn = false">non</v-btn>

          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogAddArea" transition="scale-transition" :overlay="false" max-width="290">
      <v-card>
        <v-card-title class="headline">Ajouter une aire</v-card-title>
        <v-card-text>
          <v-container>
            <div class="pb-3">
              Vous souhaitez ajouter une aire de jeux ? C'est ici que ça se passe.
            </div>
            <div class="">
              Un marqueur va apparaître sur la carte. Faites le glisser précisement jusqu'au bon endroit, puis cliquez dessus pour confirmer.
            </div>
            <v-btn color="primary" dark flat @click.stop="addArea">Ok !</v-btn>
            <v-btn color="secondary" dark flat @click.stop="dialogAddArea = false">Annuler</v-btn>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogConfirmArea" transition="scale-transition" :overlay="false" max-width="290">
      <v-card>
        <v-card-title class="headline">Enregister la nouvelle aire ?</v-card-title>
        <v-card-text>
          <v-container>
            <div class="pb-3">
              Vous êtes sur le point d'ajouter une nouvelle aire de jeux à cet endroit. Elle sera visible par tout le monde.
            </div>
            <v-btn color="primary" dark flat @click.stop="authenticateAndCallback(pushArea)">Oui, je le veux</v-btn>
            <v-btn color="secondary" dark flat @click.stop="deleteArea">Non ! La supprimer</v-btn>
            <v-btn color="secondary" dark flat @click.stop="dialogConfirmArea = false">Revenir à la carte</v-btn>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditArea" transition="scale-transition" :overlay="false" scrollable>
      <v-card>
        <v-toolbar style="flex: 0 0 auto;" dark class="primary">
          <v-btn icon @click.native="dialogEditArea = false" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Ajouter des détails à l'aire</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <EditArea @editSuccess="editSuccessActions" @askForSignInMsg="askForSignIn=true" :dialogEditArea="dialogEditArea" :equipmentsList="equipmentsList" :uid="uid" :connected="connected" :areaId="areaId" :openAtNightP="openAtNight" :freeAreaP="freeArea">
            </EditArea>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogAddComment" transition="scale-transition" :overlay="false" scrollable>
      <v-card>
        <v-toolbar style="flex: 0 0 auto;" dark class="primary">
          <v-btn icon @click.native="dialogAddComment = false" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Ajouter un avis</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
              <v-flex md6>
                <h2>
                  Cadre
                </h2>
                <star-rating v-model="ratingSurroundings" inline :star-size="40" :increment="0.5" :show-rating="false" :active-color="tertiary"></star-rating>
              </v-flex>
              <v-flex md6>
                <h2>
                  Équipement
                </h2>
                <star-rating v-model="ratingEquipment" inline :star-size="40" :increment="0.5" :show-rating="false" :active-color="tertiary"></star-rating>
              </v-flex>
            </v-layout>
            <div class="pt-5"></div>
            <v-textarea v-model="comment" box label="Commentaire" hint="Dites ici ce que vous avez pensé de l'aire, donnez éventuellement des infos pratiques..."></v-textarea>
            <div>
              <v-btn flat color="primary" :loading="sendingRating" @click.native="authenticateAndCallback(sendRating)" :disabled="sendingRating" dark>Publier</v-btn>
            </div>

          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-bottom-sheet v-model="sheet" id="bottomSheet" inset hide-overlay persistent>
      <v-card style="height: 100%; overflow: scroll;">
        <v-card-text>
          <template>
            <v-btn fab flat @click.native="sheet = false" color="primary">
              <v-icon>close</v-icon>
            </v-btn>

            <v-container grid-list-md text-xs-center>
              <div v-if="dist" class="pb-3">
                <h3>Aire de jeux à {{ dist }} <v-icon>directions_walk</v-icon>
                  <a :href="googleMapDirections" target="_blank">Itinéraire</a></h3>
              </div>
              <hr>
              <div class="pt-3"></div>
              <v-layout row wrap v-if="averageRatingSurroundings || averageRatingEquipment">
                <v-flex md6>
                  <h3>
                    Cadre
                  </h3>
                  <star-rating v-model="averageRatingSurroundings" inline read-only :star-size="30" :increment="0.1" :show-rating="false" :active-color="tertiary"></star-rating>
                </v-flex>
                <v-flex md6>
                  <h3>
                    Équipement
                  </h3>
                  <star-rating v-model="averageRatingEquipment" inline read-only :star-size="30" :increment="0.1" :show-rating="false" :active-color="tertiary"></star-rating>
                </v-flex>
              </v-layout>
              <div v-else>
                <span class="font-italic">Pas encore de note, soyez le premier à rédiger un avis !</span>
                <!-- <v-icon>arrow_downward</v-icon> -->
              </div>
            </v-container>

            <v-container>
              <div v-for="(c,i) in comments" :key="i">
                <div class="pt-3">
                  <p>
                    {{ c.displayName }}, le {{ getDateFromTimestamp(c.timestamp) }}<br> Cadre
                    <star-rating v-model="c.ratingSurroundings" inline read-only :star-size="15" :increment="0.5" :show-rating="false" :active-color="tertiary"></star-rating>
                    Équipement
                    <star-rating v-model="c.ratingEquipment" inline read-only :star-size="15" :increment="0.5" :show-rating="false" :active-color="tertiary "></star-rating>
                    <br>
                    <span v-if="c.comment">"{{ c.comment }}"</span>
                  </p>
                </div>
              </div>
            </v-container>

            <v-container>
              <div class="text-xs-center">
                <v-btn color="primary" flat @click.stop="dialogAddComment=true">Rédiger un avis</v-btn>
                <hr>
              </div>
            </v-container>

            <v-container grid-list-md text-xs-center>
              <div class="pt-3"></div>
              <div v-if="freeArea === undefined && openAtNight === undefined && equipmentsList.length === 0" class="font-italic">
                La description de cette aire est inconnue pour le moment. A vous de jouer !<br>
              </div>
                <div v-else>
                  <div class="pb-1" v-if="freeArea != undefined">
                    {{ freeArea ? 'Gratuite' : 'Payante' }}
                  </div>
                  <div class="pb-1" v-if="openAtNight != undefined">
                    {{ openAtNight ? 'Ouverte la nuit' : 'Fermée la nuit' }}
                  </div>
                  <div>
                    <v-chip v-for='equipment in equipmentsList ' color="primary" text-color="black">{{ equipment }}</v-chip>
                    <v-spacer></v-spacer>
                  </div>
                </div>
                <v-btn color="primary" flat @click.stop="dialogEditArea=true">Suggérer une modification</v-btn>
                <hr>
            </v-container>

                <v-container :grid-list-md="true">
                  <v-layout row wrap>
                    <v-flex xs12 md4 v-for="(pic,i) in pictures" :key="i">
                      <v-card flat tile>
                        <v-img>
                          <a :href="pic.src" target="_blank"><img :src="pic.thumb" style="width: 100%"></a>
                        </v-img>
                      </v-card>
                    </v-flex>
                  </v-layout>
                  <div class="text-xs-center">
                    <input type="file" accept="image/*" id="cameraInput">
                    <v-btn flat color="primary" @click="authenticateAndCallback(takeAPhoto)">
                      Ajouter une photo
                      <v-icon>add_a_photo</v-icon>
                    </v-btn>
                    <div v-for="(ts,progress) in Object.keys(uploadProgress)">
                      <v-progress-linear color="primary" v-if="uploadProgress[ts]" v-bind:value="uploadProgress[ts]"></v-progress-linear>
                    </div>
                  </div>
                </v-container>

          </template>
        </v-card-text>
      </v-card>

    </v-bottom-sheet>
  </div>
</template>

<script>
import L from 'leaflet'
import * as firebase from 'firebase'
import StarRating from 'vue-star-rating'
import GeoFire from 'geofire'
import EditArea from '@/components/EditArea'
import circle from '@turf/circle'
import mask from '@turf/mask'

function markerStyle(borderColor, fillColor) {
  return `background-color: ${fillColor};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  border: 3px solid ${borderColor}`
}

function getIcon(borderColor, fillColor) {
  return L.divIcon({
    className: 'my-custom-pin',
    iconAnchor: [0, 16],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `<span style="${markerStyle(borderColor, fillColor)}" />`
  })
}

let iconSelected = getIcon('white', 'orange')

export default {
  data() {
    return {
      map: {},
      tertiary: '',
      sheet: false,
      connected: false,
      averageRatingSurroundings: 0,
      averageRatingEquipment: 0,
      seeMore: false,
      pictures: [],
      areaId: '',
      // showLightBox: false,
      tabs: ['Aire', 'Mon avis'],
      tabActive: null,
      ratingSurroundings: 0,
      ratingEquipment: 0,
      comment: '',
      comments: [],
      equipmentsList: [],
      openAtNight: undefined,
      freeArea: undefined,
      sendingRating: false,
      uid: '',
      displayName: '',
      snackbar: false,
      snackbarMsg: '',
      uploadProgress: {},
      loadingData: false,
      askForSignIn: false,
      dialogEditArea: false,
      dialogAddArea: false,
      dialogAddComment: false,
      dialogConfirmArea: false,
      newAreaLatLng: [],
      marker: {},
      markersRef: {},
      geofire: {},
      position: [],
      areaPosition: [],
      deviceDirection: 0,
      googleMapDirections: ''
    }
  },
  components: {
    StarRating,
    EditArea
  },
  computed: {
    dist() {
      if (this.sheet) {
        try {
          let distanceMeters = Math.round(this.map.distance(this.position, this.areaPosition))
          if (distanceMeters < 1000) {
            return `${distanceMeters} mètres`
          } else {
            let distanceKm = Math.round(distanceMeters / 10) / 100
            return `${distanceKm} km`
          }
        } catch (error) {
          return 0
        }
      } else {
        return 0
      }
    }
  },
  methods: {
    editSuccessActions() {
      this.dialogEditArea = false
      this.snackbarMsg = "Merci, c'est noté !"
      this.snackbar = true
    },
    takeAPhoto() {
      document.getElementById('cameraInput').click()
    },
    checkConnection() {
      let vm = this
      firebase.auth().onAuthStateChanged(
        function(user) {
          if (user) {
            vm.connected = true
            if (user.isAnonymous) {
              vm.displayName = 'utilisateur mystère'
            } else {
              vm.displayName = user.displayName
            }
            vm.uid = user.uid
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
    average(obj, key) {
      let avg = 0
      if (obj) {
        let n = 0
        for (let k in obj) {
          if (obj[k][key]) {
            avg += obj[k][key]
            n++
          }
        }
        if (n) {
          avg /= n
        }
      }
      return avg
    },
    fetchArea() {
      let vm = this
      vm.comments = []
      vm.averageRatingSurroundings = 0
      vm.averageRatingEquipment = 0
      vm.equipmentsList = []
      vm.openAtNight = undefined
      vm.freeArea = undefined
      vm.pictures = []

      // average rating
      let comments = firebase.database().ref('/comments/' + vm.areaId)
      comments.on('value', function(snapshot) {
        vm.comments = snapshot.val()
        vm.averageRatingSurroundings = vm.average(vm.comments, 'ratingSurroundings')
        vm.averageRatingEquipment = vm.average(vm.comments, 'ratingEquipment')
        vm.tabActive = vm.comments ? vm.tabs[0] : vm.tabs[1]
      })

      vm.googleMapDirections = `https://www.google.com/maps/dir/?api=1&origin=${
        vm.position
      }&destination=${vm.areaPosition}&travelmode=walking`

      // equipment
      let equipments = firebase
        .database()
        .ref('/aires_infos/' + vm.areaId)
        .orderByKey()
        .limitToLast(1)
      equipments.on('value', function(snapshot) {
        let infos = snapshot.val()
        if (infos) {
          for (let i of Object.keys(infos)) {
            vm.equipmentsList = 'equipements' in infos[i] ? infos[i].equipements.slice() : []
            vm.openAtNight = infos[i].ouvertNuit
            vm.freeArea = infos[i].gratuit
          }
        } else {
          vm.equipmentsList = []
          vm.openAtNight = undefined
          vm.freeArea = undefined
        }
      })

      // carousel
      let pictures = firebase.database().ref('/images/' + vm.areaId)
      pictures.on('value', function(snapshot) {
        vm.pictures = []
        let picturesList = snapshot.val()
        if (picturesList) {
          for (let pic in picturesList) {
            vm.pictures.push({
              src: picturesList[pic].path,
              thumb: picturesList[pic].thumbnail
            })
          }
        }
      })

      // user rating & comment
      let note = firebase.database().ref('/comments/' + vm.areaId + '/' + vm.uid)
      note.on('value', function(snapshot) {
        if (snapshot.val()) {
          vm.ratingSurroundings = snapshot.val().ratingSurroundings
          vm.ratingEquipment = snapshot.val().ratingEquipment
          vm.comment = snapshot.val().comment
        } else {
          vm.ratingSurroundings = 0
          vm.ratingEquipment = 0
          vm.comment = ''
        }
      })

      // upload pictures
      if (this.connected) {
        let fileUpload = document.getElementById('cameraInput')
        fileUpload.onchange = function(evt) {
          if (vm.uid) {
            let firstFile = evt.target.files[0] // get the first file uploaded
            let ts = Date.now()
            let storageRef = firebase
              .storage()
              .ref('photos/' + vm.areaId + '/' + vm.areaId + '_' + vm.uid + '_' + ts)
            let uploadTask = storageRef.put(firstFile)

            uploadTask.on(
              'state_changed',
              function(snapshot) {
                vm.$set(
                  vm.uploadProgress,
                  ts,
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                )
                // console.log(vm.uploadProgress)
              },
              function() {
                vm.snackbarMsg = "Aie ! La photo n'est pas partie :("
                vm.snackbar = true
                vm.$set(vm.uploadProgress, ts, 0)
              },
              function() {
                vm.snackbarMsg = 'Et une photo de plus !'
                vm.snackbar = true
                vm.$set(vm.uploadProgress, ts, 0)
              }
            )
          }
        }
      }
    },
    authenticateAndCallback(callback) {
      let vm = this
      let currentUser = firebase.auth().currentUser

      let callCB = function() {
        let cb = callback()
        if (cb) {
          cb.then(() => {
            if (currentUser.isAnonymous) {
              vm.askForSignIn = true
            }
          })
        }
      }

      if (currentUser) {
        callCB()
      } else {
        firebase
          .auth()
          .signInAnonymously()
          .catch(function(error) {
            console.log(error.code)
            console.log(error.message)
          })
          .then(userInfo => {
            vm.uid = userInfo.uid
            vm.displayName = 'utilisateur mystère'
            callCB()
          })
      }
    },
    sendRating() {
      let vm = this
      this.sendingRating = true
      vm.dialogAddComment = false

      return firebase
        .database()
        .ref('/comments/' + vm.areaId + '/' + vm.uid)
        .update({
          ratingEquipment: vm.ratingEquipment,
          ratingSurroundings: vm.ratingSurroundings,
          comment: vm.comment,
          displayName: vm.displayName,
          timestamp: Date.now()
        })
        .then(
          function(value) {
            let newuid = firebase
              .database()
              .ref('/aires_enrichies/' + vm.areaId + '/uid_comments')
              .push()
            newuid.set(vm.uid)

            vm.sendingRating = false
            vm.snackbarMsg = "C'est dans la boite !"
            vm.snackbar = true
          },
          function(reason) {
            console.log('echec!')
            vm.sendingRating = false
          }
        )
    },
    getDateFromTimestamp(ts) {
      let date = new Date(ts)
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    },
    addArea() {
      this.dialogAddArea = false
      this.marker = L.marker(this.newAreaLatLng, { draggable: true })
        .on('click', () => {
          this.marker.bindPopup('').openPopup()
          this.dialogConfirmArea = true
        })
        .addTo(this.map)

      this.marker.bindPopup('Ajustez ma position. Puis cliquez moi dessus.').openPopup()
    },
    deleteArea() {
      this.dialogConfirmArea = false
      this.map.removeLayer(this.marker)
      this.snackbarMsg = 'La prochaine fois sera la bonne :)'
      this.snackbar = true
    },
    pushArea() {
      let vm = this
      let timestamp = Date.now()
      let name = 'aire-' + timestamp
      let lat = vm.marker.getLatLng().lat
      let lng = vm.marker.getLatLng().lng
      let error = false

      firebase
        .database()
        .ref('/nouvelle_aire/' + name)
        .set({
          lat: lat,
          lon: lng,
          timestamp: timestamp,
          uid: vm.uid
        })
        .then(
          function(value) {
            vm.geofire.set(name, [vm.newAreaLatLng.lat, vm.newAreaLatLng.lng]).then(
              () => {},
              () => {
                error = true
              }
            )
            firebase
              .database()
              .ref('/aires_enrichies/' + name)
              .set({
                lat: lat,
                lon: lng
              })
              .then(
                () => {},
                () => {
                  error = true
                }
              )
          },
          () => {
            error = true
          }
        )

      vm.dialogConfirmArea = false
      if (!error) {
        vm.marker.removeFrom(vm.map)
        vm.snackbarMsg = 'Houra, une aire de plus !'
      } else {
        vm.snackbarMsg = "Quelque chose n'a pas marché :("
      }
      vm.snackbar = true
    }
  },
  watch: {
    areaId(newId, oldId) {
      if (oldId) {
        let oldMarker = this.markersRef[oldId].marker
        let oldIcon = this.markersRef[oldId].icon
        oldMarker.setIcon(oldIcon)
      }
      this.markersRef[newId].marker.setIcon(iconSelected)
    }
  },
  mounted() {
    let vm = this
    let map = L.map('map', {
      // renderer: L.canvas()
    })
    let flyToMyPosition = true

    if (
      localStorage.getItem('zoom') &&
      localStorage.getItem('lat') &&
      localStorage.getItem('lng')
    ) {
      flyToMyPosition = false
      map.setView([localStorage.lat, localStorage.lng], localStorage.zoom)
    } else {
      let lat = 48.85
      let lng = 2.34
      let zoom = 13
      map.setView([lat, lng], zoom)
      localStorage.zoom = zoom
      localStorage.lat = lat
      localStorage.lng = lng
    }

    vm.map = map
    vm.tertiary = this.$vuetify.theme.tertiary

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/istopopoki/cj9ydd0jg7it52sp7pubunya6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXN0b3BvcG9raSIsImEiOiJjaW12eWw2ZHMwMGFxdzVtMWZ5NHcwOHJ4In0.VvZvyvK0UaxbFiAtak7aVw',
      {
        attribution:
          'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
      }
    ).addTo(map)

    let accuracy = 0
    let cst = 40075016.686 * Math.abs(Math.cos((map.getCenter().lat * 180) / Math.PI))
    let metresPerPixel = cst / Math.pow(2, map.getZoom() + 8)
    let markerPosition = L.circleMarker([], {
      stroke: false,
      color: '#0000ff',
      fillOpacity: 0.5,
      radius: 5
    })
    let markerAccuracy = L.circleMarker([], {
      stroke: false,
      color: '#0000ff',
      fillOpacity: 0.03,
      radius: 0
    })

    let LocationControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function(map) {
        let container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control leaflet-control-custom'
        )
        container.style.backgroundColor = 'white'
        container.innerHTML =
          '<a style="text-align:center;"><i style="vertical-align:middle;" class="material-icons">my_location</i></a>'
        container.style.cursor = 'pointer'
        container.onclick = function() {
          if (vm.position.length) {
            map.flyTo(vm.position, 15)
          } else {
            flyToMyPosition = true
            map.locate({ watch: true })
          }
        }
        return container
      }
    })
    map.addControl(new LocationControl())
    map.locate({ watch: true })

    map
      .on('zoomend', function() {
        metresPerPixel = cst / Math.pow(2, map.getZoom() + 8)
        if (accuracy < 1000) {
          markerAccuracy.setRadius(accuracy / metresPerPixel).bringToBack()
        }
        localStorage.setItem('zoom', map.getZoom())
      })
      .on('locationfound', function(evt) {
        vm.position = [evt.latitude, evt.longitude]
        accuracy = evt.accuracy
        if (accuracy < 1000) {
          markerAccuracy.setRadius(accuracy / metresPerPixel).bringToBack()
        }
        markerAccuracy.setLatLng(vm.position).addTo(map)
        markerPosition.setLatLng(vm.position).addTo(map)
        if (flyToMyPosition) {
          map.flyTo(vm.position, 15)
          flyToMyPosition = false
        }
      })
      .on('moveend', function(evt) {
        localStorage.setItem('lat', map.getCenter().lat)
        localStorage.setItem('lng', map.getCenter().lng)
      })

    // if ('ondeviceorientationabsolute' in window) {
    //   window.addEventListener('deviceorientationabsolute', function(eventData) {
    //     if (vm.sheet) {
    //       vm.deviceDirection = eventData.alpha
    //     }
    //   })
    // }

    // Initialize Firebase
    // let config = {
    //   apiKey: 'AIzaSyCQex4JKbyUpZHggelHR9INIIAiMetm6DQ',
    //   authDomain: 'aires-de-jeux-e8525.firebaseapp.com',
    //   databaseURL: 'https://aires-de-jeux-e8525.firebaseio.com',
    //   projectId: 'aires-de-jeux-e8525',
    //   storageBucket: 'aires-de-jeux-e8525.appspot.com',
    //   messagingSenderId: '105193380802'
    // }
    // if (!firebase.apps.length) {
    //   firebase.initializeApp(config)
    // }

    let markers = L.layerGroup().addTo(map)

    let database = firebase.database()
    let aires = database.ref('aires_enrichies')

    // geofire
    let firebaseRef = firebase.database().ref('geofire')
    let geofire = new GeoFire(firebaseRef)
    vm.geofire = geofire
    let center = map.getCenter()

    // radius for the geoquery, in meters

    let radius = L.Browser.mobile ? 3000 : 5000

    let geoQuery = geofire.query({
      center: [center.lat, center.lng],
      radius: radius / 1000
    })

    function getCircle(center, radius) {
      let c = [center.lng, center.lat]
      var options = { units: 'meters' }
      return circle(c, radius, options)
    }
    function getCircleLayer() {
      let options = {
        fillColor: 'black',
        fillOpacity: 0.1,
        stroke: false
      }
      return L.geoJSON(mask(getCircle(center, radius), getCircle(center, 1000000)), options)
    }
    let areaCircle = getCircleLayer().addTo(map)

    map.on('moveend', function() {
      if (map.distance(map.getCenter(), center) > radius * 0.66) {
        center = map.getCenter()
        geoQuery.updateCriteria({
          center: [center.lat, center.lng],
          radius: radius / 1000
        })
        areaCircle.clearLayers()
        areaCircle = getCircleLayer().addTo(map)
      }
    })

    map.on('contextmenu', function(e) {
      if (!map.hasLayer(vm.marker)) {
        vm.dialogAddArea = true
        vm.newAreaLatLng = e.latlng
      }
    })
    .on('click', () => {
      vm.areaId = ''
      vm.sheet = false
    })

    let icon1 = getIcon('white', this.$vuetify.theme.primary)
    let icon2 = getIcon('#b6c4bd', 'white')

    geoQuery.on('key_entered', function(key, location, distance) {
      // vm.loadingData = true
      aires.child(key).once('value', function(snapshot) {
        let area = snapshot.val()
        if (area) {
          let uidComments = area.uid_comments
          let icon = uidComments ? icon1 : icon2
          let marker = L.marker([area.lat, area.lon], {
            icon: icon,
            zIndexOffset: uidComments ? 100 : 0
          }).on('click', function(ev) {
            stop(ev)
            // console.log(key)
            vm.areaId = key
            vm.sheet = true
            vm.areaPosition = [area.lat, area.lon]
            vm.fetchArea()
            let areaPoint = map.latLngToLayerPoint(vm.areaPosition, map.getZoom())
            setTimeout(function() {
              let bh = document.getElementsByClassName('v-bottom-sheet v-dialog')[0].clientHeight
              areaPoint = areaPoint.add([0, bh / 2])
              let newCenter = map.layerPointToLatLng(areaPoint, map.getZoom())
              map.panTo(newCenter)
            }, 500)
          })
          vm.markersRef[key] = { marker: marker, icon: icon }
          markers.addLayer(marker)
        }
      })
    })

    geoQuery.on('key_exited', function(key, location, distance) {
      if (key in vm.markersRef) {
        markers.removeLayer(vm.markersRef[key].marker)
      }
    })

    vm.checkConnection()
  }
}
</script>

<style>
#map {
  height: 100%;
  width: 100%;
  z-index: 0;
}

.v-bottom-sheet.v-dialog {
  /* overflow: auto; */
  position: fixed;
  height: 50%;
}

@media screen and (max-width: 700px) {
  .bottom-sheet.dialog {
    height: 70%;
  }
}

.overlay {
  display: none;
}

#cameraInput {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

hr {
  border: 0;
  height: 2px;
  background-image: -webkit-linear-gradient(left, #ffffff, #3d996e57, #ffffff);
  background-image: -moz-linear-gradient(left, #ffffff, #3d996e57, #ffffff);
}
</style>