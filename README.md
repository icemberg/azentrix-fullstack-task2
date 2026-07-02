# TaskFlow (Task Management System)

TaskFlow is a robust, full-stack, real-time task and project management system designed to help teams organize their work effortlessly. Built with a responsive React frontend and a scalable Spring Boot backend, it supports real-time collaboration via WebSockets, multi-team workspaces, robust role-based access control, and 2FA authentication.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand (Auth, Teams, UI), TanStack Query (Server State)
- **Real-Time**: STOMP over SockJS
- **Drag & Drop**: @dnd-kit/core

### Backend
- **Framework**: Java 17, Spring Boot 3
- **Security**: Spring Security, JWT Auth, Google OAuth2, 2FA (TOTP)
- **Real-Time**: Spring WebSocket (STOMP)
- **Database**: MySQL, Spring Data JPA, Hibernate

---

## 📐 System Architecture

The following diagram illustrates the high-level architecture of TaskFlow, showing the interaction between the client, backend services, and the database.

```mermaid
graph TD
    Client(Browser Client <br/> React / Vite)
    
    subgraph Spring Boot Backend
        API[REST API Layer <br/> Spring MVC]
        WS[WebSocket Endpoint <br/> STOMP]
        Security[Security Layer <br/> JWT Filter & OAuth2]
        Service[Service Layer <br/> Business Logic]
        Repo[Data Access Layer <br/> Spring Data JPA]
    end
    
    Database[(MySQL Database)]
    Google(Google OAuth2 API)

    Client -->|HTTP/HTTPS <br/> REST| Security
    Client -->|WebSocket <br/> STOMP| WS
    Security --> API
    Security -.->|OAuth2 Token| Google
    API --> Service
    WS --> Service
    Service --> Repo
    Repo --> Database
```

---

## 🗃️ Entity-Relationship Diagram (ERD)

This diagram describes the database schema, including Users, Workspaces (Teams), Boards, Cards, and their relationships.

```mermaid
erDiagram
    USER ||--o{ TEAM_MEMBER : "has"
    USER ||--o{ USER_SESSION : "creates"
    USER ||--o{ NOTIFICATION : "receives"
    USER }|--|| ROLE : "assigned"
    
    TEAM ||--o{ TEAM_MEMBER : "composed of"
    TEAM ||--o{ BOARD : "owns"
    TEAM ||--o{ TEAM_INVITATION : "generates"
    
    BOARD ||--o{ CARD : "contains"
    
    CARD ||--o| USER : "assigned to"
    CARD ||--|| USER : "created by"

    USER {
        Long userId PK
        String username
        String email
        String password
        String authProvider
        Boolean twoFactorEnabled
        String twoFactorSecret
    }
    
    ROLE {
        Long roleId PK
        String name
    }

    TEAM {
        Long teamId PK
        String name
        Boolean isPersonal
    }
    
    TEAM_MEMBER {
        Long id PK
        String role
    }
    
    BOARD {
        Long boardId PK
        String title
    }
    
    CARD {
        Long id PK
        String title
        String state "TODO, IN_PROGRESS, DONE"
        String priority
    }
    
    USER_SESSION {
        Long id PK
        String sessionId
        Boolean active
    }
```

---

## 🔒 Authentication Flow

TaskFlow supports standard JWT-based Authentication, Time-based One-Time Password (TOTP) 2FA, and Google OAuth2 login.

```mermaid
sequenceDiagram
    participant User
    participant Client as React Client
    participant API as Spring Auth Controller
    participant DB as MySQL DB

    User->>Client: Enters Email & Password
    Client->>API: POST /api/auth/login (Credentials)
    API->>DB: Fetch User
    DB-->>API: User Record
    
    alt is 2FA Enabled?
        API-->>Client: 200 OK (Requires 2FA)
        Client-->>User: Show 2FA Input
        User->>Client: Enters TOTP Code
        Client->>API: POST /api/auth/verify-2fa (Code)
        API->>API: Validate TOTP
    end

    API->>API: Generate JWT & Track Session
    API-->>Client: 200 OK (JWT Token)
    Client->>Client: Store JWT (Zustand & localStorage)
    Client-->>User: Redirect to Dashboard
```

---

## ⚡ WebSocket Real-Time Sync Flow

When a user modifies a board (e.g., drags a card from "TODO" to "DONE"), the change is pushed to all other clients connected to the same workspace/board.

```mermaid
sequenceDiagram
    participant User A
    participant User B
    participant Client A
    participant Client B
    participant WS as WebSocket Broker (Backend)
    participant API as REST Controller
    participant DB as Database

    User A->>Client A: Drags Card to "DONE"
    Client A->>API: PUT /v1/cards/{id}
    API->>DB: Update Card Status
    DB-->>API: Success
    API->>WS: Publish Event (Topic: /topic/boards/{boardId})
    API-->>Client A: 200 OK (Updated Card)
    
    WS-->>Client B: Push Message (Card Updated Event)
    Client B->>Client B: Invalidate Query / Update UI
    Client B-->>User B: Sees Card Move Real-Time
```

---

## ✨ Features

- **Personal & Team Workspaces**: Create isolated workspaces for personal tasks or invite members for collaborative team projects.
- **Kanban Boards**: Drag-and-drop task management. Cards can have assignees, priorities, and due dates.
- **Real-Time Collaboration**: STOMP over WebSockets ensures that board updates happen in real-time across all connected clients.
- **Robust Authentication**: Supports Standard registration, Google OAuth, and optional 2FA (Authenticator App).
- **Session Management**: View active sessions (IP, Browser, OS) and remotely revoke other sessions for security.
- **Responsive Design**: Polished, dark-themed UI that works flawlessly on desktop and mobile. 
- **Virtualised Rendering**: Ensures ultra-fast rendering for columns containing hundreds of tasks.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v20+)
- Java JDK 17
- MySQL (v8.0+)
- Maven

### 1. Database Setup
Create a MySQL database:
```sql
CREATE DATABASE task_management_system;
```
Configure your credentials in `task-management-system/src/main/resources/application-local.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/task_management_system?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

### 2. Backend Setup
```bash
cd task-management-system
mvn clean install
mvn spring-boot:run
```
The API will run on `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd task-management-systemf
npm install
npm run dev
```
The React client will run on `http://localhost:5173`.

---

## 📡 Core API Endpoints

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/google`
- **Sessions**: `GET /v1/sessions`, `DELETE /v1/sessions/other`, `DELETE /v1/sessions/{id}`
- **Teams**: `GET /v1/teams`, `POST /v1/teams`, `GET /v1/teams/{teamId}/members`
- **Boards**: `GET /v1/boards`, `POST /v1/boards`
- **Cards**: `GET /v1/boards/{boardId}/cards`, `POST /v1/cards`, `PUT /v1/cards/{id}`, `DELETE /v1/cards/{id}`

*Note: Most endpoints fall under the `/v1/` prefix and require a valid Bearer JWT token.*
