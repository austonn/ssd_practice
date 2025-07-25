const fs = require('fs');
const path = require('path');

// Load common passwords from the 10-million-password-list-top-1000.txt file
let commonPasswords = [];
try {
  const passwordFile = path.join(__dirname, '..', 'xato-net-10-million-passwords-1000.txt');
  const fileContent = fs.readFileSync(passwordFile, 'utf8');
  commonPasswords = fileContent.split('\n')
    .map(password => password.trim().toLowerCase())
    .filter(password => password.length > 0);
} catch (error) {
  console.warn('Warning: Could not load common passwords file:', error.message);
}

/**
 * Validates password based on OWASP Top 10 Proactive Controls C6
 * Level 1: Password Requirements
 * Blocks common passwords from 10-million-password-list-top-1000.txt
 */
function validatePassword(password) {
  const errors = [];
  
  // Check minimum length (8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check maximum length (128 characters to prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for at least one digit
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common passwords (case insensitive)
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = { validatePassword };
