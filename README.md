# Secure Node.js Agent Backend API

A secure RESTful backend API built with Node.js and Express.js for authentication, profile management, agent management, file upload, training/testing workflow, and public widget communication.

This project was developed as a backend API for a graduation/final project and demonstrates practical implementation of authentication, protected routes, token handling, file validation, and API documentation.

---

## Features

### Authentication & Authorization

- User registration
- Email verification
- User login
- JWT access token authentication
- Refresh token handling using HTTP-only cookies
- Logout functionality
- Forgot password
- Reset password
- Protected profile endpoints

### Profile Management

- Get user profile
- Update username
- Change email with verification
- Change password while logged in
- Delete user account with confirmation

### Agent Management

- Create agent
- Get all user agents
- Get agent details
- Delete agent
- Track agent status
- Track AI training status

### File Upload

- Upload PDF files to an agent
- Validate file extension and MIME type
- Limit uploaded file size
- Replace old files safely
- Delete uploaded files

### Agent Training & Testing

- Trigger agent training
- Update AI status during training
- Test trained agent with user messages
- Return AI-generated answers and sources

### Public Widget APIs

- Create widget for an agent
- Get widget details
- Delete widget
- Initialize public widget session
- Send public user messages to an agent
- Store session messages

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL / Database layer
- JWT Authentication
- Cookies
- Multer
- Cloud Storage Integration
- Email Service Integration
- REST API Architecture

---

## Project Structure

```txt
final_project/
│
├── config/          # Database, CORS, and app configuration
├── controllers/     # Request handlers and business logic
├── middlewares/     # Authentication, validation, and error handling
├── models/          # Data models
├── public/          # Public assets
├── repositories/    # Database query layer
├── routes/          # API routes
├── utils/           # Helper functions and upload logic
├── server.js        # Application entry point
├── package.json
└── README.md
```

---

## API Overview

Base URL:

```txt
/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive access token |
| GET | `/auth/logout` | Logout user |
| GET | `/auth/refresh-token` | Refresh access token |
| GET | `/auth/verify-account?code=...` | Verify account |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/forgot-password` | Send password reset link |
| POST | `/auth/change-password?token=...` | Reset password |

### Profile Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/profile` | Get authenticated user profile |
| PUT | `/auth/profile-name` | Update user name |
| PUT | `/auth/profile-email` | Request email change |
| GET | `/auth/profile-email-confirm?token=...` | Confirm email change |
| PUT | `/auth/change-password-inside` | Change password while logged in |
| DELETE | `/auth/profile` | Delete user profile |

### Agent Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/agents` | Create a new agent |
| GET | `/agents` | Get all user agents |
| GET | `/agents/:id` | Get agent details |
| DELETE | `/agents/:id` | Delete agent |
| POST | `/agents/:id/train` | Train agent |
| POST | `/agents/:id/test` | Test trained agent |

### Upload Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload/:id/upload` | Upload file to agent |
| DELETE | `/upload/:id/delete` | Delete agent file |

### Widget Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/widgets/:agentId` | Create widget |
| GET | `/widgets/:agentId` | Get widget |
| DELETE | `/widgets/:agentId` | Delete widget |

### Public Widget Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/public/widgets/session` | Create public widget session |
| POST | `/public/widgets/ask` | Send message to widget agent |

---

## Security Features

- Password hashing before storing user credentials
- JWT-based access token authentication
- Refresh token stored in HTTP-only cookies
- Protected routes using authentication middleware
- File upload validation using file extension and MIME type checks
- File size limitation
- Email verification before login
- Password reset flow using secure tokens
- Separation between public and protected API routes
- Environment variables used for sensitive configuration

---

## Environment Variables

Create a `.env` file in the root directory and add the required environment variables.

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> Important: Do not commit the `.env` file to GitHub.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/BelalHame70/final_project.git
```

Navigate to the project directory:

```bash
cd final_project
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure your environment variables.

Run the server:

```bash
npm start
```

For development mode:

```bash
npm run dev
```

---

## Example Authentication Flow

1. Register a new account.
2. Verify the account using the verification link/code.
3. Login with email and password.
4. Use the returned access token for protected requests.
5. Use the refresh token cookie to refresh expired access tokens.
6. Logout when finished.

---

## Example Agent Flow

1. Create an agent.
2. Upload a PDF file to the agent.
3. Trigger agent training.
4. Wait until the agent AI status becomes ready.
5. Test the agent using a message.
6. Create a widget for public usage.

---

## Security Notes

- Sensitive values such as database URLs, JWT secrets, API keys, and email credentials must be stored in environment variables.
- The `.env` file should never be committed to GitHub.
- CORS should be configured using a trusted allowlist in production.
- Error responses should avoid exposing internal server details in production.
- Refresh tokens should be stored securely and rotated when needed.

---

## Future Improvements

- Add rate limiting for authentication and public widget endpoints
- Add centralized error handling
- Add request logging
- Add API test coverage
- Improve CORS configuration using production allowlist
- Add Swagger/OpenAPI documentation
- Add Docker support
- Add role-based access control

---

## Notes

This project is intended for educational and portfolio purposes. It demonstrates backend API development, authentication, file upload handling, protected routes, and secure API design concepts.

---

## Author

**Belal Hamed Salah**

- GitHub: [BelalHame70](https://github.com/BelalHame70)
- LinkedIn: [Belal Hamed](https://linkedin.com/in/belal-hamed-84a049265)
