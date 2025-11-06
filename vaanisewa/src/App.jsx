import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DialogueProvider } from './context/DialogueContext';
import { CartProvider } from './context/CartContext';
import VoiceDashboard from './pages/VoiceDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <DialogueProvider>
          <Router>
            <Routes>
              <Route path="/" element={<VoiceDashboard />} />
            </Routes>
          </Router>
        </DialogueProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
