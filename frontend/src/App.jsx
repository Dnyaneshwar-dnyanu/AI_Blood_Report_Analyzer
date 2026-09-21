import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UploadPage from './pages/UploadPage';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </div>
        <Footer />
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      </div>
    </BrowserRouter>
  );
}

export default App;
