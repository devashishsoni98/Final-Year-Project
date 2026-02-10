import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DialogueProvider } from "./context/DialogueContext";
import { CartProvider } from "./context/CartContext";
import VoiceDashboard from "./pages/VoiceDashboard";
import { OrdersProvider } from "./context/OrdersContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <DialogueProvider>
            <Router>
              <Routes>
                <Route path="/" element={<VoiceDashboard />} />
                <Route path="/book/:id" element={<VoiceDashboard />} />
              </Routes>
            </Router>
          </DialogueProvider>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
