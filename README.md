# use-firebase-auth

> Firebase authentication hook

[![NPM](https://img.shields.io/npm/v/use-firebase-auth.svg)](https://www.npmjs.com/package/use-firebase-auth)

## Install

```bash
npm install --save use-firebase-auth
```

```bash
yarn add use-firebase-auth
```

## Usage

Configure firebase application and pass it to the `FirebaseAuthProvider`.
Wrap the parent component (your app component or any other parent component) with the provider, so that all the children component can share the auth information (user info, loading/error status, etc)

```jsx
import React from "react"
import ReactDOM from "react-dom"
import App from "./components/app"
import { FirebaseAuthProvider } from "use-firebase-auth"
import firebase from "firebase/app"
import "firebase/auth"

const firebaseConfig = {
  //Load your Firebase Project configuration here
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

ReactDOM.render(
  <FirebaseAuthProvider firebase={firebase}>
    <App />
  </FirebaseAuthProvider>,
  document.getElementById("root"),
)
```

```jsx
import React, { Component } from "react"

import { useFirebaseAuth } from "use-firebase-auth"

const Example = () => {
  const { user, loading, error, signInWithProvider } = useFirebaseAuth()
  return <div>...</div>
}
```

## Demo

[Live demo](http://use-firebase-auth.netlify.com/)

## License

MIT © [ulentini](https://github.com/ulentini)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
