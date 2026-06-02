import Link from "next/link";
import { PageShell } from "../components/SiteChrome";

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <section className="auth-section">
        <form className="form-card auth-card">
          <span className="eyebrow">New password</span>
          <h1>Create a new password.</h1>
          <p>This placeholder screen completes the mock authentication route structure.</p>
          <label>
            Password
            <input type="password" />
          </label>
          <label>
            Confirm password
            <input type="password" />
          </label>
          <Link className="btn btn-primary" href="/login">
            Update Password
          </Link>
        </form>
      </section>
    </PageShell>
  );
}
