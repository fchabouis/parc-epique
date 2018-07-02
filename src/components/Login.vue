<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <v-container style="padding: 10px;">
    <h2>Parc Épique</h2>
    <p>Pour participer, créez un compte. Cela prend environ 30 secondes.</p>
    <div id="firebaseui-auth-container"></div>
  </v-container>
</template>

<script>
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

let uiConfig = {
  signInSuccessUrl: '/',
  signInFlow: 'popup',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>'
}

export default {
  data () {
    return {
      wasMounted: false,
      ui: {}
    }
  },
  // beforeRouteEnter (to, from, next) {
  //   next(vm => {
  //     console.log('j activate!')
  //     vm.$nextTick(function () {
  //       if (!vm.ui) {
  //         console.log('creation ui')
  //         vm.ui = new firebaseui.auth.AuthUI(firebase.auth())
  //         // The start method will wait until the DOM is loaded.
  //         vm.wasMounted = true
  //       }
  //       vm.ui.start('#firebaseui-auth-container', uiConfig)
  //     })
  //   })
  // },
  mounted () {
    // console.log('je mount')
    if (firebaseui.auth.AuthUI.getInstance()) {
      const ui = firebaseui.auth.AuthUI.getInstance()
      ui.start('#firebaseui-auth-container', uiConfig)
    } else {
      const ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start('#firebaseui-auth-container', uiConfig)
    }
  }
}
</script>

<style>

</style>
