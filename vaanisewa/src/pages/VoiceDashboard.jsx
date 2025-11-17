import { useEffect, useState } from "react";
import { useDialogue } from "../context/DialogueContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import VoiceToggleButton from "../components/VoiceToggleButton";
import VoiceConsole from "../components/VoiceConsole";
import BookResultsList from "../components/BookResultsList";
import tts from "../services/tts";
import speechRecognition from "../services/speechRecognition";
import dialogueManager from "../dialogue/DialogueManager";
import { createSignupFlow, createLoginFlow } from "../flows/AuthVoiceFlow";
import { createBrowseFlow } from "../flows/BrowseVoiceFlow";
import { createProductDetailsFlow } from "../flows/ProductDetailsFlow";
import { createCartFlow } from "../flows/CartFlow";
import { createCheckoutFlow } from "../flows/CheckoutFlow";
import { isDetailsCommand } from "../utils/voiceHelpers";
import commandParser from "../dialogue/CommandParser";
import { getOrdersUrl, getCartUrl, getPaymentUrl, getStoreUrl } from "../utils/iframeNavigation";

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
  const [iframeUrl, setIframeUrl] = useState("http://localhost:5173");

  useEffect(() => {
    tts.setSpeechRecognitionService(speechRecognition);
  }, []);

  useEffect(() => {
    const signupFlow = createSignupFlow(
      (data) => {
        if (data.user) {
          login(data.user, "voice-auth-token");
        }
      },
      (error) => {
        console.error("Signup error:", error);
      }
    );

    const loginFlow = createLoginFlow(
      (data) => {
        if (data.user) {
          login(data.user, "voice-auth-token");
        }
      },
      (error) => {
        console.error("Login error:", error);
      }
    );

    const browseFlow = createBrowseFlow((data) => {
      console.log("Browse completed:", data);
    });

    const handleAddToCart = (book, qty) => {
      cartContext.addItem(book, qty || 1);
    };

    const productDetailsFlow = createProductDetailsFlow({
      onAddToCartViaContext: handleAddToCart,
      onBackToList: () => {
        console.log("Returning to list");
      },
    });

    dialogueManager.registerFlow("auth-signup", signupFlow);
    dialogueManager.registerFlow("auth-login", loginFlow);
    dialogueManager.registerFlow("browse-books", browseFlow);
    dialogueManager.registerFlow("product-details", productDetailsFlow);

    const handleCheckout = (summary) => {
      if (user && user._id) {
        const freshSummary = cartContext.getCartSummary();
        console.debug(
          "handleCheckout invoked from cartFlow — freshSummary:",
          freshSummary
        );
        const startResult = dialogueManager.startCheckout(
          freshSummary.items,
          freshSummary.total,
          user._id
        );
        console.debug("dialogueManager.startCheckout result:", startResult);
      } else {
        addSystemMessage("Please log in to checkout.");
      }
    };

    const handleCancel = () => {
      dialogueManager.startFlow("browse-books");
    };

    const cartFlow = createCartFlow(
      cartContext,
      handleCheckout,
      handleCancel,
      handleCancel
    );
    dialogueManager.registerFlow("cart", cartFlow);

    const handlePaymentSuccess = (orderData) => {
      cartContext.clearCart();
      const msg = "Order completed successfully!";
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
    dialogueManager.registerFlow("checkout", checkoutFlow);

    try {
      window._dm = dialogueManager;
      window._cart = cartContext;
      console.debug("Exposed window._dm and window._cart for debugging");
    } catch (e) {
    }
  }, [login, cartContext, user, addSystemMessage]);

  useEffect(() => {
    if (!isInitialized) {
      let welcomeMessage;
      if (user) {
        welcomeMessage = `Welcome back, ${user.fullname}. Say browse books to see available titles, or help for more options.`;
      } else {
        welcomeMessage =
          "Welcome to Vaani Sewa. Say sign up to create an account, log in to access your account, or browse books to see available titles.";
      }

      addSystemMessage(welcomeMessage);

      tts.speak(welcomeMessage).catch((error) => {
        console.error("TTS error:", error);
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
          console.error("TTS error:", error);
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

      if (intent === "viewOrders") {
        if (!user || !user._id) {
          addSystemMessage("Please log in to view orders.");
          await tts.speak("Please log in to view orders.");
          return;
        }
        const msg = "Showing your order history.";
        addSystemMessage(msg);
        setIframeUrl(getOrdersUrl());
        await tts.speak(msg);
        return;
      }

      if (intent === "viewCart") {
        const currentFlow = dialogueManager.getCurrentFlow();
        if (
          currentFlow &&
          currentFlow !== "cart" &&
          currentFlow !== "checkout"
        ) {
          const flowState = dialogueManager.getFlowState();
          dialogueManager.endFlow();
          dialogueManager.startFlow("cart", {
            step: "init",
            returnFlow: currentFlow,
            returnState: flowState,
          });
        } else if (!currentFlow) {
          dialogueManager.startFlow("cart", { step: "init" });
        }
        setIframeUrl(getCartUrl());
      } else if (intent === "checkout") {
        const currentFlow = dialogueManager.getCurrentFlow();
        if (currentFlow !== "checkout") {
          if (!user || !user._id) {
            addSystemMessage("Please log in to checkout.");
            await tts.speak("Please log in to checkout.");
            return;
          }
          const summary = cartContext.getCartSummary();
          console.debug("Checkout requested — cart summary:", summary);
          console.debug(
            "DialogueManager currentFlow:",
            dialogueManager.getCurrentFlow()
          );
          if (summary.itemCount === 0) {
            addSystemMessage("Your cart is empty. Add items before checkout.");
            await tts.speak("Your cart is empty. Add items before checkout.");
            return;
          }
          console.debug("Starting checkout with items:", summary.items);
          dialogueManager.endFlow();
          dialogueManager.startCheckout(summary.items, summary.total, user._id);
          setIframeUrl(getPaymentUrl());
        }
      } else if (!dialogueManager.isInFlow()) {
        if (intent === "browse") {
          dialogueManager.startFlow("browse-books");
        }
      }

      if (
        dialogueManager.getCurrentFlow() === "browse-books" &&
        intent !== "viewCart" &&
        intent !== "checkout"
      ) {
        const itemNumber = isDetailsCommand(command);
        if (itemNumber !== null) {
          const flowState = dialogueManager.getFlowState();
          dialogueManager.startFlow("product-details", {
            ...flowState,
            step: "init",
          });
        }
      }

      const result = await dialogueManager.processInput(command, { user });

      if (result.action === "open-razorpay") {
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

        if (result.iframeNavigation) {
          setIframeUrl(result.iframeNavigation);
        }

        if (result.action === "back-to-list") {
          const flowState = dialogueManager.getFlowState();
          dialogueManager.startFlow("browse-books", flowState);
          setCurrentlyReading(null);
        }

        if (result.response) {
          addSystemMessage(result.response);
          setIsSpeaking(true);
          try {
            await tts.speak(result.response);
          } catch (error) {
            console.error("TTS error:", error);
          } finally {
            setIsSpeaking(false);
          }
        }
      }
    } catch (error) {
      console.error("Command handling error:", error);
      const errorMsg = "Sorry, I encountered an error. Please try again.";
      addSystemMessage(errorMsg);
      await tts.speak(errorMsg);
    }
  };

  const startListening = () => {
    if (!speechRecognition.isSupported()) {
      const errorMsg =
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.";
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
        console.error("Speech recognition error:", error);
        if (error === "not-allowed" || error === "service-not-allowed") {
          const errorMsg =
            "Microphone access denied. Please allow microphone access in your browser settings.";
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
    if (!window.Razorpay) {
      const errorMsg = "Payment system not available";
      addSystemMessage(errorMsg);
      await tts.speak(errorMsg);
      return;
    }

    const options = {
      key: razorpayData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: razorpayData.orderId,
      amount: razorpayData.amount,
      currency: "INR",
      name: "VaaniSewa",
      description: "Book Purchase",
      handler: async (response) => {
        const processingMsg = "Payment received. Verifying now.";
        addSystemMessage(processingMsg);
        setIsSpeaking(true);
        try {
          await tts.speak(processingMsg);
        } finally {
          setIsSpeaking(false);
        }

        const flowState = dialogueManager.getFlowState();
        dialogueManager.handlePaymentResponse("success", {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          razorpay_order_id: response.razorpay_order_id,
        });

        const verifyResult = await dialogueManager.processInput(
          "verify payment",
          { user }
        );

        if (verifyResult.response) {
          addSystemMessage(verifyResult.response);
          setIsSpeaking(true);
          try {
            await tts.speak(verifyResult.response);
          } catch (error) {
            console.error("TTS error:", error);
          } finally {
            setIsSpeaking(false);
          }
        }

        if (verifyResult.action === "payment-success") {
          setIframeUrl(getStoreUrl());
        }
      },
      modal: {
        ondismiss: async () => {
          const cancelMsg =
            "Payment window closed. Say retry to try again, or view cart to modify your order.";
          addSystemMessage(cancelMsg);
          setIsSpeaking(true);
          try {
            await tts.speak(cancelMsg);
          } finally {
            setIsSpeaking(false);
          }
          dialogueManager.handlePaymentResponse("cancelled", {});
          setIframeUrl(getCartUrl());
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {import.meta.env.VITE_APP_NAME}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Voice-Enabled Portal</p>
            </div>
            {user && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                <p className="text-sm text-emerald-700 font-medium">
                  {user.fullname}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col items-center space-y-4">
                <VoiceToggleButton onToggle={handleToggle} />
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isListening ? "bg-red-500 animate-pulse" : "bg-slate-300"
                    }`}
                  ></div>
                  <span className="font-medium">
                    {isListening ? "Listening" : "Inactive"}
                  </span>
                </div>
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Voice Commands
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!user && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-slate-700">Sign Up</span>
                        <p className="text-xs text-slate-500">Create account</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-slate-700">Log In</span>
                        <p className="text-xs text-slate-500">Access account</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <span className="font-medium text-slate-700">Browse Books</span>
                    <p className="text-xs text-slate-500">View catalog</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <span className="font-medium text-slate-700">Item [number]</span>
                    <p className="text-xs text-slate-500">Book details</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <span className="font-medium text-slate-700">Cart</span>
                    <p className="text-xs text-slate-500">View cart</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <span className="font-medium text-slate-700">Checkout</span>
                    <p className="text-xs text-slate-500">Complete purchase</p>
                  </div>
                </div>
                {user && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-slate-700">Log Out</span>
                      <p className="text-xs text-slate-500">Sign out</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-[480px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-[calc(100vh-12rem)] flex flex-col sticky top-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">BookStore Preview</h2>
                <span className="text-xs text-slate-500">Live</span>
              </div>
              <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <iframe
                  key={iframeUrl}
                  src={iframeUrl}
                  title="BookStore"
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Updates as you navigate
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center">
          <p className="text-xs text-slate-500">
            Voice-controlled interface • Speak to interact
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VoiceDashboard;
