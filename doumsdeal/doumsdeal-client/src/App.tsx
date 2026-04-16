import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import AdDetail from './pages/AdDetail';
import Profile from './pages/Profile';
import EditAd from './pages/EditAd';
import AdminPanel from './pages/AdminPanel';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import NotFound from './pages/NotFound';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-ad" element={<CreateAd />} />
        <Route path="/ads/:id" element={<AdDetail />} />
        <Route path="/ads/:id/edit" element={<EditAd />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Conversation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;