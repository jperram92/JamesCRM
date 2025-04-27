/**
 * Password validation utilities for JamesCRM
 */

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePassword = (password) => {
  // Check if password is provided
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }
  
  const errors = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check maximum length
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  if (isCommonPassword(password)) {
    errors.push('Password is too common or easily guessable');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength score (0-100)
 * @param {String} password - Password to evaluate
 * @returns {Number} Strength score
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length score (up to 25 points)
  score += Math.min(25, password.length * 2);
  
  // Character variety score (up to 25 points)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const charVariety = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  score += charVariety * 6.25;
  
  // Distribution score (up to 25 points)
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const numberCount = (password.match(/[0-9]/g) || []).length;
  const specialCharCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  
  const totalChars = password.length;
  const uppercaseRatio = uppercaseCount / totalChars;
  const lowercaseRatio = lowercaseCount / totalChars;
  const numberRatio = numberCount / totalChars;
  const specialCharRatio = specialCharCount / totalChars;
  
  // Ideal distribution is around 25% for each type
  const distributionScore = 25 - (
    Math.abs(uppercaseRatio - 0.25) +
    Math.abs(lowercaseRatio - 0.25) +
    Math.abs(numberRatio - 0.25) +
    Math.abs(specialCharRatio - 0.25)
  ) * 25;
  
  score += Math.max(0, distributionScore);
  
  // Complexity score (up to 25 points)
  // Check for sequences and repetitions
  const hasSequences = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/i.test(password);
  const hasRepeatedChars = /(.)\1{2,}/i.test(password);
  
  if (!hasSequences) score += 12.5;
  if (!hasRepeatedChars) score += 12.5;
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Check if password is a common password
 * @param {String} password - Password to check
 * @returns {Boolean} Whether the password is common
 */
const isCommonPassword = (password) => {
  // List of common passwords
  const commonPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
    'dragon', 'baseball', 'football', 'iloveyou', 'master',
    'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
    'superman', 'qazwsx', 'michael', 'football', 'welcome'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

/**
 * Get password strength description
 * @param {Number} score - Password strength score
 * @returns {Object} Strength description
 */
const getPasswordStrengthDescription = (score) => {
  if (score < 20) {
    return {
      label: 'Very Weak',
      color: '#ff0000',
      message: 'This password is extremely vulnerable to attacks.'
    };
  } else if (score < 40) {
    return {
      label: 'Weak',
      color: '#ff9900',
      message: 'This password is easy to guess. Please choose a stronger password.'
    };
  } else if (score < 60) {
    return {
      label: 'Moderate',
      color: '#ffff00',
      message: 'This password provides some security but could be stronger.'
    };
  } else if (score < 80) {
    return {
      label: 'Strong',
      color: '#99cc00',
      message: 'This password is strong and provides good security.'
    };
  } else {
    return {
      label: 'Very Strong',
      color: '#00cc00',
      message: 'This password is very strong and provides excellent security.'
    };
  }
};

module.exports = {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthDescription
};
