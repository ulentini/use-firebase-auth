import React from "react"
import ReactDOM from "react-dom"
import App from "./components/app"
import { FirebaseAuthProvider } from "use-firebase-auth"
import firebase from "firebase/app"
import "firebase/auth"

//TODO: move init somewhere else?
const firebaseConfig = {
  apiKey: "AIzaSyDXzLcNE98vk-2SG-EnZATSz2yHMtDg86c",
  authDomain: "ulentini-dev-project.firebaseapp.com",
  databaseURL: "https://ulentini-dev-project.firebaseio.com",
  projectId: "ulentini-dev-project",
  storageBucket: "ulentini-dev-project.appspot.com",
  messagingSenderId: "143062933574",
  appId: "1:143062933574:web:ab7f86f53a36b513a96a47",
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

ReactDOM.render(
  <FirebaseAuthProvider firebase={firebase}>
    <App />
  </FirebaseAuthProvider>,
  document.getElementById("root"),
)
