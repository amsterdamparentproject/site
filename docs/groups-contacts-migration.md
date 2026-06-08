# groups_contacts Migration Plan

## Background

Group "admins" are being broadened to "contacts" — anyone who adds or updates a group becomes a contact for that group. The concept of a single `admin_name`/`admin_email` stored directly on the group row is replaced by a separate `groups_contacts` table supporting multiple contacts per group.

---

## Database

### 1. Create `directory.groups_contacts`

```sql
CREATE TABLE directory.groups_contacts (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_id   uuid NOT NULL REFERENCES directory.groups(id) ON DELETE CASCADE,
  user_id    text REFERENCES directory.users(public_id),
  user_email text NOT NULL,
  name       text,
  is_admin   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE directory.groups_contacts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON directory.groups_contacts TO service_role;
```

### 2. Backfill existing admin data into `groups_contacts`

Run this **before** dropping the columns. Seeds one contact row per group that has an `admin_email`, marking them as `is_admin = true` since they were explicitly recorded as admins. Groups with no `admin_email` are skipped.

```sql
INSERT INTO directory.groups_contacts (group_id, user_email, name, is_admin)
SELECT
  id,
  admin_email,
  admin_name,
  true
FROM directory.groups
WHERE admin_email IS NOT NULL AND admin_email <> '';
```

Optionally link to an existing `users` row if the email matches:

```sql
UPDATE directory.groups_contacts gc
SET user_id = u.public_id
FROM directory.users u
WHERE u.email = gc.user_email
  AND gc.user_id IS NULL;
```

### 3. Drop old columns from `directory.groups`

Only run after the backfill above has been verified.

```sql
ALTER TABLE directory.groups
  DROP COLUMN IF EXISTS admin_email,
  DROP COLUMN IF EXISTS admin_name;
```

---

## n8n Changes (Groups Directory Hub workflow)

### Remove `agreedToTerms` gates
- **"Agreed to admin terms"** IF node: replace `agreedToTerms === "Yes"` condition with `email !== ""` OR `user_id !== ""`
- **"Agreed to new group terms"** IF node: same change

### Remove `admin_name`/`admin_email` from group writes
- **"Sanitize data"** Code node: remove `admin_name` and `admin_email` from the sanitized output object
- **"Sanitize new group"** Code node: same

### Insert into `groups_contacts` after approval
Add a new Supabase node after both **"Update a row"** and **"Create group"**:

```
Table: groups_contacts
Operation: insert
Fields:
  group_id   → id of the created/updated group
  user_id    → body.user_id (may be empty)
  user_email → body.email
  name       → body.adminName (or body.name)
  is_admin   → body.isAdmin === "Yes"
```

### Email templates
`"Hi {{ $json.admin_name }}"` and `sendTo: {{ $json.admin_email }}` — pass `name` and `email` through the sanitized data object so existing email nodes still work, without writing them to the `groups` table.

---

## Front-end Changes

### All forms: agreement checkbox → passive copy
- **Remove**: `agreedToTerms` checkbox ("I confirm I am the owner/admin of this group")
- **Add**: `isAdmin` checkbox: "I am the admin of this group" (sets `is_admin`)
- **Add**: passive copy under submit button: *"By submitting, you agree to be listed as a group contact for any questions."*

### No-auth routes (`/add`, `/update`): check for stored `app_uid`
On mount, check `localStorage` for `app_uid`:
- **Found**: hide email + name fields, use stored UID as `user_id` in payload
- **Not found**: show email field (name optional)

### Authenticated routes (`AddGroupForm`, `ChangeGroupForm` in directory)
- Already hides name/email when `hasAdminInfo` is true — no change needed
- Pass `uid` as `user_id` in FormData

### Types (`app/types/groups-directory.ts`)
- Remove `agreedToTerms` from form types
- Add `isAdmin: boolean`

### FormData payload (all forms)
New fields to send:
```
user_id    → app_uid from localStorage/session (empty string if not available)
isAdmin    → "Yes" | "No"
```
Fields being removed:
```
agreedToTerms
```

---

## Test updates

After implementation, update e2e tests:
- Replace `agreedToTerms` checkbox interactions with `isAdmin` checkbox
- Remove `agreedToTerms` assertions
- Add `isAdmin` field assertions where relevant
