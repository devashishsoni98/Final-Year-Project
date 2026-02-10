import { useEffect, useState } from "react";
import { useDialogue } from "../context/DialogueContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRef } from "react";
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
import { stopSpeech } from "../utils/speechControl";

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import BrowseScreen from "../screens/BrowseScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import CartScreen from "../screens/CartScreen";
import OrdersScreen from "../screens/OrdersScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import { useOrders } from "../context/OrdersContext";

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

  const [screen, setScreen] = useState("home");

  const { addOrder } = useOrders();

  const { user, login, logout } = useAuth();
  const cartContext = useCart();
  // const [isInitialized, setIsInitialized] = useState(false);

  const hasWelcomedRef = useRef(false);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentlyReading, setCurrentlyReading] = useState(null);
  // const [iframeUrl, setIframeUrl] = useState("http://localhost:5174");

  useEffect(() => {
    const unlockAudio = () => {
      tts.unlockAudio();

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  useEffect(() => {
    const unlock = () => {
      tts.unlockAudio();
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);

    return () => window.removeEventListener("click", unlock);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        stopSpeech();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    tts.setSpeechRecognitionService(speechRecognition);
  }, []);

  useEffect(() => {
    const signupFlow = createSignupFlow(
      (data) => {
        if (data.user) {
          login(data.user, "voice-auth-token");
          // setScreen("home");
          window.location.reload();
        }
      },
      (error) => {
        console.error("Signup error:", error);
      },
    );

    const loginFlow = createLoginFlow(
      (data) => {
        if (data.user) {
          login(data.user, "voice-auth-token");
          // setScreen("home");
          window.location.reload();
        }
      },
      (error) => {
        console.error("Login error:", error);
      },
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
      setScreen("checkout");
      if (user && user._id) {
        const freshSummary = cartContext.getCartSummary();
        console.debug(
          "handleCheckout invoked from cartFlow — freshSummary:",
          freshSummary,
        );
        const startResult = dialogueManager.startCheckout(
          freshSummary.items,
          freshSummary.total,
          user._id,
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
      handleCancel,
    );
    dialogueManager.registerFlow("cart", cartFlow);

    // const currentUser = JSON.parse(localStorage.getItem("user"));
    const handlePaymentSuccess = (orderData) => {
      const freshUser = JSON.parse(localStorage.getItem("user"));

      if (!freshUser || !freshUser._id) return;

      addOrder(freshUser._id, {
        id: Date.now(),
        items: orderData.items,
        total: orderData.total,
        date: new Date().toISOString(),
      });

      cartContext.clearCart();

      const msg =
        "Payment successful. Your order has been placed. Say view orders to hear your purchases or browse books to continue shopping.";

      addSystemMessage(msg);
      setScreen("home");
    };

    const checkoutFlow = createCheckoutFlow(
      cartContext,
      handlePaymentSuccess,
      handleCancel,
    );

    dialogueManager.registerFlow("checkout", checkoutFlow);

    try {
      window._dm = dialogueManager;
      window._cart = cartContext;
      console.debug("Exposed window._dm and window._cart for debugging");
    } catch (e) {}
  }, [login, cartContext, user, addSystemMessage]);

  useEffect(() => {
    if (hasWelcomedRef.current) return;

    hasWelcomedRef.current = true;

    const welcomeMessage = user
      ? `Welcome back, ${user.fullname}. Say browse books, view cart, or view orders.`
      : "Welcome to Vaani Sewa. Say browse books to see available titles, or sign up to create an account.";

    addSystemMessage(welcomeMessage);

    // slight delay only for UX smoothness
    setTimeout(() => {
      tts.speak(welcomeMessage);
    }, 300);
  }, [user]);

  const handleCommand = async (command) => {
    // 🔥 GLOBAL LOGOUT (full reset)
    if (/\b(log\s*out|logout|sign\s*out|signout)\b/i.test(command)) {
      // 1. clear auth
      logout();
      setScreen("home");

      // 2. stop any active dialogue flow
      dialogueManager.endFlow();

      // 3. reset UI states
      setCurrentBooks([]);
      setCurrentPage(1);
      setCurrentlyReading(null);
      // setIframeUrl(getStoreUrl());

      // 4. reset initialization so welcome runs again
      // setIsInitialized(false);

      // 5. speak fresh welcome like app start
      const msg =
        "You have been logged out. Welcome to Vaani Sewa. Say sign up, log in, or browse books to continue.";

      addSystemMessage(msg);

      setIsSpeaking(true);
      try {
        await tts.speak(msg);
      } finally {
        setIsSpeaking(false);
      }

      return;
    }

    try {
      // if (user && /\b(log\s*out|logout|sign\s*out|signout)\b/i.test(command)) {
      //   const logoutMsg = `Goodbye, ${user.fullname}. You have been logged out.`;
      //   addSystemMessage(logoutMsg);
      //   setIsSpeaking(true);
      //   try {
      //     await tts.speak(logoutMsg);
      //   } catch (error) {
      //     // console.error("TTS error:", error);
      //   } finally {
      //     setIsSpeaking(false);
      //   }
      //   logout();
      //   setIsInitialized(false);
      //   setCurrentBooks([]);
      //   setCurrentPage(1);
      //   return;
      // }

      const intent = commandParser.matchIntent(command);
      // Screen routing for auth flows
      if (intent === "login") setScreen("login");
      if (intent === "signup") setScreen("signup");

      // if (intent === "viewOrders") {
      //   if (!user || !user._id) {
      //     addSystemMessage("Please log in to view orders.");
      //     try {
      //       await tts.speak("Please log in to view orders.");
      //     } catch {}

      //     return;
      //   }
      //   const msg = "Showing your order history.";
      //   addSystemMessage(msg);
      //   // setIframeUrl(getOrdersUrl());
      //   await tts.speak(msg);
      //   return;
      // }

      if (
        intent === "viewOrders" ||
        /\b(order|orders|order history|my orders|view order|view orders)\b/i.test(
          command,
        )
      ) {
        if (!user || !user._id) {
          const msg = "Please log in to view orders.";
          addSystemMessage(msg);
          await tts.speak(msg);
          return;
        }

        // const orders = JSON.parse(
        //   localStorage.getItem(`vaanisewa_orders_${user._id}`) || "[]",
        // );

        const all = JSON.parse(
          localStorage.getItem("vaanisewa_orders") || "{}",
        );
        const orders = all[user._id] || [];

        if (orders.length === 0) {
          const msg = "You have no past orders.";
          addSystemMessage(msg);
          await tts.speak(msg);
          return;
        }

        setScreen("orders");

        // 🔥 SPEAK orders summary
        const summary = orders
          .map((o, i) => {
            return `Order ${i + 1}, ${o.items.length} items, total ${o.total} rupees.`;
          })
          .join(" ");

        const msg = `You have ${orders.length} orders. ${summary}`;

        addSystemMessage(msg);
        await tts.speak(msg);

        return;
      }

      if (intent === "viewCart") {
        setScreen("cart");
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
        // setIframeUrl(getCartUrl());
      } else if (!dialogueManager.isInFlow()) {
        if (intent === "browse") {
          dialogueManager.startFlow("browse-books");
          setScreen("browse");
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
          setScreen("details");
          dialogueManager.startFlow("product-details", {
            ...flowState,
            step: "init",
          });
        }
      }

      const result = await dialogueManager.processInput(command, { user });

      if (result.action === "start-browse") {
        dialogueManager.startFlow("browse-books");

        // auto trigger first browse step
        const browseResult = await dialogueManager.processInput("browse books");

        if (browseResult.response) {
          addSystemMessage(browseResult.response);
          await tts.speak(browseResult.response);
        }
      }

      // ⭐ START CHECKOUT FLOW
      if (result.action === "checkout") {
        setScreen("checkout");

        dialogueManager.startFlow("checkout", {
          step: "init",
        });

        const checkoutResult = await dialogueManager.processInput("start");

        if (checkoutResult.response) {
          addSystemMessage(checkoutResult.response);
          await tts.speak(checkoutResult.response);
        }

        return;
      }

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

        // if (result.iframeNavigation) {
        //   setIframeUrl(result.iframeNavigation);
        // }

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
            // console.error("TTS error:", error);
          } finally {
            setIsSpeaking(false);
          }
        }
      }
    } catch (error) {
      console.warn("Command handling error:", error);
    }
  };

  const startListening = () => {
    if (!speechRecognition.isSupported()) {
      const errorMsg =
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.";
      addSystemMessage(errorMsg);
      // tts.speak(errorMsg);
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
          // tts.speak(errorMsg);
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

  const hasUnlockedAudio = useRef(false);
  const handleToggle = () => {
    // 🔥 unlock audio once
    if (!hasUnlockedAudio.current) {
      tts.unlockAudio();
      hasUnlockedAudio.current = true;
    }

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
      // await tts.speak(errorMsg);
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
          { user },
        );

        if (verifyResult.response) {
          addSystemMessage(verifyResult.response);
          setIsSpeaking(true);
          try {
            await tts.speak(verifyResult.response);
          } catch (error) {
            // console.error("TTS error:", error);
          } finally {
            setIsSpeaking(false);
          }
        }

        if (verifyResult.action === "payment-success") {
          // setIframeUrl(getStoreUrl());
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
          // setIframeUrl(getCartUrl());
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    // <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
    //   <header className="bg-white shadow-sm border-b border-slate-200">
    //     <div className="max-w-7xl mx-auto px-6 py-4">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <h1 className="text-3xl font-bold text-slate-800">
    //             {import.meta.env.VITE_APP_NAME}
    //           </h1>
    //           <p className="text-sm text-slate-500 mt-0.5">
    //             Voice-Enabled Portal
    //           </p>
    //         </div>
    //         {user && (
    //           <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
    //             <p className="text-sm text-emerald-700 font-medium">
    //               {user.fullname}
    //             </p>
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   </header>

    //   <div className="h-[calc(100vh-72px)] px-6 py-6">
    //     {/* CENTERED CONTAINER (makes it premium looking) */}
    //     <div className="max-w-7xl mx-auto h-full">
    //       <div className="grid grid-cols-12 gap-6 h-full">
    //         {/* ================= LEFT PANEL ================= */}
    //         <div className="col-span-4 flex flex-col gap-6 min-h-0">
    //           {/* Conversation (takes all free space) */}
    //           {/* <div className="bg-white rounded-2xl shadow-md border flex-1 min-h-0 overflow-y-auto p-4"> */}
    //             <VoiceConsole />
    //           {/* </div> */}

    //           {/* Quick commands (auto height) */}
    //           <div className="bg-white rounded-2xl shadow-md border p-4">
    //             <h3 className="font-semibold text-slate-700 mb-3">
    //               Quick Commands
    //             </h3>

    //             <ul className="text-sm text-slate-500 space-y-2">
    //               <li>• Browse books</li>
    //               <li>• Login / Signup</li>
    //               <li>• View cart</li>
    //               <li>• Checkout</li>
    //               <li>• View orders</li>
    //             </ul>
    //           </div>
    //         </div>

    //         {/* ================= RIGHT PANEL ================= */}
    //         <div className="col-span-8 bg-white rounded-2xl shadow-md border p-6 overflow-y-auto min-h-0">
    //           {screen === "home" && <HomeScreen user={user} />}
    //           {screen === "login" && <LoginScreen />}
    //           {screen === "signup" && <SignupScreen />}
    //           {screen === "browse" && <BrowseScreen />}
    //           {screen === "details" && (
    //             <BookDetailsScreen
    //               book={dialogueManager.getFlowState()?.selectedBook}
    //             />
    //           )}
    //           {screen === "cart" && <CartScreen />}
    //           {screen === "checkout" && <CheckoutScreen />}
    //           {screen === "orders" && <OrdersScreen />}
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   <footer className="bg-white border-t border-slate-200 mt-12">
    //     <div className="max-w-7xl mx-auto px-6 py-4 text-center">
    //       <p className="text-xs text-slate-500">
    //         Voice-controlled interface • Speak to interact
    //       </p>
    //     </div>
    //   </footer>

    //   {/* Floating Mic */}
    //   <div className="fixed bottom-16 right-14 z-50 flex items-center gap-3">
    //     <button
    //       onClick={stopSpeech}
    //       className="px-3 py-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-105 transition"
    //     >
    //       🔇
    //     </button>

    //     <VoiceToggleButton onToggle={handleToggle} />
    //   </div>
    // </div>

    <div className="h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-blue-100 text-slate-800 flex flex-col overflow-hidden">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-300 bg-slate-100/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">VaaniSewa</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Voice Enabled Portal
            </p>
          </div>

          {user && (
            <div className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-700">
                {user.fullname}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 py-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* ================= LEFT PANEL ================= */}
            <div className="lg:col-span-5 flex flex-col gap-6 min-h-0 h-full">
              {/* Console */}
              <div
                className="
            flex-1 min-h-0
            bg-slate-50
            border border-slate-300
            rounded-2xl
            shadow-sm
            p-4
            flex flex-col
          "
              >
                <VoiceConsole />
              </div>

              {/* Quick Commands */}
              <div
                className="
            bg-slate-50
            border border-slate-300
            rounded-2xl
            shadow-sm
            p-4
          "
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Quick Commands
                </p>

                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Browse books</li>
                  <li>• Login / Signup</li>
                  <li>• View cart</li>
                  <li>• Checkout</li>
                  <li>• View orders</li>
                </ul>
              </div>
            </div>

            {/* ================= RIGHT PANEL ================= */}
            <div
              className="
          lg:col-span-7
          bg-white/95
          border border-slate-300
          rounded-2xl
          shadow-sm
          p-8
          overflow-y-auto
          min-h-0
        "
            >
              {screen === "home" && <HomeScreen user={user} />}
              {screen === "login" && <LoginScreen />}
              {screen === "signup" && <SignupScreen />}
              {screen === "browse" && <BrowseScreen />}
              {screen === "details" && (
                <BookDetailsScreen
                  book={dialogueManager.getFlowState()?.selectedBook}
                />
              )}
              {screen === "cart" && <CartScreen />}
              {screen === "checkout" && <CheckoutScreen />}
              {screen === "orders" && <OrdersScreen />}
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-300 bg-slate-100 text-center py-3 text-xs text-slate-500">
        Voice Controlled Interface • Ready for Commands
      </footer>

      {/* ================= FLOATING MIC ================= */}
      <div className="fixed bottom-10 right-10 z-50 flex gap-3">
        <button
          onClick={stopSpeech}
          className="px-3 py-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-105 transition"
        >
          🔇
        </button>

        <VoiceToggleButton onToggle={handleToggle} />
      </div>
    </div>
  );
};

export default VoiceDashboard;
