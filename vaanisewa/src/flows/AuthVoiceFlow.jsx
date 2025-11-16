import api from '../services/api';
import commandParser from '../dialogue/CommandParser';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  normalizeConfirmation
} from '../utils/validators';

export const createSignupFlow = (onSuccess, onError) => {
  return async (userInput, flowState) => {
    const { step, fullname, email, password } = flowState;

    switch (step) {
      case 'init':
        return {
          response: 'Let\'s create your account. Please tell me your full name.',
          flowState: { ...flowState, step: 'collect-fullname' },
          requiresInput: true,
        };

      case 'collect-fullname': {
        const extractedName = commandParser.extractEntityValue(userInput, 'fullname');

        if (!validateFullName(extractedName)) {
          return {
            response: 'I need a valid name with at least two characters. Please tell me your full name again.',
            flowState: {
              ...flowState,
              tempFullname: undefined
            },
            requiresInput: true,
          };
        }

        return {
          response: `I heard your name as ${extractedName}. Say correct to confirm, or repeat to say it again.`,
          flowState: {
            ...flowState,
            step: 'confirm-fullname',
            tempFullname: extractedName
          },
          requiresInput: true,
        };
      }

      case 'confirm-fullname': {
        const confirmation = normalizeConfirmation(userInput);

        if (confirmation === 'confirm') {
          return {
            response: 'Great! Now, please tell me your email address.',
            flowState: {
              ...flowState,
              step: 'collect-email',
              fullname: flowState.tempFullname
            },
            requiresInput: true,
          };
        } else if (confirmation === 'repeat') {
          return {
            response: 'No problem. Please tell me your full name again.',
            flowState: { ...flowState, step: 'collect-fullname' },
            requiresInput: true,
          };
        } else if (confirmation === 'unknown') {
          return {
            response: 'I did not understand. Please say correct to confirm, or repeat to say your name again.',
            flowState,
            requiresInput: true,
          };
        } else {
          return {
            response: 'Please say correct to confirm, or repeat to say your name again.',
            flowState,
            requiresInput: true,
          };
        }
      }

      case 'collect-email': {
        const extractedEmail = commandParser.extractEntityValue(userInput, 'email');

        if (!validateEmail(extractedEmail)) {
          return {
            response: 'That doesn\'t sound like a valid email address. Please say your email again, like john at example dot com.',
            flowState: {
              ...flowState,
              tempEmail: undefined
            },
            requiresInput: true,
          };
        }

        return {
          response: `I heard ${extractedEmail}. Say correct to confirm, or repeat to say it again.`,
          flowState: {
            ...flowState,
            step: 'confirm-email',
            tempEmail: extractedEmail
          },
          requiresInput: true,
        };
      }

      case 'confirm-email': {
        const confirmation = normalizeConfirmation(userInput);

        if (confirmation === 'confirm') {
          return {
            response: 'Perfect! Now, please tell me your password. It must be at least 6 characters.',
            flowState: {
              ...flowState,
              step: 'collect-password',
              email: flowState.tempEmail
            },
            requiresInput: true,
          };
        } else if (confirmation === 'repeat') {
          return {
            response: 'No problem. Please say your email address again.',
            flowState: { ...flowState, step: 'collect-email' },
            requiresInput: true,
          };
        } else if (confirmation === 'unknown') {
          return {
            response: 'I did not understand. Please say correct to confirm, or repeat to say your email again.',
            flowState,
            requiresInput: true,
          };
        } else {
          return {
            response: 'Please say correct to confirm, or repeat to say your email again.',
            flowState,
            requiresInput: true,
          };
        }
      }

      case 'collect-password': {
        const extractedPassword = commandParser.extractEntityValue(userInput, 'password');

        if (!validatePassword(extractedPassword)) {
          return {
            response: 'Password must be at least 6 characters long. Please say your password again.',
            flowState: {
              ...flowState,
              tempPassword: undefined
            },
            requiresInput: true,
          };
        }

        return {
          response: 'Password received. Say correct to confirm, or repeat to say it again.',
          flowState: {
            ...flowState,
            step: 'confirm-password',
            tempPassword: extractedPassword
          },
          requiresInput: true,
        };
      }

      case 'confirm-password': {
        const confirmation = normalizeConfirmation(userInput);

        if (confirmation === 'confirm') {
          return {
            response: `Creating account for ${flowState.email}. Please wait.`,
            flowState: {
              ...flowState,
              step: 'submit',
              password: flowState.tempPassword
            },
            requiresInput: false,
          };
        } else if (confirmation === 'repeat') {
          return {
            response: 'No problem. Please say your password again.',
            flowState: { ...flowState, step: 'collect-password' },
            requiresInput: true,
          };
        } else if (confirmation === 'unknown') {
          return {
            response: 'I did not understand. Please say correct to confirm, or repeat to say your password again.',
            flowState,
            requiresInput: true,
          };
        } else {
          return {
            response: 'Please say correct to confirm, or repeat to say your password again.',
            flowState,
            requiresInput: true,
          };
        }
      }

      case 'submit': {
        try {
          const response = await api.post('/user/signup', {
            fullname: flowState.fullname,
            email: flowState.email,
            password: flowState.password,
          });

          if (response.data && response.data.user) {
            onSuccess(response.data);
            return {
              response: `Account created successfully! Welcome, ${flowState.fullname}. You are now logged in. Say browse books to continue.`,
              completed: true,
              requiresInput: false,
              success: true,
            };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create account';

          if (errorMessage.includes('already exists')) {
            onError(errorMessage);
            return {
              response: `This email already exists. Would you like to log in instead? Say log in to continue.`,
              completed: true,
              requiresInput: false,
              error: errorMessage,
            };
          }

          onError(errorMessage);
          return {
            response: `Sorry, ${errorMessage}. Please try again by saying sign up.`,
            completed: true,
            requiresInput: false,
            error: errorMessage,
          };
        }
      }

      default:
        return {
          response: 'Something went wrong. Please say sign up to start over.',
          completed: true,
          requiresInput: false,
        };
    }
  };
};

export const createLoginFlow = (onSuccess, onError) => {
  return async (userInput, flowState) => {
    const { step, email, password } = flowState;

    switch (step) {
      case 'init':
        return {
          response: 'Let\'s log you in. Please tell me your email address.',
          flowState: { ...flowState, step: 'collect-email' },
          requiresInput: true,
        };

      case 'collect-email': {
        const extractedEmail = commandParser.extractEntityValue(userInput, 'email');

        if (!validateEmail(extractedEmail)) {
          return {
            response: 'That doesn\'t sound like a valid email address. Please say your email again.',
            flowState: {
              ...flowState,
              tempEmail: undefined
            },
            requiresInput: true,
          };
        }

        return {
          response: `I heard ${extractedEmail}. Say correct to confirm, or repeat to say it again.`,
          flowState: {
            ...flowState,
            step: 'confirm-email',
            tempEmail: extractedEmail
          },
          requiresInput: true,
        };
      }

      case 'confirm-email': {
        const confirmation = normalizeConfirmation(userInput);

        if (confirmation === 'confirm') {
          return {
            response: 'Great! Now, please tell me your password.',
            flowState: {
              ...flowState,
              step: 'collect-password',
              email: flowState.tempEmail
            },
            requiresInput: true,
          };
        } else if (confirmation === 'repeat') {
          return {
            response: 'No problem. Please say your email address again.',
            flowState: { ...flowState, step: 'collect-email' },
            requiresInput: true,
          };
        } else if (confirmation === 'unknown') {
          return {
            response: 'I did not understand. Please say correct to confirm, or repeat to say your email again.',
            flowState,
            requiresInput: true,
          };
        } else {
          return {
            response: 'Please say correct to confirm, or repeat to say your email again.',
            flowState,
            requiresInput: true,
          };
        }
      }

      case 'collect-password': {
        const extractedPassword = commandParser.extractEntityValue(userInput, 'password');

        if (!validatePassword(extractedPassword)) {
          return {
            response: 'Password must be at least 6 characters long. Please say your password again.',
            flowState: {
              ...flowState,
              tempPassword: undefined
            },
            requiresInput: true,
          };
        }

        return {
          response: 'Password received. Say correct to confirm, or repeat to say it again.',
          flowState: {
            ...flowState,
            step: 'confirm-password',
            tempPassword: extractedPassword
          },
          requiresInput: true,
        };
      }

      case 'confirm-password': {
        const confirmation = normalizeConfirmation(userInput);

        if (confirmation === 'confirm') {
          return {
            response: `Logging in with ${flowState.email}. Please wait.`,
            flowState: {
              ...flowState,
              step: 'submit',
              password: flowState.tempPassword
            },
            requiresInput: false,
          };
        } else if (confirmation === 'repeat') {
          return {
            response: 'No problem. Please say your password again.',
            flowState: { ...flowState, step: 'collect-password' },
            requiresInput: true,
          };
        } else if (confirmation === 'unknown') {
          return {
            response: 'I did not understand. Please say correct to confirm, or repeat to say your password again.',
            flowState,
            requiresInput: true,
          };
        } else {
          return {
            response: 'Please say correct to confirm, or repeat to say your password again.',
            flowState,
            requiresInput: true,
          };
        }
      }

      case 'submit': {
        try {
          const response = await api.post('/user/login', {
            email: flowState.email,
            password: flowState.password,
          });

          if (response.data && response.data.user) {
            onSuccess(response.data);
            return {
              response: `Login successful! Welcome back, ${response.data.user.fullname}. Say browse books to continue.`,
              completed: true,
              requiresInput: false,
              success: true,
            };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          onError(errorMessage);

          return {
            response: `Sorry, ${errorMessage}. Please try again by saying log in, or say sign up to create a new account.`,
            completed: true,
            requiresInput: false,
            error: errorMessage,
          };
        }
      }

      default:
        return {
          response: 'Something went wrong. Please say log in to start over.',
          completed: true,
          requiresInput: false,
        };
    }
  };
};
