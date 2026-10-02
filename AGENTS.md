# Bataar Sanctuary working instructions

Before changing this project, read `docs/PROJECT-DECISIONS.md` and `docs/QUALITY-CHECKS.md`. Preserve the distinction between confirmed owner decisions, implementation facts, and unresolved information. Never invent prices or external integrations.

Assign separate file ownership when using parallel agents. Have another agent review material changes to pricing, authentication, language behavior, or payment state. Do not edit the same files concurrently.

Run the checks relevant to the change, then verify the published version and the affected user flow. Record new owner decisions and meaningful regressions in the decision log without credentials or guest contact details. Keep a known-good commit for rollback; never reset payment records to undo a UI release.

User instructions take precedence. These instructions do not require extra permission for work already authorized by the user.
