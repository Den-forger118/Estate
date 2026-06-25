"use client"

import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await fetch("/api/v1/auth/logout", { method: "POST" })
    router.replace("/")
  }

  return (
    <button className="btn btn-secondary" type="button" onClick={handleSignOut}>
      Sign out
    </button>
  )
}
