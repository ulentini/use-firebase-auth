import React, { useState } from "react"
import { useFirebaseAuth, SIGNIN_PROVIDERS } from "use-firebase-auth"

export function Login() {
  const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithProvider,
  } = useFirebaseAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  return (
    <div className="w-1/3 bg-white border-gray-300 rounded p-4 flex flex-col justify-center">
      <input
        type="email"
        className="rounded border border-gray-300 bg-gray-100 text-lg px-4 py-2 w-full"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="rounded border border-gray-300 bg-gray-100 text-lg px-4 py-2 w-full mt-2"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        onClick={() => signInWithEmailAndPassword(email, password)}
        className="bg-teal-500 rounded py-2 px-4 text-lg font-semibold text-teal-100 hover:bg-teal-600 mt-2"
      >
        Login
      </button>
      <hr className="border-t border-gray-300 my-4" />

      <input
        type="email"
        className="rounded border border-gray-300 bg-gray-100 text-lg px-4 py-2 w-full"
        placeholder="Email"
        value={registerEmail}
        onChange={e => setRegisterEmail(e.target.value)}
      />
      <input
        type="password"
        className="rounded border border-gray-300 bg-gray-100 text-lg px-4 py-2 w-full mt-2"
        placeholder="Password"
        value={registerPassword}
        onChange={e => setRegisterPassword(e.target.value)}
      />
      <button
        onClick={() =>
          createUserWithEmailAndPassword(registerEmail, registerPassword)
        }
        className="bg-teal-500 rounded py-2 px-4 text-lg font-semibold text-teal-100 hover:bg-teal-600 mt-2"
      >
        Sign Up
      </button>
      <hr className="border-t border-gray-300 my-4" />
      <button
        onClick={() => signInWithProvider(SIGNIN_PROVIDERS.GOOGLE)}
        className="bg-purple-500 rounded py-2 px-4 text-lg font-semibold text-purple-100 hover:bg-purple-600"
      >
        Sign in with Google
      </button>
    </div>
  )
}

Login.propTypes = {}
