import express from 'express';
import fs from 'fs';

const app = express();

// ✅ Disable Express version disclosure
app.disable('x-powered-by');

const PORT = 80;

// Load common passwords
const commonPasswords = new Set(
  fs.readFileSync('./xato-net-10-million-passwords-1000.txt', 'utf-8')
    .split('\n')
    .map(p => p.trim())
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML directly
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Password Checker</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; }
        input, button { padding: 0.5rem; font-size: 1rem; }
        #message { margin-top: 1rem; }
      </style>
    </head>
    <body>
      <h2>Enter Password</h2>
      <form id="passwordForm">
        <input type="password" id="password" name="password" required />
        <button type="submit">Check Password</button>
      </form>
      <p id="message"></p>
      <script>
        const form = document.getElementById('passwordForm');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const password = document.getElementById('password').value;

          const response = await fetch('/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });

          const data = await response.json();
          if (data.valid) {
            // Redirect to /valid with query param
            window.location.href = '/valid?password=' + encodeURIComponent(password);
          } else {
            document.getElementById('message').textContent = data.message;
            document.getElementById('message').style.color = 'red';
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.get('/valid', (req, res) => {
  const password = req.query.password || '';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Password Accepted</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; }
        button { padding: 0.5rem 1rem; font-size: 1rem; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <h2>Your password was accepted</h2>
      <p>You entered: <strong>${password}</strong></p>
      <form action="/" method="get">
        <button type="submit">Back to Home</button>
      </form>
    </body>
    </html>
  `);
});


// Password check endpoint
app.post('/check', (req, res) => {
  const { password } = req.body;

  // Check if password is at least 8 characters
  if (!password || password.length < 8) {
    return res.json({ valid: false, message: 'Password must be at least 8 characters long.' });
  }

  // Check if it's a common password
  const notCommon = !commonPasswords.has(password);
  if (!notCommon) {
    return res.json({ valid: false, message: 'Password is too common.' });
  }

  // Passed all checks
  res.json({ valid: true });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});