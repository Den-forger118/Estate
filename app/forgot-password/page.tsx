import Link from "next/link";
import { PageShell } from "../components/SiteChrome";

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <section className="auth-section">
        <form className="form-card auth-card">
          <span className="eyebrow">Account recovery</span>
          <h1>Reset your dashboard password.</h1>
          <p>Enter the email associated with your REMS account and we will send reset instructions.</p>
          <label>
            Email
            <input type="email" placeholder="name@example.com" />
          </label>
          <Link className="btn btn-primary" href="/reset-password">
            Send Reset Link
          </Link>
          <div className="auth-links">
            <Link href="/login">Return to login</Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
