# 👥 src/pages/team/

Team pages — displays core team members and links to the Core Team Application form.

---

## Files

| File | Purpose |
|---|---|
| `TeamSection.jsx` | Embedded team section shown on the home page scroll |
| `TeamPage.jsx` | Full-page team view (opened from "Team" nav tab) |

---

## Key Props

| Component | Prop | Purpose |
|---|---|---|
| `TeamSection` | `onApply` | Opens Core Team Application form |
| `TeamPage` | `onBack` | Returns to home page |
| `TeamPage` | `onApply` | Opens Core Team Application form |

---

## Team Data

All members are defined in `src/data/teamData.js`. Each entry:

```js
{
  name: 'Full Name',
  role: 'Role Title',
  domain: 'Domain',
  year: '2nd Year',
  branch: 'CSE',
  photo: memberImg,           // imported at top of teamData.js
  linkedin: 'https://...',    // optional
  github: 'https://...',      // optional
  bio: 'Short bio sentence.', // optional
}
```

**To add a new member:**
1. Add photo to `src/assets/images/team/<name>.png` (300×300px, transparent bg)
2. Import photo in `teamData.js`
3. Add entry to the `teamMembers` array
