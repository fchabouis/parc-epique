<template>
  <div style="height:100%; width: 100%;">
    <div id="map"></div>

    <v-snackbar v-model="snackbar">
      {{ snackbarMsg }}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  
  
    <v-bottom-sheet v-model="sheet" class="dialog--fullscreen" id="bottomSheet">
      <v-card style="height: 100%">
        <v-tabs v-model="tabActive" grow style="height:100%;">
  
          <v-tabs-bar class="orange darken-2" dark>
            <v-btn icon @click.native="sheet = false" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-tabs-item v-for="tab in tabs" :key="tab" :href="'#' + tab" ripple>
              {{ tab }}
            </v-tabs-item>
            <v-btn dark flat @click.native="seeMore = true">
              <v-icon>keyboard_arrow_up</v-icon>
            </v-btn>
            <v-tabs-slider color="black"></v-tabs-slider>
          </v-tabs-bar>
          <v-tabs-items style="height:100%; overflow: auto;">

            <v-tabs-content :key="tabs[0]" :id="tabs[0]" style="height:100%;">
              <v-card flat style="height:100%;">
                <v-card-text>
  
                  <v-container grid-list-md text-xs-center>
                    <v-layout row wrap>
                      <v-flex md6>
                        <h2>
                          Cadre
                        </h2>
                        <star-rating v-model="averageRatingSurroundings" inline read-only :star-size="30" :increment="0.1" :show-rating="false" :active-color="'rgb(245, 124, 0)'"></star-rating>
                      </v-flex>
                      <v-flex md6>
                        <h2>
                          Équipement
                        </h2>
                        <star-rating v-model="averageRatingEquipment" inline read-only :star-size="30" :increment="0.1" :show-rating="false" :active-color="'rgb(245, 124, 0)'"></star-rating>
                      </v-flex>
                    </v-layout>
                  </v-container>
  
                  <!-- <v-container>
                    <v-divider></v-divider>
                    <div>
                      <h2>
                        Aire gratuite
                      </h2>
                    </div>
                    <div>
                      <h2>
                        Ferme la nuit: oui
                      </h2>
                    </div>
                    <div>
                      <h2>
                        Âges:
                        <v-chip color="primary" text-color="white">0-3 ans</v-chip>
                      </h2>
                    </div>
                    <div>
                      <h2>
                        Équipements:
                        <v-chip color="primary" text-color="white">toboggan</v-chip>
                      </h2>
                    </div>
                    </v-container> -->

                    <v-container :grid-list-md="true">
                      <v-layout row wrap>
                        <v-flex
                          xs6
                          md4
                          v-for="(pic,i) in pictures"
                          :key="i"
                        >
                          <v-card flat tile>
                            <v-card-media
                              :src="pic.thumb"
                              height="200px"
                            >
                            </v-card-media>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>

                  <v-container>
                    <h2> Avis des utilisateurs</h2>
                    <div v-for="(c,i) in comments" :key="i">
                      <div v-if="c.comment" class="pt-3">
                        
                        <h4>
                          {{ c.displayName }}, le {{ getDateFromTimestamp(c.timestamp) }}<br>
                          Cadre <star-rating v-model="c.ratingSurroundings" inline read-only :star-size="15" :increment="0.5" :show-rating="false" :active-color="'rgb(245, 124, 0)'"></star-rating>
                            Équipement <star-rating v-model="c.ratingEquipment" inline read-only :star-size="15" :increment="0.5" :show-rating="false" :active-color="'rgb(245, 124, 0)'"></star-rating>
                        </h4>
                        <p>
                          {{ c.comment }}
                        </p>
                        <v-divider></v-divider>
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
                    <v-layout row wrap>
                      <v-flex md6>
                        <h2>
                          Cadre
                        </h2>
                        <star-rating v-model="ratingSurroundings" inline :star-size="40" :increment="0.5" :show-rating="false" :active-color="'rgb(245, 124, 0)'"></star-rating>
                      </v-flex>
                      <v-flex md6>
                        <h2>
                          Équipement
                        </h2>
                        <star-rating v-model="ratingEquipment" inline :star-size="40" :increment="0.5" :show-rating="false" :active-color="'rgb(245, 124, 0)'"></star-rating>
                      </v-flex>
                    </v-layout>

                    <v-text-field
                      textarea
                      label="Commentaire"
                      v-model="comment"
                    ></v-text-field>

                    <input type="file" accept="image/*" id="cameraInput">
                    <v-btn @click="takeAPhoto" :value="uploadProgress" :loading="sendingPhoto" :disabled="sendingPhoto" >photo<v-icon>add_a_photo</v-icon></v-btn>
                    <v-progress-linear v-if="uploadProgress" v-bind:value="uploadProgress"></v-progress-linear>

                    <div>
                      <v-btn color="orange darken-2" :loading="sendingRating" @click.native="sendRating()" :disabled="sendingRating" dark>Envoyer</v-btn>
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
  
  export default {
    data () {
      return {
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
        sendingRating: false,
        uid: '',
        displayName: '',
        snackbar: false,
        snackbarMsg: '',
        uploadProgress: 0,
        sendingPhoto: false
      }
    },
    components: {
      StarRating
    },
    computed: {

    },
    methods: {
      takeAPhoto () {
        document.getElementById('cameraInput').click()
      },
      checkConnection () {
        let vm = this
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            vm.connected = true
            vm.displayName = user.displayName
            vm.uid = user.uid
          } else {
            vm.connected = false
            vm.displayName = ''
            vm.uid = ''
          }
        }, function (error) {
          console.log(error)
        })
      },
      average (obj, key) {
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
      fetchArea () {
        let vm = this

        // average rating
        let comments = firebase.database().ref('/comments/' + vm.areaId)
        comments.on('value', function (snapshot) {
          vm.comments = snapshot.val()
          vm.averageRatingSurroundings = vm.average(vm.comments, 'ratingSurroundings')
          vm.averageRatingEquipment = vm.average(vm.comments, 'ratingEquipment')
        })
  
        // carousel
        let pictures = firebase.database().ref('/images/' + vm.areaId)
        pictures.on('value', function (snapshot) {
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
        note.on('value', function (snapshot) {
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
        let fileUpload = document.getElementById('cameraInput')
        fileUpload.onchange = function (evt) {
          if (vm.uid) {
            let firstFile = evt.target.files[0] // get the first file uploaded
            let storageRef = firebase.storage().ref('photos/' + vm.areaId + '/' + vm.areaId + '_' + vm.uid + '_' + Date.now())
            let uploadTask = storageRef.put(firstFile)
            vm.sendingPhoto = true

            uploadTask.on('state_changed', function (snapshot) {
              vm.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              console.log(vm.uploadProgress)
            }, function () {
              vm.sendingPhoto = false
              vm.snackbarMsg = 'Aie ! La photo n\'est pas partie :('
              vm.snackbar = true
              vm.uploadProgress = 0
            }, function () {
              vm.sendingPhoto = false
              vm.snackbarMsg = 'Et une photo de plus !'
              vm.snackbar = true
              vm.uploadProgress = 0
            })
          }
        }
      },
      sendRating () {
        let vm = this
        this.sendingRating = true
        firebase.database().ref('/comments/' + vm.areaId + '/' + vm.uid).update({
          ratingEquipment: vm.ratingEquipment,
          ratingSurroundings: vm.ratingSurroundings,
          comment: vm.comment,
          displayName: vm.displayName,
          timestamp: Date.now()
        }).then(function (value) {
          console.log('succes!')
          vm.sendingRating = false
          vm.snackbarMsg = 'C\'est dans la boite !'
          vm.snackbar = true
        }, function (reason) {
          console.log('echec!')
          vm.sendingRating = false
        })
      },
      getDateFromTimestamp (ts) {
        let date = new Date(ts)
        return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
      }
    },
    mounted () {
      let vm = this
      let map = L.map('map', {
        renderer: L.canvas()
      }).setView([48.85, 2.34], 13)
  
      L.tileLayer('https://api.mapbox.com/styles/v1/istopopoki/cj9ydd0jg7it52sp7pubunya6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXN0b3BvcG9raSIsImEiOiJjaW12eWw2ZHMwMGFxdzVtMWZ5NHcwOHJ4In0.VvZvyvK0UaxbFiAtak7aVw', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
      }).addTo(map)
  
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
        fillOpacity: 0.05,
        radius: 0
      })
      let firstLoc = true
  
      if (L.Browser.mobile) {
        map.locate()
        map.on('zoomend', function () {
          metresPerPixel = cst / Math.pow(2, map.getZoom() + 8)
          markerAccuracy.setRadius(accuracy / metresPerPixel)
        })
          .on('locationfound', function (evt) {
            metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * 180 / Math.PI)) / Math.pow(2, map.getZoom() + 8)
            accuracy = evt.accuracy
            markerAccuracy.setRadius(accuracy / metresPerPixel)
            markerAccuracy.setLatLng([evt.latitude, evt.longitude]).addTo(map)
            markerPosition.setLatLng([evt.latitude, evt.longitude]).addTo(map)
            if (firstLoc) {
              map.flyTo([evt.latitude, evt.longitude], 15)
              firstLoc = false
            }
          })
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
  
      let database = firebase.database()

      let aires = database.ref('aires')
  
      aires.once('value', function (snapshot) {
        let val = snapshot.val()
        for (let a in val) {
          let aire = val[a]
          L.circleMarker([aire.lat, aire.lon], {
            stroke: false,
            color: '#f9af02',
            fillcolor: '#f9af02',
            fillOpacity: 0.6,
            radius: 10,
            title: a
          })
            .on('click', function (ev) {
              stop(ev)
              vm.areaId = a
              vm.sheet = true
              vm.fetchArea()
              let areaPoint = map.latLngToLayerPoint([aire.lat, aire.lon], map.getZoom())
              setTimeout(function () {
                let bh = document.getElementsByClassName('bottom-sheet dialog')[0].clientHeight
                areaPoint = areaPoint.add([0, bh / 2])
                let newCenter = map.layerPointToLatLng(areaPoint, map.getZoom())
                map.panTo(newCenter)
              }, 500)
            }).addTo(map)
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

.bottom-sheet.dialog {
  /* overflow: auto; */
  position: fixed;
  bottom: 0;
  height: 50%;
}

@media screen and (max-width: 700px) {
.bottom-sheet.dialog {
    height: 70%;
  }
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