# 🏠 src/pages/home/

Home page hero section — the first thing visitors see.

---

## Files

| File | Purpose |
|---|---|
| `HeroSection.jsx` | Animated hero with logo, orbit rings, CTA buttons, and stats bar |

---

## Key Constants (top of file)

| Constant | Purpose |
|---|---|
| *(none currently)* | — |

## Key Props

| Prop | Type | Purpose |
|---|---|---|
| `onTabChange` | function | Navigate to a nav tab section |
| `onApply` | function | Open Core Team Application form |
| `onJoin` | function | Open Join as Member form |
| `theme` | `'dark'` \| `'light'` | Passed in from App.jsx |

---

## Stats Bar

Edit the `items` array inside `StatsBar` to update the 4 headline numbers:

```js
const items = [
  { v: '12', l: 'Members',  i: '👥' },
  { v: '8',  l: 'Activities', i: '⚡' },
  { v: '1',  l: 'Events Done', i: '📅' },
  { v: '∞',  l: 'Ideas',    i: '💡' },
];
```

---

## CTA Buttons (hero)

| Button | Action |
|---|---|
| **Join as Member** | Calls `onJoin()` → opens `MembershipPage` |
| **Core Team** | Calls `onTabChange('Team')` → opens Team page |
| **Apply for Core Team** | Calls `onApply()` → opens `RecruitmentPage` |
