import React, {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useContext,
} from "react"
import firebaseNs, { FirebaseError } from "firebase/app"

interface FirebaseContext {
  user: firebaseNs.User | null
  setUser: Dispatch<SetStateAction<firebaseNs.User | null>>
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  error?: FirebaseError | null
  setError: Dispatch<SetStateAction<FirebaseError | null>>
  firebase: firebaseNs.app.App
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

export function FirebaseAuthProvider({
  firebase,
  children,
}: {
  firebase: firebaseNs.app.App
  children: ReactNode
}) {
  const [user, setUser] = useState<firebaseNs.User | null>(
    firebase.auth().currentUser,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<FirebaseError | null>(null)

  useEffect(() => {
    !user && setLoading(true)
    return firebase
      .auth()
      .onAuthStateChanged(function(user: firebaseNs.User | null) {
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

  async function signInWithProvider(providerType: string) {
    setLoading(true)
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
      setError(e)
      setLoading(false)
      return null
    }
  }

  async function signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<void | firebaseNs.auth.UserCredential> {
    setLoading(true)

    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((e: FirebaseError) => {
        setError(e)
        setLoading(false)
      })
  }

  async function signOut(): Promise<void> {
    setLoading(true)
    return firebase.auth().signOut()
  }

  async function createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<void | firebaseNs.auth.UserCredential> {
    setLoading(true)
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch((e: FirebaseError) => {
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
