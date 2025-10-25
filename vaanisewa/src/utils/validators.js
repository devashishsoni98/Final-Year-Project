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
  return text.trim().toLowerCase();
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
  const normalized = normalizeText(text);

  if (normalized.match(/^(yes|correct|right|confirm|ok|okay|yep|yeah|yup)$/)) {
    return 'confirm';
  }

  if (normalized.match(/^(no|wrong|incorrect|repeat|again|redo)$/)) {
    return 'repeat';
  }

  return null;
};
