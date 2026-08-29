# Student Ambassador Hub

**A community platform that helps Google Student Ambassadors in Brazil find each other and run events on their own campus.**

The ambassador programme brings together students from universities all over Brazil, but the day-to-day happens in large group chats. Finding someone from your own university — or knowing what is happening on your campus — means scrolling through hundreds of messages. This platform organises that: ambassadors by campus, events by region, and a place to publish what you are running locally.

> Independent, community-built project. Not an official Google product and not affiliated with or endorsed by Google.

---

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React Router, TypeScript, Tailwind CSS |
| Backend | Node.js, TypeScript, REST API |
| Auth | Google OAuth |
| Runtime & tooling | Bun |

```
Backend/    REST API, authentication, data layer
Frontend/   React Router app — landing page and the four hubs
deploy/     Deployment configuration
```

---

## Features

**Campus directory** — Ambassadors browse universities filtered by macro-region (Sudeste, Sul, Nordeste, Centro-Oeste, Norte) and by state. Each campus page carries its own events, workshops, resources and Gemini guide, plus counters for members, ambassadors and events.

**Events portal** — Upcoming events, a month calendar view and an archive of past events, with colour-coded category tags.

**Connect** — An ambassador directory with profiles, university tags and recognition from peers, browsable by region, alongside a board for official announcements.

**Authentication** — Sign-in with a Google account, so an ambassador's identity in the platform matches the one they already use in the programme.

---

## Design

The interface uses a light, playful neo-brutalist theme built around the Google colour palette: hard offset shadows, thick dark borders, tilted highlight blocks and floating 3D stickers. The intent was a platform that feels like the community it serves rather than a generic dashboard — approachable enough that a first-year student wants to click around.

---

## Running locally

```bash
bun install

# frontend
cd Frontend && bun run dev

# backend
cd Backend && bun run dev
```

```bash
bun test        # 12/12 passing
bun run build   # production build
```

Deployment notes are in [`DEPLOYMENT.md`](./DEPLOYMENT.md); a walkthrough of the interface is in [`walkthrough.md`](./walkthrough.md).

---

## Author

**Bruno Bianchi** — Full-Stack Developer · Google Student Ambassador 2026 · Computer Engineering @ UNIFEI
[brunobianchi.dev](https://brunobianchi.dev) · [LinkedIn](https://www.linkedin.com/in/brunorbianchi)
