# Project decisions

Project: `Enhktaivan/bataar-sanctuary-new` (Bataar Sanctuary). This record describes decisions and evidence, not proof of a successful deployment. Do not store credentials, admin passwords, private webhook URLs, guest contact details, or payment tokens here.

## Append-only decision log

Add dated entries with the human instruction or verified source, implementation consequence, and any unresolved question. Preserve older entries; supersede them explicitly rather than rewriting their evidence. Dates below use Asia/Ulaanbaatar.

### 2026-10-03 — Language dropdown interaction regression

The user reported that the nine-language dropdown disappeared while moving to or selecting an option. The public widget used hover-only visibility with a gap below its trigger. The widget now opens explicitly by clicking or tapping the language button and remains open while moving within the dropdown. Outside pointer/focus interaction and Escape dismiss it; selection closes it and restores trigger focus. The trigger reports expanded state and identifies the controlled options. Targeted source-bound behavior tests cover internal pointer/focus stability, outside dismissal, Escape, listener cleanup and all nine selections. TypeScript/build verification is separate from published browser verification; publication is handled by the owning agent.

### 2026-10-02 — Booking and payment roles

Customers submit the common hosted booking form for accommodation or tours. The camp confirms availability and the final MNT amount before issuing an invoice. Public inquiries never authorize payment or mark an invoice paid. A private customer status link is a bearer link: anyone holding it can see the limited status page; it must not expose email, phone, or free-form notes.

Staff use the authenticated admin panel. Authentication runs before all `/admin` handlers. Admin credentials remain in tab memory, are cleared on logout, and never enter public bundles or persistent browser storage. Public CRM controls and old local inquiry storage were removed. Backend authorization, rather than hiding UI, protects shared records.

### 2026-10-02 — Verified tariff instructions versus unresolved image evidence

Direct human text in the chat titled **Respond to a greeting**, on 2026-10-01, verifies:

- Standard single total **390,000 MNT**: turn `01a0f706-db4b-7180-b986-c932610662ed`, “390t bolno niit une”.
- Deluxe **450,000 MNT single / 650,000 MNT couple**: turn `01a0f709-0cfe-76a2-885d-d28d9024ae67`.
- Family **650,000 MNT**, with **three meals included**: turn `01a0f70a-c9d7-74b0-a229-690ed1b1ed3f`.
- A solo occupant pays the second person's lodging portion: turn `01a0f6f0-31ee-74e3-9c16-f2d3951a4884`.

Two historical standard tariff descriptions remain disputed: **220,000 / 320,000**, meals **30,000 + 45,000 + 45,000**, lodging **100,000 / 200,000**; versus **260,000 / 350,000**, meals **40,000 + 45,000 + 45,000**, lodging **130,000 / 260,000**. No direct typed human statement for either breakdown was recovered in the reviewed chats. The standard tariff image attached to turn `01a0f704-ca32-7432-8e0a-2d69650c31e0` is no longer available at its recorded local path. The explicit single-total correction is 390,000; do not treat an assistant's arithmetic or an unverified image transcription as a new human tariff decision.

Current code uses the second lodging/meal breakdown and a 390,000 standard solo full-board total. This is an implementation fact, **not independent confirmation of the disputed breakdown**. Preserve the distinction and reconcile authoritative image evidence or a new explicit owner correction before describing every tariff component as verified. Tours and unsupported room-only prices require a staff quote; do not invent a room charge or subtract guessed meal costs.

### 2026-10-02 — Currency, external tools and languages

QPay invoices and payment verification use **MNT**. USD is an indicative display conversion using a positive configured rate and its date (`BOOKING_USD_RATE`, `BOOKING_USD_RATE_DATE`); it never changes the stored MNT amount or implies a card-processing integration.

Staff Notion and Make controls are external **links only** after admin login. The former Notion tab was local CRM/CSV, not a verified Notion integration. The recovered second tool was the Make webhook placeholder. Automatic Notion/Make sync is unconfigured. Gmail compose and email-app links prepare drafts; the human reviews and sends. The panel does not read Gmail or send mail automatically.

Assistant and hosted booking flows support `mn`, `en`, `ko`, `zh`, `ja`, `ru`, `de`, `fr`, `it`. Existing automatic assistant responses regenerate in the selected language. Main-site Italian coverage/fallback remains a separate pending review; do not claim the entire site is fully Italian because the assistant and booking form are translated.

### 2026-10-02 — Italian fallback review completed

Main-site rendering safely falls back to English when Italian is selected. Stored language and assistant events remain Italian, so the assistant and hosted booking form retain Italian. Targeted tests against the actual bundled initialization and callback pass. This supersedes the pending fallback review above; full Italian main-site translation remains outside the verified coverage.

### 2026-10-03 — Shared public camp knowledge and notification preparation

The owner requested one camp knowledge base for email drafts and the reference chat in all nine existing languages. `src/campKnowledge.json` is the reviewed public snapshot: nine topics in nine languages. It contains no guest records, private payment status, credentials or internal source paths. Chat answers and authenticated staff draft helpers use this snapshot; staff review and send inquiry replies. This is deterministic reference content, not a live LLM or automatic inbox reader.

The same 81 localized entries were imported into the private Erdii Notion workspace. A separate booking database was created. Direct edits in Notion do not yet automatically update the website snapshot. Make Gmail is connected and notification drafts are saved; Notion OAuth completion and end-to-end delivery remain unverified. Do not claim automatic emails or Notion sync are active.

The payment Worker has a durable private notification outbox. New bookings and server-verified MNT payments enqueue stable event IDs atomically. Customer receipt addresses come from linked bookings. Optional Make delivery remains disabled until the receiver workflow is verified; a webhook acceptance is not proof of email delivery. No cron, paid upgrade or real test email was added.

### 2026-10-03 — Owner-selected snow leopard videos

The owner identified two recordings using Messenger screenshots: the Thursday 19:49 30-second cliff clip and Friday 17:30 shared National Park Academy Reel (1841067147056065), showing a leopard and camel sharing water. The downloaded camel-herd clip is not one of the selected recordings. The first clip is hosted as an MP4; the second keeps its public Facebook source and attribution and loads the embedded player only on viewer request, with a direct source link. Do not describe the public third-party Reel as footage owned by the camp or expose precise wildlife coordinates.

Browser verification found Facebook refuses embedded playback for the selected Reel because it may contain content owned by someone else. The release therefore uses an attributed direct Facebook viewing card, with an explicit external-playback note, rather than a broken iframe or a copied third-party file. Both selections are listed; only the owner-supplied 30-second clip plays locally.
