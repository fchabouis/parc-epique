<template>
  <v-container>
    <div class="text-xs-center">
      <v-chip close color="orange darken-3" text-color="white" v-for="(e, i) in equipments" v-model="e.value"> {{ e.name }} </v-chip>
          <v-select
        v-bind:items="equipmentsDict"
        v-model="newEquipment"
        label="Ajouter un équipement"
        autocomplete
        clearable
    ></v-select>
    </div>
    <v-layout row wrap>
    <v-flex xs12 sm6>

    </v-flex>
</v-layout>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        equipments: [],
        equipmentsDict: [
          'bac à sable',
          'toboggan',
          'circuit de voitures',
          'escalade',
          'pont de singe',
          'cabane',
          'table de ping-pong'
        ],
        newEquipment: ''
      }
    },
    watch: {
      newEquipment () {
        if (this.newEquipment) {
          this.equipments.push({ name: this.newEquipment, value: true })
          this.newEquipment = ''
        }
      }
    },
    props: ['equipmentsList'],
    methods: {
    },
    mounted () {
      for (let e of this.equipmentsList) {
        this.equipments.push({ name: e, value: true })
      }
    }
  }
</script>

<style>
</style>