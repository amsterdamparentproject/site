#!/bin/bash
# Starts the dev server and forwards Stripe webhooks to it, together.
# Ctrl-C stops both.
#
# Usage: yarn start-site            # .env.local + your CLI's default Stripe profile
#        yarn start-site --test     # .env.test + the sandbox Stripe profile
# Override the port with PORT=3005 yarn start-site (defaults to 3100, the
# e2e port — see playwright.config.ts).
#
# Assumes the Stripe CLI is installed and logged in (`stripe login`).
# Update STRIPE_WEBHOOK_SECRET_FYP in .env.local/.env.test with the
# whsec_... this prints if it differs from what's there now.
#
# --test sets NODE_ENV=test, which makes Next.js load .env.test instead of
# .env.local, and pins `stripe listen` to the CLI's "amsterdam parent
# project sandbox" profile (account acct_1SPjEFQa5oNdvF7x) — the account
# .env.test's STRIPE_SECRET_KEY actually belongs to. Without --test,
# NODE_ENV is left alone so .env.local loads normally, and `stripe listen`
# uses the CLI's own `default` profile instead, which is what .env.local's
# key should belong to.
#
# Keeping the env file and the Stripe profile matched matters: checkout
# sessions get created fine against whichever account the active key
# belongs to, but no webhook ever arrives if `stripe listen` is watching a
# different account's event stream. Run `stripe config --list` to see the
# profiles configured on this machine, or set STRIPE_PROJECT=... to
# override either mode's profile.
#
# Written against plain /bin/bash (macOS ships 3.2, no `wait -n`) — polls
# instead of using bash 4.3+'s wait -n, so it stops cleanly either way.

PORT="${PORT:-3100}"

TEST_MODE=false
for arg in "$@"; do
  [ "$arg" = "--test" ] && TEST_MODE=true
done

if [ "$TEST_MODE" = true ]; then
  STRIPE_PROJECT="${STRIPE_PROJECT:-amsterdam parent project sandbox}"
else
  STRIPE_PROJECT="${STRIPE_PROJECT:-}"
fi

cleanup() {
  echo ""
  echo "Stopping dev server and stripe listen..."
  [ -n "$DEV_PID" ] && kill "$DEV_PID" 2>/dev/null
  [ -n "$STRIPE_PID" ] && kill "$STRIPE_PID" 2>/dev/null
  wait "$DEV_PID" "$STRIPE_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

if [ "$TEST_MODE" = true ]; then
  NODE_ENV=test next dev -p "$PORT" &
else
  next dev -p "$PORT" &
fi
DEV_PID=$!

if [ -n "$STRIPE_PROJECT" ]; then
  stripe listen --project-name "$STRIPE_PROJECT" --forward-to "localhost:$PORT/api/webhooks/stripe/fyp" &
else
  stripe listen --forward-to "localhost:$PORT/api/webhooks/stripe/fyp" &
fi
STRIPE_PID=$!

# Poll rather than `wait -n` (bash 4.3+ only) so either process exiting on
# its own — not just Ctrl-C — brings down the other and returns control.
while kill -0 "$DEV_PID" 2>/dev/null && kill -0 "$STRIPE_PID" 2>/dev/null; do
  sleep 1
done
cleanup
