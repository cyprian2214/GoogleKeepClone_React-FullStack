# Google Keep Clone - AI Agent Instructions

## Project Overview
This is a full-stack note-taking application inspired by Google Keep, built with React and Firebase. The app allows users to create, view, and manage notes with real-time updates.

## Architecture & Key Components

### Frontend Components
- `App.jsx`: Main component handling auth state and note CRUD operations
- `components/`:
  - `NoteInput.jsx`: Expandable note creation form with click-outside detection
  - `NoteCard.jsx`: Individual note display with title and content
  - `Navbar.jsx`: Top navigation with auth controls
  - `Sidebar.jsx`: Left sidebar for navigation
  - `Modal.jsx`: Reusable modal component

### Data Flow
- Firebase Authentication manages user sessions
- Firestore stores notes with the following schema:
  ```js
  {
    userId: string,
    title: string,
    content: string,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  ```
- Real-time updates using Firestore `onSnapshot` listeners

## Development Workflow

### Setup & Running
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Access at: `http://localhost:5173`

### Firebase Integration
- All Firebase interactions are centralized in `src/firebase.js`
- Replace `firebaseConfig` with your own Firebase project credentials
- Auth state is managed globally in `App.jsx` using `onAuthStateChanged`

### Key Patterns
- Use `useState` for component-local state
- Use `useEffect` for side effects (auth, data fetching)
- User authentication required for note operations
- Click-outside detection using `useRef` and event listeners
- Material UI icons for consistent styling

## Common Tasks
- Adding new components: Create in `src/components/` and export from component file
- Styling: Add styles to `src/styles.css` using BEM naming convention
- Firebase operations: Import required functions from `firebase.js`