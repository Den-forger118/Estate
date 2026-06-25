# Resident Utility Platform — Development Navigation Logic

See **`user-roles-navigation.md`** for the full role hierarchy, landlord approval flow, and access matrix.

This document covers pillar 3: resident services (`/community/*`).

## Platform context

| Pillar | Purpose | Base path |
|--------|---------|-----------|
| Public website | Marketing, listings, SEO, enquiries | `/`, `/about`, … |
| REMS dashboard | Operations, owner → landlord flow, leasing | `/dashboard/*` |
| Resident utility platform | Events, directory, marketplace, security, bookings | `/community/*` |

## Stitch design mapping

| Stitch folder | App route | Sidebar label |
|---------------|-----------|---------------|
| `resident_dashboard` | `/community` | Dashboard |
| `estate_events` | `/community/events` | Events |
| `resident_directory` | `/community/directory` | Directory |
| `services_marketplace` | `/community/marketplace` | Marketplace |
| `security_dashboard` | `/community/security` | Security |
| `report_incident` | `/community/report` | Report |
| `amenity_bookings` | `/community/bookings` | Bookings |

## Community access (updated)

| Role | `/community/*` |
|------|----------------|
| Administrator | Full |
| Property Manager | Full |
| Property Owner | Full |
| Landlord | Full |
| Tenant | Full |
| Maintenance Staff | **Redirect to `/dashboard`** |

Only maintenance staff are excluded from resident services.

## Access flow

```txt
Public site → Login → (optional REMS) → /community hub → Module sidebar
```

1. User signs in at `/login` with an allowed role.
2. `mock_auth` cookie is set.
3. User opens `/community` or any `/community/*` route.
4. `CommunityShell` runs `syncRoleAfterLandlordApproval()` then `canAccessCommunity(role)`.

Unauthenticated users → `/login?next=…`

## Route structure

```txt
/community
/community/events
/community/directory
/community/marketplace
/community/security
/community/report
/community/bookings
```

## Sidebar navigation rules

1. One active item; hub active only on exact `/community`.
2. Fixed order: Dashboard → Events → Directory → Marketplace → Security → Report → Bookings.
3. Hub quick actions deep-link to modules.
4. No social feed, forum, or poll routes.

## REMS cross-links

- Dashboard sidebar footer: **Resident Services** (hidden for maintenance).
- Community sidebar footer: **REMS dashboard**.

## File map

```txt
app/data/roles.ts              — hierarchy, community access, landlord applications
app/data/community.ts          — module meta, mock resident content
app/community/                 — shell + views
user-roles-navigation.md       — master role & navigation spec
```
