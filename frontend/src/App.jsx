import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Incidents from './pages/incidents/Incidents';
import Incident from './pages/incidents/Incident';
import WarRoom from './pages/warroom/WarRoom';
import Status from './pages/status/Status';
import Footer from './components/Footer';

const PrivateRoute = ({ children }) => {
  // Mock authentication for hackathon
  const isAuthenticated = true; 
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background text-slate-200 overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-auto bg-[#0B1120] relative flex flex-col">
        {/* Subtle background glow effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none z-0" />
        <div className="flex-1 z-10 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/status" element={<Status />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
        <Route path="/incidents" element={<PrivateRoute><AppLayout><Incidents /></AppLayout></PrivateRoute>} />
        <Route path="/incidents/:id" element={<PrivateRoute><AppLayout><Incident /></AppLayout></PrivateRoute>} />
        <Route path="/warroom/:id" element={<PrivateRoute><AppLayout><WarRoom /></AppLayout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;