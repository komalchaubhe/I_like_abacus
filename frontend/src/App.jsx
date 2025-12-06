import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Formula from './pages/Formula';
import Classes from './pages/Classes';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/formula" element={<Formula />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:classNum" element={<Classes />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

