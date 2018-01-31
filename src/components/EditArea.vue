<template>
  <div class="">
    <div v-if="connected">
      <div v-if="!deleteArea">
        <div class="pt-3 pb-5 text-xs-center">
          On dirait que vous souhaitez aider la communauté à en savoir plus sur cette aire ? Vous êtes au bon endroit.
        </div>

        <div class="pb-3">
          L'aire est-elle :
        </div>
        <v-checkbox color="orange darken-3" label="Ouverte la nuit ?" v-model="openAtNight"></v-checkbox>
        <v-checkbox color="orange darken-3" label="Gratuite ?" v-model="freeArea"></v-checkbox>

        <v-select label="Équipement" v-bind:items="equipmentsDict" v-model="equipments" multiple chips color="orange darken-3" hint="Quels sont les équipements présents ?" persistent-hint></v-select>
      </div>
      <v-checkbox class="pt-5" color="error" label="Cette aire devrait être supprimée de la carte" v-model="deleteArea"></v-checkbox>
      <v-text-field v-if="deleteArea" color="error" textarea label="Dire en quelques mots pourquoi..." v-model="deleteReason"></v-text-field>
      <div class="pt-3 text-xs-center">
        <v-btn color="orange darken-2" dark flat @click.stop="saveAreaInfos">Enregistrer</v-btn>
      </div>
    </div>
    <div v-else>
      <router-link to="/login" :key="$route.fullPath">Connectez-vous</router-link> pour contribuer.
    </div>
  </div>
</template>

<script>
import * as firebase from 'firebase'

export default {
  data() {
    return {
      equipments: [],
      openAtNight: this.openAtNightP || false,
      freeArea: this.freeAreaP || false,
      deleteArea: false,
      deleteReason: '',
      equipmentsDict: [
        'bac à sable',
        'cheval à bascule',
        'toboggan',
        'circuit de voitures',
        'escalade',
        'pont de singe',
        'cabane',
        'table de ping-pong',
        'fontaine',
        'toilettes'
      ]
    }
  },
  watch: {
    openAtNightP() {
      this.openAtNight = this.openAtNightP || false
    },
    freeAreaP() {
      this.freeArea = this.freeAreaP || false
    },
    equipmentsList() {
      this.equipments = this.equipmentsList.slice()
    },
    dialogEditArea() {
      if (!this.dialogEditArea) {
        this.deleteArea = false
        this.deleteReason = ''
      }
    }
  },
  props: [
    'dialogEditArea',
    'equipmentsList',
    'uid',
    'areaId',
    'openAtNightP',
    'freeAreaP',
    'connected'
  ],
  methods: {
    saveAreaInfos() {
      let vm = this
      if (this.deleteArea) {
        firebase
          .database()
          .ref('/aires_suppression/' + vm.areaId)
          .set({
            raison: this.deleteReason,
            uid: this.uid,
            timestamp: Date.now()
          })
          .then(function() {
            vm.$emit('editSuccess')
          })
      } else {
        let infos = {
          equipements: this.equipments,
          ouvertNuit: this.openAtNight,
          gratuit: this.freeArea,
          prive: this.privateAccess
        }
        let areaInfos = firebase
          .database()
          .ref('/aires_infos/' + vm.areaId)
          .push()
        areaInfos.set(infos).then(function() {
          vm.$emit('editSuccess')
        })
      }
    }
  }
}
</script>

<style>

</style>