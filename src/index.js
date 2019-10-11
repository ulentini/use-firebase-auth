import React, { useState, useEffect, createContext, useContext } from "react"
import PropTypes from "prop-types"

const FirebaseContext = createContext(null)

export function useFirebaseAuth() {
  const firebaseContext = useContext(FirebaseContext)

  if (firebaseContext === null) {
    throw new Error("No FirebaseAuthProvider found.")
  }

  const {
    user,
    loading,
    error,
    setError,
    setLoading,
    firebase,
  } = firebaseContext

  async function signInWithProvider(providerType) {
    setLoading(true)
    firebase.auth().useDeviceLanguage()

    let provider
    switch (providerType) {
      case SIGNIN_PROVIDERS.GOOGLE:
        provider = new firebase.auth.GoogleAuthProvider()
        break

      case SIGNIN_PROVIDERS.FACEBOOK:
        provider = new firebase.auth.FacebookAuthProvider()
        break

      case SIGNIN_PROVIDERS.TWITTER:
        provider = new firebase.auth.TwitterAuthProvider()
        break

      case SIGNIN_PROVIDERS.GITHUB:
        provider = new firebase.auth.GithubAuthProvider()
        break

      case SIGNIN_PROVIDERS.MICROSOFT:
        provider = new firebase.auth.OAuthProvider("microsoft.com")
        break

      case SIGNIN_PROVIDERS.YAHOO:
        provider = new firebase.auth.OAuthProvider("yahoo.com")
        break

      default:
        break
    }

    try {
      const { user } = await firebase.auth().signInWithPopup(provider)
      return user
    } catch (e) {
      setError(e)
      setLoading(false)
    }
  }

  async function signInWithEmailAndPassword(email, password) {
    setLoading(true)

    return await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(e => {
        setError(e)
        setLoading(false)
      })
  }

  async function signOut() {
    setLoading(true)
    return firebase.auth().signOut()
  }

  async function createUserWithEmailAndPassword(email, password) {
    setLoading(true)
    return await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(e => {
        setError(e)
        setLoading(false)
      })
  }

  return {
    user,
    loading,
    error,
    signInWithEmailAndPassword,
    signInWithProvider,
    signOut,
    createUserWithEmailAndPassword,
  }
}

export const SIGNIN_PROVIDERS = {
  PASSWORD: "password",
  GOOGLE: "google",
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  GITHUB: "github",
  MICROSOFT: "microsoft",
  YAHOO: "yahoo",
}

export function FirebaseAuthProvider({ firebase, children }) {
  const [user, setUser] = useState(firebase.auth().currentUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    !user && setLoading(true)
    return firebase.auth().onAuthStateChanged(function(user) {
      setLoading(false)
      setError(null)
      setUser(user)
    })
  }, [])

  return (
    <FirebaseContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        error,
        setError,
        firebase,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

FirebaseAuthProvider.propTypes = {
  firebase: PropTypes.object,
  children: PropTypes.element,
}
