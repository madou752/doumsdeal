import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Header() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const isAdmin = localStorage.getItem('role') === 'ADMIN';
    const username = localStorage.getItem('username');
    const avatarUrl = localStorage.getItem('avatarUrl');
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
                                        ? <img src={`http://localhost:3000${avatarUrl}`} alt={username ?? ''} />
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