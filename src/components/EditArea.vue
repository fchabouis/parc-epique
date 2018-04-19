<template>
  <div class="">
    <div v-if="connected">
      <div v-if="!deleteArea">
        <div class="pt-3 pb-5 text-xs-center">
          On dirait que vous souhaitez aider la communauté à en savoir plus sur cette aire ? Vous êtes au bon endroit.
        </div>

        <div class="pb-3">
          La nuit l'aire est :
        </div>
        <v-radio-group v-model="openAtNight" column>
          <v-radio color="primary" label="ouverte" value="true"></v-radio>
          <v-radio color="primary" label="fermée" value="false"></v-radio>
          <v-radio color="secondary" label="on ne sait pas" value="undefined"></v-radio>
        </v-radio-group>
        L'aire est :
        <v-radio-group v-model="freeArea" column>
          <v-radio color="primary" label="gratuite" value="true"></v-radio>
          <v-radio color="primary" label="payante" value="false"></v-radio>
          <v-radio color="secondary" label="on ne sait pas" value="undefined"></v-radio>        
        </v-radio-group>

        <v-select label="Équipement" v-bind:items="equipmentsDict" v-model="equipments" multiple chips color="primary" hint="Quels sont les équipements présents ?" persistent-hint></v-select>
      </div>
      <v-checkbox class="pt-5" color="error" label="Cette aire devrait être supprimée de la carte" v-model="deleteArea"></v-checkbox>
      <v-text-field v-if="deleteArea" color="error" textarea label="Dire en quelques mots pourquoi..." v-model="deleteReason"></v-text-field>
      <div class="pt-3 text-xs-center">
        <v-btn color="primary" dark flat @click.stop="saveAreaInfos">Enregistrer</v-btn>
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
      openAtNight: 'undefined',
      freeArea: 'undefined',
      deleteArea: false,
      deleteReason: '',
      equipmentsDict: [
        'bac à sable',
        'circuit de voitures',
        'cheval à bascule',
        'escalade',
        'fontaine',
        'pont de singe',
        'table de ping-pong',
        'terrain de foot',
        'terrain de basket',
        'terrain de pétanque',
        'toboggan',
        'toilettes'
      ]
    }
  },
  watch: {
    openAtNightP() {
      this.openAtNight = this.openAtNightP === undefined ? 'undefined' : this.openAtNightP.toString()
    },
    freeAreaP() {
      this.freeArea = this.freeAreaP === undefined ? 'undefined' : this.freeAreaP.toString()
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
          uid: this.uid,
          timestamp: Date.now()
        }
        if (this.openAtNight !== 'undefined') {
          infos.ouvertNuit = this.openAtNight === 'true'
        }
        if (this.freeArea !== 'undefined') {
          infos.gratuit = this.freeArea === 'true'
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