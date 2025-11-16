export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  const trimmed = password.trim();

  if (trimmed.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }

  return { valid: true, error: null };
};

export const isValidName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true, error: null };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateFullName = (fullname) => {
  return fullname && fullname.trim().length >= 2;
};

export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

export const cleanEmail = (email) => {
  if (!email || typeof email !== 'string') return '';

  return email
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
};

export const cleanName = (name) => {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export const extractEmail = (text) => {
  const normalized = text.toLowerCase()
    .replace(/\s+at\s+/g, '@')
    .replace(/\s+dot\s+/g, '.')
    .replace(/\s+/g, '');

  const emailMatch = normalized.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  return emailMatch ? emailMatch[0] : text.replace(/\s+/g, '');
};

export const normalizeConfirmation = (text) => {
  if (!text || typeof text !== 'string') return 'unknown';

  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ');

  if (/^(yes|correct|right|confirm|ok|okay|yep|yeah|yup)$/.test(normalized)) {
    return 'confirm';
  }

  if (/^(no|wrong|incorrect|repeat|again|redo)$/.test(normalized)) {
    return 'repeat';
  }

  return 'unknown';
};
