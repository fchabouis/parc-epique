<template>
  <div class="">
  </div>
</template>

<script>
import firebase from 'firebase/compat/app'

export default {
  data() {
    return {
      equipments: [],
      openAtNight: this.openAtNightP || false,
      payingArea: !this.freeAreaP || false,
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
      this.openAtNight = this.openAtNightP || false
    },
    freeAreaP() {
      this.payingArea = !this.freeAreaP || false
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
          gratuit: !this.payingArea,
          uid: this.uid,
          timestamp: Date.now()
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
