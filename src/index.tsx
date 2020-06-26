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
  firstCheck: boolean
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
  firstCheck?: boolean
}

export function FirebaseAuthProvider({
  firebase,
  children,
}: {
  firebase: typeof firebaseNs
  children: ReactNode
}) {
  const [{ user, loading, error, firstCheck }, setState] = useReducedState({
    user: firebase.auth().currentUser,
    loading: false,
    error: null,
    firstCheck: false,
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
          firstCheck: true,
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
        firstCheck,
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
    setState,
    firebase,
    firstCheck,
  } = firebaseContext

  async function signInWithProvider(
    provider: string | firebaseNs.auth.AuthProvider,
    options?: { scopes?: string[] },
  ) {
    setState({ loading: true })
    firebase.auth().useDeviceLanguage()

    const auth: typeof firebaseNs.auth = (firebase.auth as unknown) as typeof firebaseNs.auth

    let providerObj: firebaseNs.auth.AuthProvider
    if (typeof provider === "string") {
      switch (provider) {
        case SIGNIN_PROVIDERS.GOOGLE:
          providerObj = new auth.GoogleAuthProvider()
          break

        case SIGNIN_PROVIDERS.FACEBOOK:
          providerObj = new auth.FacebookAuthProvider()
          break

        case SIGNIN_PROVIDERS.TWITTER:
          providerObj = new auth.TwitterAuthProvider()
          break

        case SIGNIN_PROVIDERS.GITHUB:
          providerObj = new auth.GithubAuthProvider()
          break

        case SIGNIN_PROVIDERS.MICROSOFT:
          providerObj = new auth.OAuthProvider("microsoft.com")
          break

        case SIGNIN_PROVIDERS.YAHOO:
          providerObj = new auth.OAuthProvider("yahoo.com")
          break

        default:
          throw new Error(`Unrecognized provider: ${provider}`)
      }
    } else {
      providerObj = provider
    }

    const scopes: string[] = (options && Array.isArray(options.scopes)) ? options.scopes : [];

    if (provider instanceof firebase.auth.OAuthProvider) {
      scopes.forEach(scope => (providerObj as firebaseNs.auth.OAuthProvider).addScope(scope));
    }

    try {
      const userCredential = await firebase.auth().signInWithPopup(providerObj)
      return userCredential
    } catch (e) {
      if (
        e.email &&
        e.credential &&
        e.code === "auth/account-exists-with-different-credential"
      ) {
        const supportedPopupSignInMethods = [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
        ]

        const getProvider = (providerId: string) => {
          switch (providerId) {
            case firebase.auth.GoogleAuthProvider.PROVIDER_ID:
              return new firebase.auth.GoogleAuthProvider()
            case firebase.auth.FacebookAuthProvider.PROVIDER_ID:
              return new firebase.auth.FacebookAuthProvider()
            case firebase.auth.GithubAuthProvider.PROVIDER_ID:
              return new firebase.auth.GithubAuthProvider()
            default:
              throw new Error(`No provider implemented for ${providerId}`)
          }
        }

        const providers = await firebase
          .auth()
          .fetchSignInMethodsForEmail(e.email)
        const firstPopupProviderMethod = providers.find(p =>
          supportedPopupSignInMethods.includes(p),
        )

        // Test: Could this happen with email link then trying social provider?
        if (!firstPopupProviderMethod) {
          throw new Error(
            `Your account is linked to a provider that isn't supported.`,
          )
        }

        const linkedProvider = getProvider(firstPopupProviderMethod)
        linkedProvider.setCustomParameters({ login_hint: e.email })

        const result = await firebase.auth().signInWithPopup(linkedProvider)
        result.user && result.user.linkWithCredential(e.credential)
      } else {
        setState({
          error: e,
          loading: false,
        })
      }
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

  async function sendPasswordResetEmail(email: string) {
    return firebase.auth().sendPasswordResetEmail(email)
  }

  async function verifyPasswordResetCode(code: string) {
    return firebase.auth().verifyPasswordResetCode(code)
  }

  async function confirmPasswordReset(code: string, newPassword: string) {
    return firebase.auth().confirmPasswordReset(code, newPassword)
  }

  async function applyActionCode(code: string) {
    return firebase.auth().applyActionCode(code)
  }

  async function updateProfile({
    displayName,
    photoURL,
  }: {
    displayName?: string
    photoURL?: string
  }) {
    if (!user) {
      throw new Error("User is not logged in")
    }
    return user.updateProfile({
      displayName,
      photoURL,
    })
  }

  async function updatePassword(newPassword: string) {
    if (!user) {
      throw new Error("User is not logged in")
    }

    return user.updatePassword(newPassword)
  }

  return {
    user,
    loading,
    error,
    firstCheck,
    signInWithEmailAndPassword,
    signInWithProvider,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
    updateProfile,
    updatePassword,
    applyActionCode,
  }
}
