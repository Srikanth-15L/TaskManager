TEAM TASK MANAGER
=================

OVERVIEW
--------
A collaborative task management platform designed for high-performance teams. This project features a robust role-based access control (RBAC) system, real-time analytics, and a modern, high-contrast UI for efficient project tracking.

KEY FEATURES
------------
- Role-Based Access Control: Admins can manage projects, members, and all tasks, while team members focus on their assigned work.
- Interactive Analytics: Data-driven dashboard using Recharts to visualize task distribution, priority matrices, and project completion trends.
- Project Lifecycle Management: Support for project status tracking (Pending vs. Completed) with Admin-only overrides.
- Real-Time Task Controls: Interactive status bars for quick updates and Admin reassignment capabilities.
- Secure Authentication: Integrated with Firebase Auth and protected by FastAPI middleware on the backend.
- Clean UI/UX: High-contrast light theme built with Vanilla CSS and Framer Motion for smooth, professional transitions.

TECH STACK
----------
- Frontend: React (Vite), Framer Motion, Recharts, Lucide React, TailwindCSS.
- Backend: FastAPI (Python), Node.js (Express), Firebase Admin SDK.
- Database: Google Firestore (NoSQL).
- Authentication: Firebase Authentication.

GETTING STARTED
---------------

Prerequisites:
- Node.js (v18+)
- Python 3.9+
- Firebase Account & Project

Installation:

1. Clone the repository:
   git clone https://github.com/Srikanth-15L/TaskManager.git
   cd TaskManager

2. Setup Backend:
   cd backend
   npm install
   # Add your Firebase service account key as 'config/TaskManagerFirebase.json'
   # Create a .env file with VITE_API_URL and other necessary variables
   npm start

3. Setup Frontend:
   cd frontend
   npm install
   # Create a .env file with VITE_API_URL
   npm run dev

DEVELOPMENT DECISIONS
---------------------
- State Management: Used React Context API for lightweight and efficient global state handling (Auth, User Profile).
- UI Architecture: Implemented a custom CSS variable system for a cohesive and easily maintainable design language.
- Performance: Utilized asynchronous promise-based data fetching to ensure a snappy and responsive user experience.
