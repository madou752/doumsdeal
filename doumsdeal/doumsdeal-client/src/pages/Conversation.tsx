import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { SERVER_URL } from '../utils/url';

interface Message {
    id: number;
    content: string;
    created_at: string;
    is_read: boolean;
    sender: { id: number; username: string; avatar_url: string | null };
}

interface ConvInfo {
    id: number;
    buyer_id: number;
    seller_id: number;
    ads: { id: number; title: string; image_url: string | null; price: number; status: string; user_id: number };
    buyer: { id: number; username: string };
    seller: { id: number; username: string };
}

type PayStep = 'idle' | 'form' | 'loading' | 'success';

export default function Conversation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conv, setConv] = useState<ConvInfo | null>(null);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [adStatus, setAdStatus] = useState<string>('AVAILABLE');
    const [closing, setClosing] = useState(false);
    const [payStep, setPayStep] = useState<PayStep>('idle');
    const [cardNum, setCardNum] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExp, setCardExp] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const userId = parseInt(localStorage.getItem('userId') ?? '0');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        api.get(`/messages/conversations/${id}`)
            .then(res => {
                setConv(res.data.conv);
                setMessages(res.data.messages);
                setAdStatus(res.data.conv.ads.status ?? 'AVAILABLE');
            })
            .catch(() => navigate('/messages'));
    }, [id, navigate]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || sending) return;
        setSending(true);
        try {
            const res = await api.post(`/messages/conversations/${id}`, { content });
            setMessages(prev => [...prev, res.data]);
            setContent('');
        } catch {
            alert('Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
    };

    const handleCloseAd = async () => {
        if (!conv || closing) return;
        if (!window.confirm('Confirmer la vente ? L\'annonce sera marquée comme vendue.')) return;
        setClosing(true);
        try {
            await api.patch(`/ads/${conv.ads.id}/close`);
            setAdStatus('SOLD');
        } catch {
            alert('Erreur lors de la clôture de l\'annonce');
        } finally {
            setClosing(false);
        }
    };

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayStep('loading');
        await new Promise(r => setTimeout(r, 2000));
        setPayStep('success');
    };

    const isSeller = conv ? userId === conv.seller_id : false;
    const isBuyer = conv ? userId === conv.buyer_id : false;
    const isSold = adStatus === 'SOLD';

    if (!conv) return <div className="page" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;

    return (
        <div className="conv-page">
            {/* Topbar */}
            <div className="conv-topbar">
                <Link to="/messages" className="conv-back">← Retour</Link>
                <Link to={`/ads/${conv.ads.id}`} className="conv-ad-link">
                    {conv.ads.image_url
                        ? <img src={`${SERVER_URL}${conv.ads.image_url}`} alt={conv.ads.title} />
                        : <div className="conv-ad-no-img">📦</div>
                    }
                    <div className="conv-ad-info">
                        <span className="conv-ad-title">{conv.ads.title}</span>
                        <span className="conv-ad-price">{Number(conv.ads.price).toFixed(2)} €</span>
                    </div>
                </Link>
                {isSold && <span className="conv-sold-badge">✅ Vendu</span>}
            </div>

            {/* Barre d'actions deal */}
            {!isSold && (
                <div className="deal-action-bar">
                    {isSeller && (
                        <button className="btn-deal-close" onClick={handleCloseAd} disabled={closing}>
                            {closing ? 'En cours...' : '✅ Conclure le deal'}
                        </button>
                    )}
                    {isBuyer && (
                        <button className="btn-deal-pay" onClick={() => setPayStep('form')}>
                            💳 Simuler le paiement
                        </button>
                    )}
                    <span className="deal-action-hint">
                        {isSeller ? 'Marquez l\'annonce comme vendue lorsque le deal est conclu.' : 'Procédez au paiement fictif pour simuler l\'achat.'}
                    </span>
                </div>
            )}
            {isSold && (
                <div className="deal-sold-banner">
                    🎉 Deal conclu ! Cette annonce a été vendue.
                </div>
            )}

            {/* Messages */}
            <div className="conv-messages">
                {messages.length === 0 && (
                    <div className="conv-no-messages">Envoyez le premier message !</div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender.id === userId;
                    return (
                        <div key={msg.id} className={`msg-bubble-wrap ${isMe ? 'msg-me' : 'msg-other'}`}>
                            {!isMe && (
                                <div className="avatar avatar-sm msg-avatar">
                                    {msg.sender.avatar_url
                                        ? <img src={`${SERVER_URL}${msg.sender.avatar_url}`} alt={msg.sender.username} />
                                        : <span>{msg.sender.username[0].toUpperCase()}</span>
                                    }
                                </div>
                            )}
                            <div className="msg-bubble">
                                <p>{msg.content}</p>
                                <span className="msg-time">
                                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    {' '}
                                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form className="conv-form" onSubmit={handleSend}>
                <input
                    type="text"
                    className="conv-input"
                    placeholder="Écrire un message..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={2000}
                    autoFocus
                />
                <button className="btn-primary" type="submit" disabled={sending || !content.trim()}>
                    Envoyer
                </button>
            </form>

            {/* Modal paiement fictif */}
            {payStep !== 'idle' && (
                <div className="pay-modal-overlay" onClick={payStep === 'form' ? () => setPayStep('idle') : undefined}>
                    <div className="pay-modal" onClick={e => e.stopPropagation()}>
                        {payStep === 'form' && (
                            <>
                                <div className="pay-modal-header">
                                    <span className="pay-modal-icon">💳</span>
                                    <h2>Paiement sécurisé</h2>
                                    <p className="pay-modal-sub">
                                        {conv.ads.title} — <strong>{Number(conv.ads.price).toFixed(2)} €</strong>
                                    </p>
                                </div>
                                <form className="pay-form" onSubmit={handlePaySubmit}>
                                    <div className="pay-field">
                                        <label>Numéro de carte</label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            value={cardNum}
                                            onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                            required
                                        />
                                    </div>
                                    <div className="pay-field">
                                        <label>Nom sur la carte</label>
                                        <input
                                            type="text"
                                            placeholder="Jean Dupont"
                                            value={cardName}
                                            onChange={e => setCardName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="pay-row">
                                        <div className="pay-field">
                                            <label>Date d'expiration</label>
                                            <input
                                                type="text"
                                                placeholder="MM/AA"
                                                maxLength={5}
                                                value={cardExp}
                                                onChange={e => setCardExp(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="pay-field">
                                            <label>CVV</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                maxLength={3}
                                                value={cardCvv}
                                                onChange={e => setCardCvv(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="pay-notice">
                                        🔒 Paiement simulé — aucune donnée réelle n'est traitée.
                                    </div>
                                    <div className="pay-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setPayStep('idle')}>Annuler</button>
                                        <button type="submit" className="btn-primary">Payer {Number(conv.ads.price).toFixed(2)} €</button>
                                    </div>
                                </form>
                            </>
                        )}
                        {payStep === 'loading' && (
                            <div className="pay-loading">
                                <div className="pay-spinner" />
                                <p>Traitement du paiement...</p>
                            </div>
                        )}
                        {payStep === 'success' && (
                            <div className="pay-success">
                                <div className="pay-checkmark">✓</div>
                                <h2>Paiement réussi !</h2>
                                <p>Votre paiement de <strong>{Number(conv.ads.price).toFixed(2)} €</strong> a été simulé avec succès.</p>
                                <p className="pay-success-sub">Contactez le vendeur pour organiser la remise.</p>
                                <button className="btn-primary" onClick={() => setPayStep('idle')}>Fermer</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
