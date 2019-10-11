import React from "react"
import "../css/tailwind.css"
import { useFirebaseAuth } from "use-firebase-auth"
import { Login } from "./login"

let i = 0

function App() {
  const { user, loading, error, signOut } = useFirebaseAuth()

  return (
    <div className="h-screen flex flex-col items-center justify-center font-sans">
      {user ? (
        <div>
          <span>Logged in as {user.email}</span>
          <div className="mt-3 text-center">
            <button
              onClick={() => signOut()}
              className="bg-blue-100 border border-gray-300 rounded py-2 px-4 text-lg font-semibold text-blue-500 hover:bg-gray-100 border-gray-400"
            >
              Logout
            </button>
          </div>
        </div>
      ) : loading ? (
        `Loading...`
      ) : (
        <>
          {error && (
            <div className="mb-4 text-red-600 text-base text-center">
              {error.message}
            </div>
          )}
          <Login />
        </>
      )}
    </div>
  )
}

export default App
