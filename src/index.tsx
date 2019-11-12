import React, {
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useContext,
} from "react"
import firebaseNs, { FirebaseError } from "firebase/app"
import { useReducedState } from "./use-reduced-state"

interface FirebaseContext {
  user: firebaseNs.User | null
  loading: boolean
  error?: FirebaseError | null
  firebase: typeof firebaseNs
  setState: Dispatch<SetStateAction<FirebaseAuthState>>
}
const FirebaseContext = createContext<FirebaseContext | null>(null)

export enum SIGNIN_PROVIDERS {
  PASSWORD = "password",
  GOOGLE = "google",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  GITHUB = "github",
  MICROSOFT = "microsoft",
  YAHOO = "yahoo",
}

interface FirebaseAuthState {
  user?: firebaseNs.User | null
  loading?: boolean
  error?: FirebaseError | null
}

export function FirebaseAuthProvider({
  firebase,
  children,
}: {
  firebase: typeof firebaseNs
  children: ReactNode
}) {
  const [{ user, loading, error }, setState] = useReducedState({
    user: firebase.auth().currentUser,
    loading: false,
    error: null,
  } as FirebaseAuthState)

  useEffect(() => {
    !user && setState({ loading: true })
    return firebase
      .auth()
      .onAuthStateChanged(function(user: firebaseNs.User | null) {
        setState({
          loading: false,
          error: null,
          user,
        })
      })
  }, [])

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        error,
        firebase,
        setState,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebaseAuth() {
  const firebaseContext = useContext(FirebaseContext)

  if (firebaseContext === null) {
    throw new Error("No FirebaseAuthProvider found.")
  }

  const { user, loading, error, setState, firebase } = firebaseContext

  async function signInWithProvider(providerType: string) {
    setState({ loading: true })
    firebase.auth().useDeviceLanguage()

    // const auth: firebaseNs.auth.Auth = (firebase.auth as unknown) as firebaseNs.auth.Auth
    const auth: typeof firebaseNs.auth = (firebase.auth as unknown) as typeof firebaseNs.auth

    let provider
    switch (providerType) {
      case SIGNIN_PROVIDERS.GOOGLE:
        provider = new auth.GoogleAuthProvider()
        break

      case SIGNIN_PROVIDERS.FACEBOOK:
        provider = new auth.FacebookAuthProvider()
        break

      case SIGNIN_PROVIDERS.TWITTER:
        provider = new auth.TwitterAuthProvider()
        break

      case SIGNIN_PROVIDERS.GITHUB:
        provider = new auth.GithubAuthProvider()
        break

      case SIGNIN_PROVIDERS.MICROSOFT:
        provider = new auth.OAuthProvider("microsoft.com")
        break

      case SIGNIN_PROVIDERS.YAHOO:
        provider = new auth.OAuthProvider("yahoo.com")
        break

      default:
        break
    }

    try {
      const { user } = await firebase
        .auth()
        .signInWithPopup(provider as firebaseNs.auth.AuthProvider)
      return user
    } catch (e) {
      setState({
        error: e,
        loading: false,
      })
      return null
    }
  }

  async function signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<void | firebaseNs.auth.UserCredential> {
    setState({ loading: true })

    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((e: FirebaseError) => {
        setState({
          error: e,
          loading: false,
        })
      })
  }

  async function signOut(): Promise<void> {
    setState({ loading: true })
    return firebase.auth().signOut()
  }

  async function createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<void | firebaseNs.auth.UserCredential> {
    setState({ loading: true })
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch((e: FirebaseError) => {
        setState({
          error: e,
          loading: false,
        })
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
