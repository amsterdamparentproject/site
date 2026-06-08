-- ============================================================
-- Test seed data for directory schema
-- Run in your TEST Supabase project only
-- ============================================================

-- Drop and recreate groups
DROP TABLE IF EXISTS directory.groups CASCADE;

CREATE TABLE directory.groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  categories  text[] NOT NULL DEFAULT '{}',
  link        text,
  description text,
  platform    text,
  reported    boolean NOT NULL DEFAULT false,
  admin_name  text,
  admin_email text
);

-- Seed groups
INSERT INTO directory.groups (name, categories, link, description, platform, admin_name, admin_email) VALUES
  (
    'Amsterdam Parents — Centrum',
    ARRAY['Parenting', 'Neighborhood'],
    'https://chat.whatsapp.com/testlink001',
    'A group for parents in the Centrum area of Amsterdam.',
    'WhatsApp',
    'Test Admin',
    'testadmin@example.com'
  ),
  (
    'Amsterdam Moms Network',
    ARRAY['Mom', 'Parenting'],
    'https://chat.whatsapp.com/testlink002',
    'A supportive network for moms across Amsterdam.',
    'WhatsApp',
    'Test Admin',
    'testadmin@example.com'
  ),
  (
    'Amsterdam Dad Group',
    ARRAY['Dad'],
    'https://chat.whatsapp.com/testlink003',
    'Dads supporting dads in Amsterdam.',
    'WhatsApp',
    null,
    null
  ),
  (
    'Amsterdam Buy & Sell — Kids',
    ARRAY['Buy & sell'],
    'https://www.facebook.com/groups/testgroup001',
    'Buy and sell children''s items across Amsterdam.',
    'Facebook',
    null,
    null
  ),
  (
    'Amsterdam Twin Parents',
    ARRAY['Twin', 'Parenting'],
    'https://chat.whatsapp.com/testlink004',
    'A group for parents of twins in Amsterdam.',
    'WhatsApp',
    null,
    null
  );

-- Drop and recreate users
DROP TABLE IF EXISTS directory.users CASCADE;

CREATE TABLE directory.users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id   text UNIQUE NOT NULL,
  name        text,
  email       text,
  categories  text[] DEFAULT '{}'
);

-- Seed one test user — public_id must match TEST_APP_UID in .env.test.local
-- Replace 'YOUR_TEST_APP_UID' with the actual value
INSERT INTO directory.users (public_id, name, email, categories) VALUES
  (
    'YOUR_TEST_APP_UID',
    'Test User',
    'testuser@example.com',
    ARRAY['Parenting', 'Mom']
  );
