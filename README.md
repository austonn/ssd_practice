# Secure Web App

A simple web application demonstrating secure password validation based on OWASP Top 10 Proactive Controls C6.

## Features

- Home page with password input form
- Password validation based on OWASP requirements:
  - Minimum 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one digit
  - At least one special character
  - Blocks common passwords from leaked password lists
- Welcome page displaying validated password
- Session management with logout functionality

## Requirements

- Node.js 16 or higher
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

3. Open your browser and go to `http://localhost:3000`

## Docker

You can also run the application using Docker:

```bash
docker-compose up --build
```

## Password Requirements

The application enforces the following password requirements:
- At least 8 characters long
- At least one lowercase letter (a-z)
- At least one uppercase letter (A-Z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?)
- Must not be a common password from leaked password lists

## Security Features

- Common password blocking (top 100+ most common passwords)
- Session-based authentication
- Input validation and sanitization
- OWASP compliant password requirements
