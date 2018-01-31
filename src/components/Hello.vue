<template>
  <div style="height: 100%;">

    <div id="map"></div>

    <v-snackbar v-model="snackbar">
      {{ snackbarMsg }}
      <v-btn flat color="primary" @click.native="snackbar = false">fermer</v-btn>
    </v-snackbar>

    <v-dialog v-model="dialogAddArea" transition="dialog-bottom-transition" :overlay="false" max-width="290">
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

    <v-dialog v-model="dialogConfirmArea" transition="dialog-bottom-transition" :overlay="false" max-width="290">
      <v-card>
        <v-card-title class="headline">Enregister la nouvelle aire ?</v-card-title>
        <v-card-text>
          <v-container>
            <div class="pb-3">
              Vous êtes sur le point d'ajouter une nouvelle aire de jeux à cet endroit. Elle sera visible par tout le monde.
            </div>
            <v-btn color="primary" dark flat @click.stop="pushArea">Oui, je le veux</v-btn>
            <v-btn color="secondary" dark flat @click.stop="deleteArea">Non ! La supprimer</v-btn>
            <v-btn color="secondary" dark flat @click.stop="dialogConfirmArea = false">Revenir à la carte</v-btn>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditArea" transition="dialog-bottom-transition" :overlay="false" scrollable>
      <v-card>
        <v-toolbar style="flex: 0 0 auto;" dark class="primary">
          <v-btn icon @click.native="dialogEditArea = false" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Ajouter des détails à l'aire</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <EditArea @editSuccess="editSuccessActions" :equipmentsList="equipmentsList" :uid="uid" :connected="connected" :areaId="areaId" :openAtNightP="openAtNight" :freeAreaP="freeArea" :privateAccessP="privateAccess">
            </EditArea>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-bottom-sheet v-model="sheet" id="bottomSheet">
      <v-card style="height: 100%">
        <v-tabs v-model="tabActive" grow style="height:100%;">

          <v-tabs-bar class="primary">
            <v-btn icon @click.native="sheet = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-tabs-item v-for="tab in tabs" :key="tab" :id="'tabTitle_' + tab" :href="'#' + tab" ripple>
              {{ tab }}
            </v-tabs-item>
            <!-- <v-btn flat @click.native="seeMore = true">
              <v-icon>keyboard_arrow_up</v-icon>
            </v-btn> -->
            <v-tabs-slider color="black"></v-tabs-slider>
          </v-tabs-bar>
          <v-tabs-items style="height: calc(100% - 48px); overflow: auto;">

            <v-tabs-content :key="tabs[0]" :id="tabs[0]" style="height:100%;">
              <v-card flat style="height:100%;">
                <v-card-text>
                  <v-container grid-list-md text-xs-center>
                    <v-layout row wrap>
                      <v-flex md6>
                        <h2>
                          Cadre
                        </h2>
                        <star-rating v-model="averageRatingSurroundings" inline read-only :star-size="30" :increment="0.1" :show-rating="false" :active-color="tertiary"></star-rating>
                      </v-flex>
                      <v-flex md6>
                        <h2>
                          Équipement
                        </h2>
                        <star-rating v-model="averageRatingEquipment" inline read-only :star-size="30" :increment="0.1" :show-rating="false" :active-color="tertiary"></star-rating>
                      </v-flex>
                    </v-layout>
                    <span v-if="dist">à {{ dist }} mètres</span>
                    <!-- <v-icon v-if="direction" large color="orange darken-2" :style="{transform: 'rotate(' + direction + 'deg)'}">forward</v-icon> -->
                  </v-container>

                  <v-container>
                    <div class="text-xs-center">
                      <div class="pb-1" v-if="freeArea != undefined">
                        {{ freeArea ? 'Gratuite' : 'Payante' }}
                      </div>
                      <div class="pb-1" v-if="openAtNight != undefined">
                        {{ openAtNight ? 'Ouverte la nuit' : 'Fermée la nuit' }}
                      </div>
                      <div class="pb-3" v-if="privateAccess != undefined">
                        {{ privateAccess ? 'Non accessible au public' : 'Accessible au public' }}
                      </div>
                    </div>
                    <div class="text-xs-center">
                      <v-chip v-for='equipment in equipmentsList ' color="primary" text-color="black">{{ equipment }}</v-chip>
                      <v-spacer></v-spacer>
                      <v-btn color="secondary" flat @click.stop="dialogEditArea=true">Ajouter des détails</v-btn>
                    </div>

                  </v-container>

                  <v-container :grid-list-md="true">
                    <v-layout row wrap>
                      <v-flex xs12 md4 v-for="(pic,i) in pictures" :key="i">
                        <v-card flat tile>
                          <v-card-media>
                            <a :href="pic.src" target="_blank"><img :src="pic.thumb" style="width: 100%"></a>
                          </v-card-media>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-container>

                  <v-container>
                    <h2>Avis des utilisateurs</h2>
                    <div v-if="!comments">
                      Pas encore d'avis déposé.
                    </div>
                    <div v-else>
                      <div v-for="(c,i) in comments" :key="i">
                        <div class="pt-3">
                          <h4>
                            {{ c.displayName }}, le {{ getDateFromTimestamp(c.timestamp) }}<br> Cadre
                            <star-rating v-model="c.ratingSurroundings" inline read-only :star-size="15" :increment="0.5" :show-rating="false" :active-color="tertiary"></star-rating>
                            Équipement
                            <star-rating v-model="c.ratingEquipment" inline read-only :star-size="15" :increment="0.5" :show-rating="false" :active-color="tertiary "></star-rating>
                          </h4>
                          <p>
                            {{ c.comment }}
                          </p>
                          <v-divider></v-divider>
                        </div>
                      </div>
                    </div>
                    <div style="margin-bottom: 100px;">
                    </div>
                  </v-container>

                </v-card-text>
              </v-card>
            </v-tabs-content>

            <v-tabs-content :key="tabs[1]" :id="tabs[1]">
              <v-card flat>
                <v-card-text>
                  <div v-if="connected">

                    <v-container grid-list-md text-xs-center>
                      <div v-if="!comments">
                        Pas encore d'avis, soyez le premier à déposer le vôtre.
                      </div>
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

                      <div class="text-xs-center">
                        <input type="file" accept="image/*" id="cameraInput">
                        <v-btn @click="takeAPhoto">photo
                          <v-icon>add_a_photo</v-icon>
                        </v-btn>
                        <div v-for="(ts,progress) in Object.keys(uploadProgress)">
                          <v-progress-linear color="primary" v-if="uploadProgress[ts]" v-bind:value="uploadProgress[ts]"></v-progress-linear>
                        </div>
                      </div>

                      <v-text-field textarea label="Commentaire" v-model="comment"></v-text-field>

                      <div>
                        <v-btn color="primary" :loading="sendingRating" @click.native="sendRating()" :disabled="sendingRating" dark>Envoyer</v-btn>
                      </div>

                    </v-container>
                  </div>
                  <div v-else>
                    <v-container text-xs-center class="pt-5">
                      <div>
                        <router-link to="/login" :key="$route.fullPath">Connectez-vous</router-link> pour contribuer et donner votre avis.
                      </div>
                    </v-container>
                  </div>
                  <div style="margin-bottom: 100px;">
                  </div>
                </v-card-text>
              </v-card>
            </v-tabs-content>

          </v-tabs-items>
        </v-tabs>
        <v-card-text text-center style="overflow-y: scroll;">
        </v-card-text>

        <div style="flex: 1 1 auto;"></div>
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
      privateAccess: undefined,
      sendingRating: false,
      uid: '',
      displayName: '',
      snackbar: false,
      snackbarMsg: '',
      uploadProgress: {},
      loadingData: false,
      dialogEditArea: false,
      dialogAddArea: false,
      dialogConfirmArea: false,
      newAreaLatLng: [],
      marker: {},
      geofire: {},
      position: [],
      areaPosition: [],
      deviceDirection: 0
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
          return Math.round(this.map.distance(this.position, this.areaPosition))
        } catch (error) {
          return 0
        }
      } else {
        return 0
      }
    }
    //   direction() {
    //     if (this.sheet) {
    //       try {
    //         let dy = this.areaPosition[0] - this.position[0]
    //         let dx = this.areaPosition[1] - this.position[1]
    //         let atan = Math.atan(dx / dy)
    //         let a
    //         if (dx >= 0 && dy >= 0) {
    //           a = 2 * Math.PI - atan
    //         } else if (dx <= 0 && dy >= 0) {
    //           a = -atan
    //         } else {
    //           a = Math.PI - atan
    //         }
    //         this.AD = 180 * a / Math.PI
    //         return -180 * a / Math.PI + this.deviceDirection - 90
    //       } catch (error) {
    //         return 0
    //       }
    //     } else {
    //       return 0
    //     }
    //   }
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
            vm.displayName = user.displayName
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
      vm.privateAccess = undefined
      vm.pictures = []

      // work around vuetify bug with tabs slider not showing if initially hidden
      document.getElementById('tabTitle_' + vm.tabs[0]).firstChild.click()

      // average rating
      let comments = firebase.database().ref('/comments/' + vm.areaId)
      comments.on('value', function(snapshot) {
        vm.comments = snapshot.val()
        vm.averageRatingSurroundings = vm.average(vm.comments, 'ratingSurroundings')
        vm.averageRatingEquipment = vm.average(vm.comments, 'ratingEquipment')
        vm.tabActive = vm.comments ? vm.tabs[0] : vm.tabs[1]
      })

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
            vm.equipmentsList = infos[i].equipements.slice()
            vm.openAtNight = infos[i].ouvertNuit
            vm.freeArea = infos[i].gratuit
            vm.privateAccess = infos[i].prive
          }
        } else {
          vm.equipmentsList = []
          vm.openAtNight = undefined
          vm.freeArea = undefined
          vm.privateAccess = undefined
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
                  snapshot.bytesTransferred / snapshot.totalBytes * 100
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
    sendRating() {
      let vm = this
      this.sendingRating = true
      firebase
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
      return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
    },
    addArea() {
      this.dialogAddArea = false
      this.marker = L.marker(this.newAreaLatLng, { draggable: true })
        .on('click', () => {
          this.dialogConfirmArea = true
        })
        .addTo(this.map)
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
  mounted() {
    let vm = this
    let map = L.map('map', {
      // renderer: L.canvas()
    }).setView([48.85, 2.34], 13)

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
    let cst = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * 180 / Math.PI))
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
    let firstLoc = true

    if (L.Browser.mobile) {
      map.locate({ watch: true })
      map
        .on('zoomend', function() {
          metresPerPixel = cst / Math.pow(2, map.getZoom() + 8)
          markerAccuracy.setRadius(accuracy / metresPerPixel).bringToBack()
        })
        .on('locationfound', function(evt) {
          vm.position = [evt.latitude, evt.longitude]
          accuracy = evt.accuracy
          markerAccuracy.setRadius(accuracy / metresPerPixel).bringToBack()
          markerAccuracy.setLatLng(vm.position).addTo(map)
          markerPosition.setLatLng(vm.position).addTo(map)
          if (firstLoc) {
            map.flyTo(vm.position, 15)
            firstLoc = false
          }
        })

      // if ('ondeviceorientationabsolute' in window) {
      //   window.addEventListener('deviceorientationabsolute', function(eventData) {
      //     if (vm.sheet) {
      //       vm.deviceDirection = eventData.alpha
      //     }
      //   })
      // }
    }

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

    let markers = L.layerGroup().addTo(map)
    let markersRef = {}

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

    let areaCircle = L.circle([center.lat, center.lng], {
      radius: radius,
      fillOpacity: 0,
      color: this.$vuetify.theme.tertiary,
      opacity: 0.2,
      weight: 10
    }).addTo(map)

    map.on('moveend', function() {
      if (map.distance(map.getCenter(), center) > radius * 0.66) {
        center = map.getCenter()
        geoQuery.updateCriteria({
          center: [center.lat, center.lng],
          radius: radius / 1000
        })
        areaCircle.setLatLng([center.lat, center.lng]).addTo(map)
      }
    })

    map.on('contextmenu', function(e) {
      if (!map.hasLayer(vm.marker)) {
        vm.dialogAddArea = true
        vm.newAreaLatLng = e.latlng
      }
    })

    const colorStrong = this.$vuetify.theme.primary
    // const colorWeak = '#ffaa54'

    const markerHtmlStylesStrong = `
  background-color: ${colorStrong};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF`

    const markerHtmlStylesWeak = `
  background-color: white;
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  border: 3px solid ${colorStrong}`

    const icon1 = L.divIcon({
      className: 'my-custom-pin',
      iconAnchor: [0, 16],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -36],
      html: `<span style="${markerHtmlStylesStrong}" />`
    })

    const icon2 = L.divIcon({
      className: 'my-custom-pin',
      iconAnchor: [0, 16],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -36],
      html: `<span style="${markerHtmlStylesWeak}" />`
    })

    geoQuery.on('key_entered', function(key, location, distance) {
      // vm.loadingData = true
      aires.child(key).once('value', function(snapshot) {
        let area = snapshot.val()
        let uidComments = area.uid_comments
        // if (uidComments) {
        //   console.log(area)
        // }
        let marker = L.marker([area.lat, area.lon], {
          icon: uidComments ? icon1 : icon2
          // stroke: false,
          // weight: 2,
          // color: 'blue',
          // fillColor: uidComments ? '#f9af02' : '#d8b56c',
          // fillOpacity: uidComments ? 0.9 : 0.4,
          // radius: 10
        }).on('click', function(ev) {
          stop(ev)
          vm.areaId = key
          vm.sheet = true
          vm.areaPosition = [area.lat, area.lon]
          vm.fetchArea()
          let areaPoint = map.latLngToLayerPoint(vm.areaPosition, map.getZoom())
          setTimeout(function() {
            let bh = document.getElementsByClassName('bottom-sheet dialog')[0].clientHeight
            areaPoint = areaPoint.add([0, bh / 2])
            let newCenter = map.layerPointToLatLng(areaPoint, map.getZoom())
            map.panTo(newCenter)
          }, 500)
        })
        markersRef[key] = marker
        markers.addLayer(marker)
      })
    })

    geoQuery.on('key_exited', function(key, location, distance) {
      markers.removeLayer(markersRef[key])
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

.bottom-sheet.dialog {
  /* overflow: auto; */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
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
</style>