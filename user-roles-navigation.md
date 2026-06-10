# User Roles & Navigation Logic (Development)

This document is the source of truth for **who users are**, **how they progress between roles**, and **what each area of the site they can reach**.

## Role hierarchy

Listed from highest platform authority to most scoped access:

| Order | Role | Slug | Who they are |
|------:|------|------|----------------|
| 1 | Administrator | `admin` | Estate platform operator |
| 2 | Property Manager | `manager` | Estate management staff |
| 3 | Property Owner | `owner` | Purchased a home/unit in the estate |
| 4 | Landlord | `landlord` | **Approved** owner who may lease their unit |
| 5 | Tenant | `tenant` | Resident renting from a landlord |
| 6 | Maintenance Staff | `maintenance` | Field / facilities staff |

## Lifecycle flows

### Property owner → landlord

```txt
Buy property in estate
    → Account created as Property Owner (owner)
    → Submit "Apply to become landlord" (REMS)
    → Status: pending
    → Administrator OR Property Manager reviews
    → Approved → role becomes Landlord
    → Rejected → remains Property Owner (can re-apply later)
```

Only **admin** and **manager** may approve or reject landlord applications (`/dashboard/landlord-applications`).

After approval, the owner gains landlord REMS modules (tenants, leases, rent collection for their units).

### Landlord → tenant

```txt
Landlord (approved)
    → Creates lease / invites tenant in REMS
    → Tenant account provisioned (admin/manager or landlord-initiated — future API)
    → Tenant signs in with tenant role
    → Tenant uses REMS (lease, payments, maintenance) + Resident Services (/community)
```

Tenant onboarding is mocked today; production would tie tenant users to a signed lease record.

### Public website

Unauthenticated visitors use marketing routes only. No role until `/login`.

## Access matrix

### REMS dashboard (`/dashboard/*`)

| Module | admin | manager | owner | landlord | tenant | maintenance |
|--------|:-----:|:-------:|:-----:|:--------:|:------:|:-----------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Properties | ✓ | ✓ | ✓ | ✓ | — | — |
| Units | ✓ | ✓ | — | ✓ | — | — |
| Tenants | ✓ | ✓ | — | ✓ | — | — |
| Leases | ✓ | ✓ | — | ✓ | ✓ | — |
| Payments | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Maintenance | ✓ | ✓ | — | — | ✓ | ✓ |
| Invoices | ✓ | — | — | — | — | — |
| Reports | ✓ | ✓ | — | ✓ | — | — |
| Messages | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Landlord applications (review) | ✓ | ✓ | — | — | — | — |
| Landlord application (submit) | — | — | ✓ | — | — | — |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Resident services (`/community/*`)

| Role | Access |
|------|--------|
| Administrator | Full |
| Property Manager | Full |
| Property Owner | Full |
| Landlord | Full |
| Tenant | Full |
| Maintenance Staff | **No** — redirected to `/dashboard` |

Maintenance staff are operations-only: they do not use the resident utility platform.

## Navigation entry points

| Audience | Primary nav |
|----------|-------------|
| Public | Header: Home, About, Services, Properties, Blog, Contact, Resident Services*, Dashboard |
| Signed-in (non-maintenance) | REMS sidebar + link to Resident Services; community sidebar on `/community` |
| Maintenance | REMS sidebar only; `/community` redirects to dashboard |

\*Resident Services requires sign-in; unauthenticated users go to `/login?next=/community`.

## Mock implementation (current)

| Storage key | Purpose |
|-------------|---------|
| `ernest_mock_auth` | Session flag |
| `mock_auth` cookie | Server proxy gate |
| `ernest_dashboard_role` | Active role slug |
| `ernest_user_email` | Ties owner to landlord application |
| `ernest_user_name` | Applicant display name |
| `ernest_landlord_applications` | JSON queue for pending/approved/rejected |

On load, **property owners** with an **approved** application for their email are auto-promoted to `landlord` in localStorage.

Login role dropdown follows hierarchy order for demos; production login would assign role from the database, not a free select.

## Related docs

- `community-navigation.md` — resident module routes and Stitch mapping
- `design_consistency.md` — UI tokens and layout rules

## QA checklist

- [ ] Owner can submit landlord application
- [ ] Admin/manager see pending applications
- [ ] Approve promotes owner to landlord (same email)
- [ ] Reject keeps owner role
- [ ] Landlord sees tenants + leases modules
- [ ] Owner without approval cannot access landlord-only modules
- [ ] All roles except maintenance reach `/community`
- [ ] Maintenance `/community` → `/dashboard`
