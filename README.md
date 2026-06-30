# Task Management System (Mini Trello)

## Problem Statement
Remote teams lack a lightweight, self-hostable task collaboration tool. Most existing tools are either too bloated or too expensive for small teams.

## Solution
This project is a Multi-User Task Management System (a mini Trello) designed to be lightweight, fast, and easily self-hostable.

### Key Features
*   **Authentication**: Users can register and log in using JWT-based auth.
*   **Boards & Columns**: Boards contain columns (To Do / In Progress / Done) with draggable cards.
*   **Cards**: Cards support title, description, assignee, due date, and priority tag.
*   **Real-Time Updates**: Two users on the same board see updates in near real-time powered by Spring WebSockets (STOMP).
*   **Role-Based Access Control**: Admins can manage users; Members can only manage their own cards.
*   **Email Notifications**: Send assignment and invitation emails (using `spring-boot-starter-mail`).
*   **Docker Ready**: Multi-stage Dockerfiles provided for both backend and frontend for easy free-tier deployment (Render, Railway, Vercel, etc.).

## Live Demo
> **Live Link:** [https://taskflow-movd.onrender.com](https://taskflow-movd.onrender.com/) 

## Tech Stack
*   **Backend**: Java, Spring Boot, Spring Data JPA, Spring Security, JWT, WebSockets (STOMP), JavaMailSender.
*   **Frontend**: React, Vite, Zustand, Tailwind CSS, React Query.
*   **Database**: MySQL.

## Deployment Instructions

You can easily deploy this application on platforms like Render, Railway, or Fly.io using the included Dockerfiles.

### Backend Deployment (Render/Railway)
The backend uses a multi-stage Docker build to compile the Maven project and package it into a lightweight JRE image.

1. Connect your repository to the hosting platform.
2. Select the backend folder (`task-management-system`).
3. Set the build environment to Docker.
4. Set the following environment variables:
    *   `azentrix.app.jwtSecret`: Your JWT Secret Key.
    *   `SMTP_HOST`: e.g., `smtp.gmail.com`
    *   `SMTP_PORT`: e.g., `587`
    *   `SMTP_USERNAME`: Your email address
    *   `SMTP_PASSWORD`: Your app password
    *   `spring.datasource.url`: Your MySQL connection string

### Frontend Deployment (Vercel/Render)
The frontend uses a multi-stage Docker build using Node.js for building and Nginx for serving the static files.

1. For platforms like **Vercel**, you don't even need Docker. Just point it to `task-management-systemf` and Vercel will automatically build the Vite app.
2. For platforms like **Render** using Docker:
    * Select the `task-management-systemf` folder.
    * Ensure the `nginx.conf` and `Dockerfile` are present.
    * Render will build and serve the React app using Nginx.

## Local Setup

### Prerequisites
* JDK 17
* Node.js 18+
* MySQL

### Running Backend
```bash
cd task-management-system
mvn spring-boot:run
```

### Running Frontend
```bash
cd task-management-systemf
npm install
npm run dev
```
