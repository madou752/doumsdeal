import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { SERVER_URL } from '../utils/url';

export default function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'ADMIN');
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('avatarUrl'));

    useEffect(() => {
        const sync = () => {
            setIsLoggedIn(!!localStorage.getItem('token'));
            setIsAdmin(localStorage.getItem('role') === 'ADMIN');
            setUsername(localStorage.getItem('username'));
            setAvatarUrl(localStorage.getItem('avatarUrl'));
        };
        window.addEventListener('storage', sync);
        window.addEventListener('focus', sync);
        return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync); };
    }, []);
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        if (!isLoggedIn) return;
        api.get('/messages/unread-count')
            .then(res => setUnread(res.data.count))
            .catch(() => {});
        const interval = setInterval(() => {
            api.get('/messages/unread-count')
                .then(res => setUnread(res.data.count))
                .catch(() => {});
        }, 30000);
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('avatarUrl');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <header className="header">
            <Link to="/" className="header-logo">
                🎓 <span>DoumsDeal</span>
            </Link>
            <nav className="header-nav">
                {isLoggedIn ? (
                    <>
                        <Link to="/create-ad">
                            <button className="btn-success">+ Publier</button>
                        </Link>
                        <Link to="/favorites">
                            <button>♡ Favoris</button>
                        </Link>
                        <Link to="/messages">
                            <button className="header-msg-btn">
                                ✉ Messages
                                {unread > 0 && <span className="msg-badge">{unread}</span>}
                            </button>
                        </Link>
                        <Link to="/profile">
                            <button className="header-profile-btn">
                                <div className="avatar avatar-sm">
                                    {avatarUrl
                                        ? <img src={`${SERVER_URL}${avatarUrl}`} alt={username ?? ''} />
                                        : <span>{username?.[0]?.toUpperCase() ?? '?'}</span>
                                    }
                                </div>
                                {username}
                            </button>
                        </Link>
                        {isAdmin && (
                            <Link to="/admin">
                                <button>Admin</button>
                            </Link>
                        )}
                        <button className="btn-danger" onClick={handleLogout}>Déconnexion</button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button>Se connecter</button></Link>
                        <Link to="/register"><button className="btn-primary">S'inscrire</button></Link>
                    </>
                )}
            </nav>
        </header>
    );
}