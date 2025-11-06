import { useEffect, useState } from 'react';
import { useDialogue } from '../context/DialogueContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import VoiceToggleButton from '../components/VoiceToggleButton';
import VoiceConsole from '../components/VoiceConsole';
import BookResultsList from '../components/BookResultsList';
import tts from '../services/tts';
import speechRecognition from '../services/speechRecognition';
import dialogueManager from '../dialogue/DialogueManager';
import { createSignupFlow, createLoginFlow } from '../flows/AuthVoiceFlow';
import { createBrowseFlow } from '../flows/BrowseVoiceFlow';
import { createProductDetailsFlow } from '../flows/ProductDetailsFlow';
import { createCartFlow } from '../flows/CartFlow';
import { createCheckoutFlow } from '../flows/CheckoutFlow';
import { isDetailsCommand } from '../utils/voiceHelpers';
import commandParser from '../dialogue/CommandParser';

const VoiceDashboard = () => {
  const {
    isListening,
    setIsListening,
    setIsSpeaking,
    addUserMessage,
    addSystemMessage,
    addInterimMessage,
    removeInterimMessage,
  } = useDialogue();

  const { user, login, logout } = useAuth();
  const cartContext = useCart();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentlyReading, setCurrentlyReading] = useState(null);

  useEffect(() => {
    const signupFlow = createSignupFlow(
      (data) => {
        if (data.user) {
          login(data.user, 'voice-auth-token');
        }
      },
      (error) => {
        console.error('Signup error:', error);
      }
    );

    const loginFlow = createLoginFlow(
      (data) => {
        if (data.user) {
          login(data.user, 'voice-auth-token');
        }
      },
      (error) => {
        console.error('Login error:', error);
      }
    );

    const browseFlow = createBrowseFlow((data) => {
      console.log('Browse completed:', data);
    });

    const handleAddToCart = (book, qty) => {
      cartContext.addItem(book, qty || 1);
    };

    const productDetailsFlow = createProductDetailsFlow({
      onAddToCartViaContext: handleAddToCart,
      onBackToList: () => {
        console.log('Returning to list');
      }
    });

    dialogueManager.registerFlow('auth-signup', signupFlow);
    dialogueManager.registerFlow('auth-login', loginFlow);
    dialogueManager.registerFlow('browse-books', browseFlow);
    dialogueManager.registerFlow('product-details', productDetailsFlow);

    const handleCheckout = (summary) => {
      if (user && user._id) {
        dialogueManager.startCheckout(cartContext.items, cartContext.total, user._id);
      } else {
        addSystemMessage('Please log in to checkout.');
      }
    };

    const handleCancel = () => {
      dialogueManager.startFlow('browse-books');
    };

    const cartFlow = createCartFlow(
      cartContext,
      handleCheckout,
      handleCancel,
      handleCancel
    );
    dialogueManager.registerFlow('cart', cartFlow);

    const handlePaymentSuccess = (orderData) => {
      cartContext.clearCart();
      const msg = 'Order completed successfully!';
      addSystemMessage(msg);
      tts.speak(msg);
    };

    const checkoutFlow = createCheckoutFlow(
      cartContext,
      user?._id,
      user?.email,
      handlePaymentSuccess,
      handleCancel
    );
    dialogueManager.registerFlow('checkout', checkoutFlow);
  }, [login, cartContext, user, addSystemMessage]);

  useEffect(() => {
    if (!isInitialized) {
      let welcomeMessage;
      if (user) {
        welcomeMessage = `Welcome back, ${user.fullname}. Say browse books to see available titles, or help for more options.`;
      } else {
        welcomeMessage = 'Welcome to Vaani Sewa. Say sign up to create an account, log in to access your account, or browse books to see available titles.';
      }

      addSystemMessage(welcomeMessage);

      tts.speak(welcomeMessage).catch((error) => {
        console.error('TTS error:', error);
      });

      setIsInitialized(true);
    }
  }, [isInitialized, addSystemMessage, user]);

  const handleCommand = async (command) => {
    try {
      if (user && /\b(log\s*out|logout|sign\s*out|signout)\b/i.test(command)) {
        const logoutMsg = `Goodbye, ${user.fullname}. You have been logged out.`;
        addSystemMessage(logoutMsg);
        setIsSpeaking(true);
        try {
          await tts.speak(logoutMsg);
        } catch (error) {
          console.error('TTS error:', error);
        } finally {
          setIsSpeaking(false);
        }
        logout();
        setIsInitialized(false);
        setCurrentBooks([]);
        setCurrentPage(1);
        return;
      }

      const intent = commandParser.matchIntent(command);

      if (!dialogueManager.isInFlow()) {
        if (intent === 'browse') {
          dialogueManager.startFlow('browse-books');
        } else if (intent === 'viewCart') {
          dialogueManager.startFlow('cart', { step: 'init' });
        }
      }

      if (dialogueManager.getCurrentFlow() === 'browse-books') {
        const itemNumber = isDetailsCommand(command);
        if (itemNumber !== null) {
          const flowState = dialogueManager.getFlowState();
          dialogueManager.startFlow('product-details', {
            ...flowState,
            step: 'init',
          });
        }
      }

      const result = await dialogueManager.processInput(command, { user });

      if (result.action === 'open-razorpay') {
        await handleRazorpayPayment(result.razorpayData, result.orderId);
      } else {
        if (result.flowState) {
          if (result.flowState.paginationInfo) {
            setCurrentBooks(result.flowState.paginationInfo.books);
            setCurrentPage(result.flowState.paginationInfo.currentPage);
          }
          if (result.flowState.currentItemIndex) {
            setCurrentlyReading(result.flowState.currentItemIndex);
          }
        }

        if (result.action === 'back-to-list') {
          const flowState = dialogueManager.getFlowState();
          dialogueManager.startFlow('browse-books', flowState);
          setCurrentlyReading(null);
        }

        if (result.response) {
          addSystemMessage(result.response);
          setIsSpeaking(true);
          try {
            await tts.speak(result.response);
          } catch (error) {
            console.error('TTS error:', error);
          } finally {
            setIsSpeaking(false);
          }
        }
      }
    } catch (error) {
      console.error('Command handling error:', error);
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      addSystemMessage(errorMsg);
      await tts.speak(errorMsg);
    }
  };

  const startListening = () => {
    if (!speechRecognition.isSupported()) {
      const errorMsg = 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.';
      addSystemMessage(errorMsg);
      tts.speak(errorMsg);
      return;
    }

    speechRecognition.start({
      onResult: (result) => {
        if (result.isFinal) {
          removeInterimMessage();
          if (result.transcript) {
            addUserMessage(result.transcript);
            handleCommand(result.transcript);
          }
        } else if (result.interim) {
          addInterimMessage(result.interim);
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          const errorMsg = 'Microphone access denied. Please allow microphone access in your browser settings.';
          addSystemMessage(errorMsg);
          tts.speak(errorMsg);
          setIsListening(false);
        }
      },
      onEnd: () => {
        if (!speechRecognition.getIsListening()) {
          setIsListening(false);
        }
      },
    });

    setIsListening(true);
  };

  const stopListening = () => {
    speechRecognition.stop();
    removeInterimMessage();
    setIsListening(false);
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleRazorpayPayment = async (razorpayData, orderId) => {
    const msg = 'Opening payment window';
    addSystemMessage(msg);
    await tts.speak(msg);

    if (!window.Razorpay) {
      const errorMsg = 'Payment system not available';
      addSystemMessage(errorMsg);
      await tts.speak(errorMsg);
      return;
    }

    const options = {
      key: razorpayData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: razorpayData.orderId,
      amount: razorpayData.amount,
      currency: 'INR',
      name: 'VaaniSewa',
      handler: async (response) => {
        const processingMsg = 'Payment processing...';
        addSystemMessage(processingMsg);
        await tts.speak(processingMsg);

        dialogueManager.handlePaymentResponse('success', {
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          orderId: response.razorpay_order_id,
        });

        await dialogueManager.processInput('payment-complete', { user });

        const verifyResult = await dialogueManager.processInput('', { user });

        if (verifyResult.response) {
          addSystemMessage(verifyResult.response);
          await tts.speak(verifyResult.response);
        } else {
          const successMsg = 'Payment verified! Order confirmed.';
          addSystemMessage(successMsg);
          await tts.speak(successMsg);
        }
      },
      modal: {
        ondismiss: async () => {
          const cancelMsg = 'Payment cancelled';
          addSystemMessage(cancelMsg);
          await tts.speak(cancelMsg);
          dialogueManager.handlePaymentResponse('cancelled', {});
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-blue-400 mb-3">
          {import.meta.env.VITE_APP_NAME}
        </h1>
        <p className="text-xl text-slate-300">Voice-Enabled Book Service Interface</p>
        <p className="text-sm text-slate-400 mt-2">
          Powered by Web Speech API
        </p>
      </header>

      <main className="flex flex-col items-center gap-12 w-full">
        <div className="flex flex-col items-center gap-4">
          {user && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg px-6 py-3 mb-4">
              <p className="text-green-300 text-sm">
                Logged in as <strong>{user.fullname}</strong>
              </p>
            </div>
          )}

          <VoiceToggleButton onToggle={handleToggle} />
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div
              className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
              }`}
              aria-hidden="true"
            ></div>
            <span>
              {isListening ? 'Voice recognition active' : 'Voice recognition inactive'}
            </span>
          </div>
        </div>

        <VoiceConsole />

        {currentBooks.length > 0 && (
          <BookResultsList
            books={currentBooks}
            currentPage={currentPage}
            currentlyReading={currentlyReading}
            onBookSelect={(itemNumber) => {
              const command = `item ${itemNumber}`;
              addUserMessage(command);
              handleCommand(command);
            }}
          />
        )}

        <div className="bg-slate-800 rounded-lg p-6 max-w-2xl border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Available Commands</h3>
          <ul className="space-y-2 text-slate-300">
            {!user && (
              <>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span><strong>"Sign Up"</strong> - Create a new account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span><strong>"Log In"</strong> - Access your account</span>
                </li>
              </>
            )}
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Browse Books"</strong> - View available books</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Search for [topic]"</strong> - Find specific books</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Show [category]"</strong> - Filter by category</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Next/Previous"</strong> - Navigate pages</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Item [number]"</strong> - Hear book details</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Add to Cart"</strong> - Add current book to cart</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"View Cart"</strong> - See items in cart</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Checkout"</strong> - Purchase cart items</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Help"</strong> - Get information about commands</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Cancel"</strong> - Stop current action</span>
            </li>
            {user && (
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>"Log Out"</strong> - Sign out of your account</span>
              </li>
            )}
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>Press the microphone button to start or stop voice recognition</p>
        <p className="mt-1">Ensure your browser has microphone permissions enabled</p>
      </footer>
    </div>
  );
};

export default VoiceDashboard;
