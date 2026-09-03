#!/bin/bash
# Starts the dev server and forwards Stripe webhooks to it, together.
# Ctrl-C stops both.
#
# Usage: yarn start-site
# Override the port with PORT=3005 yarn start-site (defaults to 3100, the
# e2e port — see playwright.config.ts).
#
# Assumes the Stripe CLI is installed and logged in (`stripe login`).
# Update STRIPE_WEBHOOK_SECRET_FYP in .env.local/.env.test with the
# whsec_... this prints if it differs from what's there now.
#
# --project-name pins this to the CLI's "amsterdam parent project sandbox"
# profile (account acct_1SPjEFQa5oNdvF7x) — the account .env.test's
# STRIPE_SECRET_KEY actually belongs to. Without it, `stripe listen` uses
# the CLI's `default` profile (account acct_1SPjE2QXyrloqZVh) instead, which
# silently listens on the wrong account: checkout sessions get created fine
# against the sandbox account, but no webhook ever arrives, since listen is
# watching a different account's event stream. Run `stripe config --list`
# to see the profiles configured on this machine.
#
# Written against plain /bin/bash (macOS ships 3.2, no `wait -n`) — polls
# instead of using bash 4.3+'s wait -n, so it stops cleanly either way.

PORT="${PORT:-3100}"
STRIPE_PROJECT="${STRIPE_PROJECT:-amsterdam parent project sandbox}"

cleanup() {
  echo ""
  echo "Stopping dev server and stripe listen..."
  [ -n "$DEV_PID" ] && kill "$DEV_PID" 2>/dev/null
  [ -n "$STRIPE_PID" ] && kill "$STRIPE_PID" 2>/dev/null
  wait "$DEV_PID" "$STRIPE_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

NODE_ENV=test next dev -p "$PORT" &
DEV_PID=$!

stripe listen --project-name "$STRIPE_PROJECT" --forward-to "localhost:$PORT/api/webhooks/stripe/fyp" &
STRIPE_PID=$!

# Poll rather than `wait -n` (bash 4.3+ only) so either process exiting on
# its own — not just Ctrl-C — brings down the other and returns control.
while kill -0 "$DEV_PID" 2>/dev/null && kill -0 "$STRIPE_PID" 2>/dev/null; do
  sleep 1
done
cleanup
