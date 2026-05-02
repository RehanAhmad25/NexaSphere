# 📄 src/pages/

Each subdirectory is a **full-page view** rendered by `App.jsx` when navigation changes. Pages receive an `onBack` prop to return to the previous view.

---

## Page Map

| Folder | Component | Triggered by |
|---|---|---|
| `home/` | `HeroSection` | Default (no page set) |
| `activities/` | `ActivitiesPage` · `ActivityDetailPage` | "Activities" nav tab |
| `events/` | `EventsPage` · `EventDetailPage` | "Events" nav tab |
| `about/` | `AboutPage` | "About" nav tab |
| `team/` | `TeamPage` · `TeamSection` | "Team" nav tab |
| `contact/` | `ContactPage` | "Contact" nav tab |
| `recruitment/` | `RecruitmentPage` | "Apply for Core Team" buttons |
| `membership/` | `MembershipPage` | "Join as Member" hero button |

---

## Adding a New Page

1. Create `src/pages/<name>/<Name>Page.jsx`
2. Export a default component that accepts `{ onBack }`
3. Add an import in `App.jsx`
4. Add a `page.type === '<name>'` render branch in `App.jsx`
5. Create an `open<Name>` callback using `useCallback` + `nav()`
6. Pass `open<Name>` as a prop to whatever component should trigger it

---

## Navigation Pattern (App.jsx)

All page switches go through the `nav()` helper which plays the cinematic wipe transition before committing the state change:

```js
const openExample = useCallback(() => {
  nav(() => setPage({ type: 'example' }));
}, [nav]);
```

Then in the render:

```jsx
{page?.type === 'example' && (
  <PageIn k="pg-example">
    <ExamplePage onBack={onBackHome} />
  </PageIn>
)}
```
