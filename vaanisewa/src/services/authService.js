import api from './api';

export async function signupVoice(fullname, email, password) {
  try {
    const response = await api.post('/user/signup', {
      fullname,
      email,
      password,
    });

    if (response.data && response.data.user) {
      return {
        success: true,
        user: response.data.user,
        token: 'voice-auth-token',
        error: null,
      };
    }

    return {
      success: false,
      user: null,
      token: null,
      error: 'Unexpected response from server',
    };
  } catch (error) {
    const apiError = error.response?.data?.message || error.message || 'Network error';
    return {
      success: false,
      user: null,
      token: null,
      error: apiError,
    };
  }
}

export async function loginVoice(email, password) {
  try {
    const response = await api.post('/user/login', {
      email,
      password,
    });

    if (response.data && response.data.user) {
      return {
        success: true,
        user: response.data.user,
        token: 'voice-auth-token',
        error: null,
      };
    }

    return {
      success: false,
      user: null,
      token: null,
      error: 'Unexpected response from server',
    };
  } catch (error) {
    const apiError = error.response?.data?.message || error.message || 'Network error';
    return {
      success: false,
      user: null,
      token: null,
      error: apiError,
    };
  }
}

export function translateError(apiError) {
  if (!apiError) return 'An unknown error occurred';

  const errorLower = apiError.toLowerCase();

  if (errorLower.includes('already exists') || errorLower.includes('user already exists')) {
    return 'This email is already registered. Would you like to log in instead?';
  }

  if (errorLower.includes('invalid') && (errorLower.includes('username') || errorLower.includes('password'))) {
    return 'Wrong email or password. Please try again.';
  }

  if (errorLower.includes('invalid username') || errorLower.includes('invalid password')) {
    return 'Wrong email or password. Please try again.';
  }

  if (errorLower.includes('not found') || errorLower.includes('user not found')) {
    return 'No account found with this email. Would you like to sign up?';
  }

  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('econnrefused')) {
    return 'Connection problem. Please check your internet and try again.';
  }

  if (errorLower.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (errorLower.includes('email') && errorLower.includes('invalid')) {
    return 'The email format is incorrect. Please say a valid email address.';
  }

  if (errorLower.includes('password') && errorLower.includes('short')) {
    return 'Password must be at least 6 characters long.';
  }

  return `Error: ${apiError}. Please try again.`;
}
