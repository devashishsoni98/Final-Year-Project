import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DialogueProvider } from './context/DialogueContext';
import VoiceDashboard from './pages/VoiceDashboard';

function App() {
  return (
    <AuthProvider>
      <DialogueProvider>
        <Router>
          <Routes>
            <Route path="/" element={<VoiceDashboard />} />
          </Routes>
        </Router>
      </DialogueProvider>
    </AuthProvider>
  );
}

export default App;
