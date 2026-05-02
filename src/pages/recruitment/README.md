# 📝 src/pages/recruitment/

In-website **NexaSphere Core Team Application Form** — 7-step form that collects applicant details and writes responses directly to Google Sheets via Apps Script.

---

## Files

| File | Purpose |
|---|---|
| `RecruitmentPage.jsx` | Full 7-step application form + Roles & Responsibilities slide-over modal |

---

## Form Steps

| Step | Title | Key Fields |
|---|---|---|
| 0 | About NexaSphere | Informational — no input |
| 1 | Personal Information | Full Name, College Email, WhatsApp, Year, Branch, Section |
| 2 | Role & Domain Preference | Role applied for, Areas of interest (multi-select) |
| 3 | Skills & Experience | Programming skills, Communication languages, Campus experience, GitHub |
| 4 | Commitment & Availability | Hours/week, Campus attendance, Assessment consent |
| 5 | Motivation & Statement | Why join, Anything else |
| 6 | Declaration & Consent | 3 agreement checkboxes + 1 disagree (blocks submission) |

---

## Validation Rules

- **College Email** must end with `@glbajajgroup.org`
- **WhatsApp** must be exactly 10 digits
- **GitHub URL** format: `https://github.com/username` (optional — only validated if filled)
- All `*` fields must be filled before proceeding to next step
- Declaration: all 3 positive boxes must be checked; "disagree" must be unchecked

---

## Google Sheets Integration

| Setting | Value |
|---|---|
| Constant | `APPS_SCRIPT_URL` (line ~883 in `RecruitmentPage.jsx`) |
| Sheet tab | `Responses` |
| Dedup key | College email (stored in `localStorage: ns_submitted_emails`) |

The script is a **separate** Apps Script project from the Membership form.

---

## Roles & Responsibilities Modal

A `RolesGuideModal` slide-over panel (renders at z-index 99999) lists all Core Team roles with their responsibilities. Triggered by the "View Roles & Responsibilities" button on Step 2.

- Opens with `slideInRight` animation
- Closes on backdrop click, ✕ button, or Escape key
- Locks body scroll while open

---

## Success Screen

After submission, the user sees links to:
- 💬 Core Team Screening Room (WhatsApp group)
- 🌐 NexaSphere Community (WhatsApp group)
