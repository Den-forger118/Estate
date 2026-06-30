import { redirect } from "next/navigation"

// This route is an unused stub — the real password-reset flow goes through
// /set-password?token=... (emailed link). Redirect anyone who lands here.
export default function ResetPasswordPage() {
  redirect("/forgot-password")
}
