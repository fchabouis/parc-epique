<template>
  <div>
    <v-container>
        <h1>Outils d'administration</h1>
        <v-btn @click="DeleteAreasEnriched">Supprimer les aires enrichies</v-btn>
        <v-btn @click="copyAires" :loading="copyingAreas">Copier les aires</v-btn>
        <v-btn @click="copyComments">Copier les commentaires</v-btn>
    </v-container>

  </div>
</template>

<script>
  import * as firebase from 'firebase'
  
  export default {
    data () {
      return {
        copyingAreas: false
      }
    },
    components: {
    },
    computed: {
    },
    methods: {
      copyComments () {
        let comments = firebase.database().ref('/comments/')
        comments.on('value', function (snapshot) {
          let c = snapshot.val()
          for (let area in c) {
            let users = Object.keys(c[area])
            for (let user of users) {
              let newuid = firebase.database().ref('/aires_enrichies/' + area + '/uid_comments').push()
              newuid.set(user)
            }
            console.log('Tous les commentaires ont été copiés dans les aires.')
          }
        })
      },
      copyAires () {
        let vm = this
        let areas = firebase.database().ref('/aires/')
        areas.on('value', function (snapshot) {
          vm.copyingAreas = true
          let areasList = snapshot.val()
          for (let area in areasList) {
            // console.log(areasList[area])
            firebase.database().ref('/aires_enrichies/' + area).set(areasList[area]).then(function (value) {
              // console.log('Nouvelle rentrée avec succès')
            }, function (reason) {
              // console.log('echec!')
            })
          }
          console.log('Toutes les aires sont copiées.')
          vm.copyingAreas = false
        })
      },
      DeleteAreasEnriched () {
        firebase.database().ref('/aires_enrichies/').set({}).then(function (value) {
          console.log('Toutes les aires enrichies sont supprimées')
        }, function (reason) {
          console.log('Echec suppression des aires enrichies')
        })
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
      }
    },
    mounted () {
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