# TechNotes API

The TechNotes Backend is a Node.js/Express API built as part of the TechNotes MERN application, providing secure user authentication, role-based authorization, and full CRUD functionality for users and notes.
This backend has been fully converted to **TypeScript** for improved type safety and maintainability.

---

## Features

### Authentication & Security

- JWT-based authentication with access & refresh tokens
- HTTP-only cookies for secure session handling
- Custom CORS configuration with an allowed-origins list
- Environment-based configuration for production and development

### Role-Based Access Control

- Built-in roles: **Employee**, **Manager**, **Admin**
- Protected routes depending on user permissions
- Middleware-based authorization checks

### Notes API

- Create, read, update, delete notes
- Each note includes:
  - Ticket number
  - Completion status
  - Assigned user
  - Automatic timestamps

### Users API

- Create, update, delete users
- Role assignment and permissions management
- Enforced constraints to keep data consistent

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Cookie-based sessions

---

## API Overview

### Authentication

- POST /auth – Login
- GET /auth/refresh – Refresh token
- POST /auth/logout – Logout

### Users

- GET /users
- POST /users
- PATCH /users
- DELETE /users

### Notes

- GET /notes
- POST /notes
- PATCH /notes
- DELETE /notes

All protected routes require a valid JWT (via HTTP-only cookies).

---

## About this project

This backend was originally built as part of an educational MERN stack course.
While the core functionality came from the learning material, this version includes:

- A complete **TypeScript rewrite**
- Structural improvements to the API
- Extended type definitions
- Additional configuration for deployment

This project represents my growing understanding of **Node.js**, **MongoDB**, **TypeScript**, and secure backend architecture.
