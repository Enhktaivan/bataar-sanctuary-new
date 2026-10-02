# Quality and release checks

Use these checks for each change; passing a local test is not evidence that the live service was updated. Keep evidence concise: commit, commands/results, affected flow, remaining limits, deployed build identity. Do not record secrets or guest data.

## Ownership and review

- Coordinator maintains the decision log, resolves conflicting requirements, owns final integration and release reporting.
- Frontend owner maintains customer navigation, language behavior, safe links and generated admin page consistency.
- Payment owner maintains authenticated APIs, D1 state, immutable MNT quotes, QPay verification and reconciliation behavior.
- A reviewer independently checks the changed user flow, expected values and role boundaries. One person/agent owns each edited file at a time; review others' files without concurrent edits.

Before implementation, read applicable `AGENTS.md`, identify authoritative requirements, and flag unresolved evidence in `PROJECT-DECISIONS.md`. Do not silently choose a disputed tariff. Use the customer's latest explicit instruction when it supersedes earlier decisions.

## Meaningful acceptance checks before publishing

1. Run frontend `npm run lint` and `npm run build`. Run the payment/booking Node tests and changed-flow regressions. Test expected totals from human-approved examples independently of implementation; cover solo, pairs, odd groups, room type, meals, dates, tour quote-only pricing and USD display without changing MNT.
2. Verify customer entry points all reach the intended common form, preserving language and room/tour intent. Test changes to form fields update estimates. Cover all nine supported booking/assistant languages, Italian chip intent, existing answers after a language switch and a switch during an in-flight response. Review main-site Italian separately.
3. Verify anonymous admin calls return 401 and wrong origins are rejected. Customer pages must not expose shared guest lists/contact details/notes. Confirm credentials never persist; logout clears rendered records, drafts and entered quote fields. Inspect browser behavior, not only source-string assertions.
4. Verify admin login, inquiry approval, immutable quote and duplicate/concurrent issuance handling with fake provider responses. Payment must require exact server-verified invoice/currency/amount; a callback or customer input must not mark it paid. Ambiguous issuance must require reconciliation rather than blind retry.
5. Confirm Notion/Make links appear only after authenticated login, disappear on logout, and accurately describe link-only behavior. Confirm Gmail drafts bind recipient and editable content to the same booking and never auto-send.
6. Review the final publication payload and generated files. Admin source must match its generated page; index and service worker must reference available assets. Exclude secrets, private databases, personal records and unrelated binaries. Record current branch heads and a known-good rollback commit before publishing.

Do not create real bookings, send emails, or issue real invoices as ordinary regression tests. A live merchant test needs its explicitly authorized scope, approved amount and reconciliation record. A green health check alone proves neither merchant authentication nor payment completion.

## Deployment verification and rollback

After an authorized publication, compare the deployed version/build identifier and asset hashes with the reviewed commit and build. Verify both the main website and admin route, the payment backend version, and service-worker cache behavior. Report separately: source committed, build passed, publication accepted, live version verified, payment flow verified. Never collapse these into a single “done” claim.

Keep the previous known-good website/Worker release available. On a regression, roll back code/assets to that identified release and verify the deployed build again. Preserve D1 payment records; do not reset the database or recreate uncertain invoices during rollback. Back up D1 before schema changes, review migration compatibility with the previous code, and restore only through a reviewed recovery plan that reconciles payments since the snapshot.

If credentials or another external dependency block a check, record the exact unresolved check and continue other independent verification. Do not substitute invented availability, tariff, delivery, or payment success.
