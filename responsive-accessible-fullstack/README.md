# AccessBoard — Responsive & Accessible Full-Stack Interface

A complete full-stack project based on the requirement:

> Responsive, Accessible Interface — Make it work on a phone and with a keyboard.

## Features

- React + Vite frontend
- Node.js + Express backend
- Create, read, update and delete tasks
- Search and filter tasks
- Responsive desktop/tablet/mobile layout
- Keyboard-friendly controls
- Skip-to-content link
- Visible keyboard focus states
- Semantic HTML and ARIA labels
- Live status announcements
- Reduced-motion support
- No database required: tasks are stored in `backend/data/tasks.json`

## Project structure

```text
responsive-accessible-fullstack/
├── backend/
│   ├── data/
│   │   └── tasks.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Requirements

Install Node.js 18+.

## Run backend

Open PowerShell/Terminal:

```powershell
cd backend
npm install
npm start
```

Backend:
`http://localhost:5000`

## Run frontend

Open a second PowerShell/Terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:
`http://localhost:5173`

## Keyboard testing

1. Open the application.
2. Press `Tab` repeatedly.
3. Use `Enter` or `Space` on buttons.
4. Use the checkbox with the keyboard.
5. Use `Shift + Tab` to move backwards.
6. Test the "Skip to main content" link after refreshing the page.

## API endpoints

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `DELETE /api/tasks`

## Example POST body

```json
{
  "title": "Complete assignment",
  "description": "Finish the full-stack project documentation."
}
```
