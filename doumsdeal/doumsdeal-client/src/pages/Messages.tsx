import { useEffect, useState } from 'react';
import { SERVER_URL } from '../utils/url';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

interface LastMessage {
    content: string;
    created_at: string;
    sender_id: number;
    is_read: boolean;
}

interface Conversation {
    id: number;
    buyer: { id: number; username: string; avatar_url: string | null };
    seller: { id: number; username: string; avatar_url: string | null };
    ads: { id: number; title: string; image_url: string | null };
    messages: LastMessage[];
}

function Avatar({ user }: { user: { username: string; avatar_url: string | null } }) {
    return (
        <div className="avatar avatar-sm">
            {user.avatar_url
                ? <img src={`${SERVER_URL}${user.avatar_url}`} alt={user.username} />
                : <span>{user.username[0].toUpperCase()}</span>
            }
        </div>
    );
}

export default function Messages() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = parseInt(localStorage.getItem('userId') ?? '0');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        api.get('/messages/conversations')
            .then(res => setConversations(res.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return <div className="page" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;

    return (
        <div className="page">
            <h2 className="messages-title">✉ Mes messages</h2>
            {conversations.length === 0 ? (
                <div className="messages-empty">
                    <p>✉</p>
                    <p>Aucune conversation pour l'instant.</p>
                    <Link to="/"><button className="btn-primary">Parcourir les annonces</button></Link>
                </div>
            ) : (
                <div className="conversations-list">
                    {conversations.map(conv => {
                        const other = conv.buyer.id === userId ? conv.seller : conv.buyer;
                        const last = conv.messages[0];
                        const hasUnread = last && !last.is_read && last.sender_id !== userId;
                        return (
                            <Link key={conv.id} to={`/messages/${conv.id}`} className="conv-item">
                                <Avatar user={other} />
                                <div className="conv-body">
                                    <div className="conv-header-row">
                                        <span className="conv-username">{other.username}</span>
                                        {last && <span className="conv-time">
                                            {new Date(last.created_at).toLocaleDateString('fr-FR') === new Date().toLocaleDateString('fr-FR')
                                                ? new Date(last.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                                : new Date(last.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                                            }
                                        </span>}
                                    </div>
                                    <div className="conv-ad-title">📦 {conv.ads.title}</div>
                                    {last && (
                                        <div className={`conv-preview ${hasUnread ? 'conv-preview-unread' : ''}`}>
                                            {last.sender_id === userId ? 'Vous : ' : ''}{last.content}
                                        </div>
                                    )}
                                </div>
                                {hasUnread && <span className="conv-badge">1</span>}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
