const express = require('express');
const session = require('express-session');
const path = require('path');
const { validatePassword } = require('./passwordValidator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 } // 1 hour
}));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Login</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 500px; 
                margin: 50px auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; text-align: center; }
            .form-group { margin: 15px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="password"] { 
                width: 100%; 
                padding: 10px; 
                border: 1px solid #ddd; 
                border-radius: 4px;
                box-sizing: border-box;
            }
            button { 
                width: 100%; 
                padding: 12px; 
                background: #007bff; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 16px;
            }
            button:hover { background: #0056b3; }
            .error { 
                color: #d32f2f; 
                margin-top: 10px; 
                padding: 10px;
                background: #ffebee;
                border-radius: 4px;
            }
            .requirements {
                margin-top: 15px;
                padding: 15px;
                background: #e3f2fd;
                border-radius: 4px;
                font-size: 14px;
            }
            .requirements h3 { margin-top: 0; color: #1976d2; }
            .requirements ul { margin: 10px 0; padding-left: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Secure Login</h1>
            <form method="POST" action="/login">
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Login</button>
            </form>
            
            ${req.session.errors ? `<div class="error">
                <strong>Password does not meet requirements:</strong>
                <ul>
                    ${req.session.errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>` : ''}
            
            <div class="requirements">
                <h3>Password Requirements:</h3>
                <ul>
                    <li>At least 8 characters long</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one digit</li>
                    <li>At least one special character</li>
                    <li>Must not be a common password</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
  
  // Clear errors after displaying
  delete req.session.errors;
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    req.session.errors = ['Password is required'];
    return res.redirect('/');
  }
  
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    req.session.errors = validation.errors;
    return res.redirect('/');
  }
  
  // Password is valid - store in session and redirect to welcome page
  req.session.validPassword = password;
  res.redirect('/welcome');
});

app.get('/welcome', (req, res) => {
  if (!req.session.validPassword) {
    return res.redirect('/');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 500px; 
                margin: 50px auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            h1 { color: #28a745; }
            .password-display {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                word-break: break-all;
                font-family: monospace;
                border: 1px solid #dee2e6;
            }
            button { 
                padding: 12px 24px; 
                background: #dc3545; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 16px;
                text-decoration: none;
                display: inline-block;
            }
            button:hover { background: #c82333; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome!</h1>
            <p>Your password has been successfully validated.</p>
            <div class="password-display">
                <strong>Your Password:</strong><br>
                ${req.session.validPassword}
            </div>
            <a href="/logout"><button>Logout</button></a>
        </div>
    </body>
    </html>
  `);
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});