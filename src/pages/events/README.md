# 📅 src/pages/events/

Events pages — home page event timeline and full event detail pages.

---

## Files

| File | Purpose |
|---|---|
| `EventsPage.jsx` | Full-page events timeline (all events) |
| `EventDetailPage.jsx` | Full detail page for a single event |

---

## To Add an Event

Open `src/data/eventsData.js` and append to the `events` array:

```js
{
  id: 4,                     // next sequential integer
  name: 'Your Event Name',
  shortName: 'Short Name',
  date: 'April 2026',
  description: 'One paragraph description.',
  status: 'upcoming',        // 'upcoming' | 'completed'
  icon: '🚀',
  tags: ['Tag1', 'Tag2'],
}
```

For a **conducted KSS / Insight Session** with a detail page, also add it to `src/data/activities/insightSession.js → conductedEvents[]`.
