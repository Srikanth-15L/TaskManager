# TeamTaskManager

A collaborative task management platform designed for high-performance teams. This project features a robust role-based access control (RBAC) system, real-time analytics, and a modern, high-contrast UI for efficient project tracking.

## Key Features

-   **Role-Based Access Control**: Admins can manage projects, members, and all tasks, while team members focus on their assigned work.
-   **Interactive Analytics**: Data-driven dashboard using Recharts to visualize task distribution, priority matrices, and project completion trends.
-   **Project Lifecycle Management**: Support for project status tracking (Pending vs. Completed) with Admin-only overrides.
-   **Real-Time Task Controls**: Interactive status bars for quick updates and Admin reassignment capabilities.
-   **Secure Authentication**: Integrated with Firebase Auth and protected by FastAPI middleware on the backend.
-   **Clean UI/UX**: High-contrast light theme built with Vanilla CSS and Framer Motion for smooth, professional transitions.

## Tech Stack

-   **Frontend**: React (Vite), Framer Motion, Recharts, Lucide React, TailwindCSS.
-   **Backend**: FastAPI (Python), Node.js (Express), Firebase Admin SDK.
-   **Database**: Google Firestore (NoSQL).
-   **Authentication**: Firebase Authentication.

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   Python 3.9+
-   Firebase Account & Project

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Srikanth-15L/TaskManager.git
<<<<<<< HEAD
    cd TeamTaskManager
=======
    cd TaskManager
>>>>>>> 32db8cc (Final cleanup and deployment configuration)
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    # Add your Firebase service account key as 'config/TaskManagerFirebase.json'
    # Create a .env file with VITE_API_URL and other necessary variables
    npm start
    ```

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    # Create a .env file with VITE_API_URL
    npm run dev
    ```

## Development Decisions

-   **State Management**: Used React Context API for lightweight and efficient global state handling (Auth, User Profile).
-   **UI Architecture**: Implemented a custom CSS variable system for a cohesive and easily maintainable design language.
-   **Performance**: Utilized asynchronous promise-based data fetching to ensure a snappy and responsive user experience.
