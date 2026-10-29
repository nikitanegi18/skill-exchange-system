# Skill Exchange System

A peer-to-peer learning platform where students can connect, schedule learning sessions, share resources, assign practice work, take quizzes, and communicate securely using End-to-End Encrypted (E2EE) messaging.

## Features
- **User Authentication**: Secure user registration and login.
- **Skill Discovery**: Browse and request to learn skills offered by other students.
- **Learning Partnerships**: Collaborative workspaces for accepted exchanges.
- **Learning Tools**: 
  - Schedule video sessions (Jitsi integration).
  - Share notes and resource links.
  - Create, submit, and grade assignments.
  - Create and attempt multiple-choice quizzes.
- **E2EE Messaging**: Real-time messaging using a Rust-based WebAssembly (WASM) cryptographic library (X25519 & XChaCha20Poly1305) over Socket.IO.
- **Dashboard**: Track upcoming sessions, pending assignments, and quizzes across all workspaces.

## Architecture Overview
- **Frontend**: React (Vite), Tailwind CSS, React Router.
- **Backend Microservices**: Node.js, Express, MongoDB Atlas.
  - `user-service` (Port 5001): Manages user identity.
  - `skill-service` (Port 5002): Manages skill offerings.
  - `exchange-service` (Port 5003): Manages exchange requests and workspace activities.
  - `messaging-service` (Port 3001): Socket.IO server for real-time E2EE messaging.
- **Cryptography**: Rust library compiled to WASM (`e2ee-core`) running in the browser for key generation and message encryption.

## Prerequisites
- Node.js (v16+)
- npm
- Rust & `wasm-pack` (if rebuilding the WASM crypto library)
- MongoDB Atlas account (or local MongoDB)

## Setup Instructions

1. **Clone and Install Backend Dependencies**
   ```bash
   cd skill-exchange-system/backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `backend` directory based on `backend/.env.example`:
   ```env
   MONGODB_URI=mongodb+srv://<your_username>:<your_password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Start Microservices**
   Run the following commands in separate terminal tabs from the `backend` directory:
   ```bash
   npm run start:user
   npm run start:skill
   npm run start:exchange
   cd messaging && node server.js
   ```

4. **Install and Start Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev -- --port 5174
   ```

## WASM Build Process (Optional)
If you modify the Rust cryptography code (`frontend/e2ee-core`), rebuild the WASM module:
```bash
cd frontend/e2ee-core
wasm-pack build --target web
```

## API Documentation

### User Service (Port 5001)
- `POST /users`: Register a new user with a public key.
- `GET /users/find/:username`: Find a user's public key.

### Skill Service (Port 5002)
- `GET /skills`: Retrieve all skills.
- `POST /skills`: Create a new skill offering.
- `PUT /skills/:id`: Update a skill.
- `DELETE /skills/:id`: Delete a skill.

### Exchange Service (Port 5003)
- `GET /exchanges`: Get all exchange requests.
- `POST /exchanges`: Create an exchange request.
- `PATCH /exchanges/:id/status`: Accept or reject a request.
- `PATCH /exchanges/:id/workspace`: Update workspace data (sessions, notes, assignments, quizzes).

## Testing Instructions
1. Register two different users in two different browsers (or one incognito window).
2. Add a skill as User A.
3. Browse skills and request the skill as User B.
4. Accept the request as User A in the "Requests" page.
5. Open the Workspace. Create a session, assignment, and quiz as User A.
6. Submit the assignment and attempt the quiz as User B.
7. Open "Messages", search for the other user, and verify E2EE messaging works.
