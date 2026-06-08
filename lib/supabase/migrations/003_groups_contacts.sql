-- Step 1: Create groups_contacts table
CREATE TABLE directory.groups_contacts (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_id   uuid NOT NULL REFERENCES directory.groups(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES directory.users(id),
  email      text NOT NULL,
  name       text,
  is_admin   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE directory.groups_contacts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON directory.groups_contacts TO service_role;

-- Step 2: Backfill existing admin data from groups table
INSERT INTO directory.groups_contacts (group_id, email, name, is_admin)
SELECT
  id,
  admin_email,
  admin_name,
  true
FROM directory.groups
WHERE admin_email IS NOT NULL AND admin_email <> '';

-- Step 3: Link to existing users where email matches
UPDATE directory.groups_contacts gc
SET user_id = u.id
FROM directory.users u
WHERE u.email = gc.email
  AND gc.user_id IS NULL;

-- Step 4: Drop old columns (run after verifying backfill above)
ALTER TABLE directory.groups
  DROP COLUMN IF EXISTS admin_email,
  DROP COLUMN IF EXISTS admin_name;
