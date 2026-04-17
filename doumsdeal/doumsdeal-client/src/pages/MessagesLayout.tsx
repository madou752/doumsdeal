import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useMatch } from 'react-router-dom';
import api from '../api/axiosConfig';
import { SERVER_URL } from '../utils/url';

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

export default function MessagesLayout() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const navigate = useNavigate();
    const match = useMatch('/messages/:id');
    const activeId = match?.params?.id;
    const userId = parseInt(localStorage.getItem('userId') ?? '0');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        api.get('/messages/conversations')
            .then(res => setConversations(res.data))
            .catch(() => navigate('/'));
    }, [navigate, activeId]);

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date().toLocaleDateString('fr-FR');
        return d.toLocaleDateString('fr-FR') === today
            ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="messages-layout">
            {/* Sidebar conversations */}
            <div className={`messages-sidebar${activeId ? ' messages-sidebar-hidden-mobile' : ''}`}>
                <div className="messages-sidebar-header">✉ Messages</div>
                {conversations.length === 0 ? (
                    <div className="messages-sidebar-empty">
                        <span style={{ fontSize: '36px' }}>✉</span>
                        <p>Aucune conversation</p>
                        <Link to="/"><button className="btn-primary" style={{ fontSize: '13px', padding: '7px 14px' }}>Parcourir les annonces</button></Link>
                    </div>
                ) : (
                    <div className="conversations-list-sidebar">
                        {conversations.map(conv => {
                            const other = conv.buyer.id === userId ? conv.seller : conv.buyer;
                            const last = conv.messages[0];
                            const hasUnread = last && !last.is_read && last.sender_id !== userId;
                            const isActive = String(conv.id) === activeId;
                            return (
                                <Link key={conv.id} to={`/messages/${conv.id}`} className={`conv-item${isActive ? ' conv-item-active' : ''}`}>
                                    <Avatar user={other} />
                                    <div className="conv-body">
                                        <div className="conv-header-row">
                                            <span className="conv-username">{other.username}</span>
                                            {last && <span className="conv-time">{formatTime(last.created_at)}</span>}
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

            {/* Zone principale */}
            <div className="messages-main">
                {activeId ? (
                    <Outlet />
                ) : (
                    <div className="messages-main-empty">
                        <span style={{ fontSize: '56px' }}>💬</span>
                        <p>Sélectionnez une conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
