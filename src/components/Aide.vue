<template>
    <div style="background-color:rgb(250,250,250);">
        <v-container style="padding: 10px;">
            <h1 class="pt-5 pb-3">Les enfants ne sont pas beaucoup dehors</h1>
            <p>
                Avez-vous entendu parler de la campagne "Dirt is good" ?
            </p>
            <p>
                Une enquête menée auprès de 12 000 personnes dans 10 pays nous apprend que le temps passé par les enfants dehors est ridiculement bas. Un tiers des enfants au Royaume-Uni passe moins de 30mn par jour dehors. En moyenne un enfant passerait moins de temps dehors qu'un prisonnier.
            </p>
            <p>
                C'est vrai que l'aire de jeux du coin de la rue, en tant que parent, elle nous gonfle...
            </p>
            <h1>Du coup...</h1>
            <p>
                Ce site a pour but de référencer toutes les aires de jeux de France, de nous pousser nous, les parents à sortir plus souvent. Et pourquoi pas, à changer de parc de temps en temps.
            </p>
            <h1>
                Avec votre aide
            </h1>
            <p>
                Le fonctionnement de parc-epique est collaboratif.
            </p>
            <p>
                La base initiale des aires a été extraite du projet
                <a href="https://www.openstreetmap.org">OpenStreetMap</a>, une initiative open source et collaborative de cartographie. Il vous est possible de compléter ces informations en renseignant la liste des équipements présents, en donnant votre avis sur l'aire et en ajoutant des photos.
            </p>
            <p>
                Le site n'a pas de vocation commerciale. Il est prévu par la suite d'en faire bénéficier les mairies pour leur signaler un équipement défectueux ou leur faire parvenir vos suggestions. En participant vous aidez tout le monde&nbsp;!
            </p>

            <div class="text-xs-center pt-5">
                <img src="static/img/aires_logo_couleur2.png" height="250px">
            </div>

            <h1 class="">FAQ</h1>
            <p class="pt-4 title">
                Comment puis-je participer ?
            </p>
            <p>
                Il vous faut créer un <router-link to="/login">compte</router-link>, ce qui ne prend que quelques secondes. Vous pourrez ensuite noter les aires et compléter les informations.
            </p>
            <p class="pt-4 title">
                Est-il possible d'ajouter une aire ?
            </p>
            <p>
                Si une aire n'existe pas sur la carte et que vous souhaitez l'ajouter, faites un clic droit sur la carte (sur ordinateur) ou un appui long (sur mobile et tablette).
            </p>
            <p class="pt-4 title">
                Qui a fait ça ?
            </p>
            <p>
                Francis Chabouis. Je suis un ingénieur et développeur freelance à Paris avec un petit faible pour les cartes.
            </p>
            <p class="pt-4 title">
                Je peux avoir des détails techniques ? Car j'aimerais fait la même chose avec les boulangeries...
            </p>
            <p>
                Le code du projet est libre et est publié sur
                <a href=https://github.com/fchabouis/parc-epique target="_blank">github</a>. J'ai également écrit un article technique qui décrit la démarche et les technologies utilisées sur
                <a href=https://medium.com/cr%C3%A9ation-dune-app-cartographique-avec-firebase-vue/cr%C3%A9ation-dune-app-cartographique-avec-firebase-vue-js-et-leaflet-868e9ea1b958 target="_blank">Medium</a>.
            </p>
        </v-container>
    </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  components: {},
  computed: {},
  methods: {},
  mounted() {}
}
</script>

<style>

</style>