import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { SERVER_URL } from '../utils/url';

interface Ad {
    id: number;
    title: string;
    description: string;
    price: number;
    is_negotiable: boolean;
    condition: string;
    image_url: string | null;
    location: string | null;
    views_count: number;
    status: string;
    created_at: string;
    user_id: number;
    users: { username: string; avatar_url: string | null };
    categories: { name: string };
}

const CONDITION_LABELS: Record<string, string> = {
    NEW: 'Neuf',
    LIKE_NEW: 'Comme neuf',
    GOOD: 'Bon état',
    FAIR: 'État correct',
};

const STATUS_LABELS: Record<string, string> = {
    AVAILABLE: 'Disponible',
    SOLD: 'Vendu',
};

export default function AdDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState<Ad | null>(null);
    const [error, setError] = useState('');
    const [favorited, setFavorited] = useState(false);

    const token = localStorage.getItem('token');
    const currentUsername = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    useEffect(() => {
        api.get(`/ads/${id}`)
            .then(res => setAd(res.data))
            .catch(() => setError('Annonce introuvable.'));

        if (token) {
            api.get(`/ads/${id}/favorite`)
                .then(res => setFavorited(res.data.favorited))
                .catch(() => {});
        }
    }, [id, token]);

    const handleDelete = async () => {
        if (!window.confirm('Supprimer cette annonce ?')) return;
        try {
            await api.delete(`/ads/${id}`);
            navigate('/');
        } catch {
            alert('Erreur lors de la suppression.');
        }
    };

    const handleFavorite = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            const res = await api.post(`/ads/${id}/favorite`);
            setFavorited(res.data.favorited);
        } catch {
            alert('Erreur favoris.');
        }
    };

    const handleContact = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            const res = await api.post('/messages/conversations', { ad_id: parseInt(id!) });
            navigate(`/messages/${res.data.id}`);
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Erreur');
        }
    };

    if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
    if (!ad) return <div className="page" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;

    const isOwner = !!token && currentUsername === ad.users.username;
    const canEdit = isOwner;
    const canDelete = isOwner || isAdmin;

    return (
        <div className="ad-detail">
            {ad.image_url ? (
                <img src={`${SERVER_URL}${ad.image_url}`} alt={ad.title} />
            ) : (
                <div className="ad-detail-no-img">
                    <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                        <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM8.25 9.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                    </svg>
                    <span>Pas de photo disponible</span>
                </div>
            )}
            <div className="ad-detail-header">
                <h2>{ad.title}</h2>
                <button
                    className={`btn-favorite${favorited ? ' active' : ''}`}
                    onClick={handleFavorite}
                    title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    {favorited ? '♥' : '♡'} {favorited ? 'Favori' : 'Favoris'}
                </button>
            </div>
            <div className="ad-detail-price">
                {Number(ad.price).toFixed(2)} €
                {ad.is_negotiable && <span style={{ fontSize: '14px', fontWeight: 400, marginLeft: '8px', color: 'var(--text-muted)' }}>(négociable)</span>}
            </div>
            <div className="ad-detail-meta">
                <span className={`badge ${ad.status === 'AVAILABLE' ? 'badge-available' : 'badge-sold'}`}>
                    {STATUS_LABELS[ad.status] ?? ad.status}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Catégorie : <strong>{ad.categories.name}</strong></span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>État : <strong>{CONDITION_LABELS[ad.condition] ?? ad.condition}</strong></span>
                {ad.location && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📍 {ad.location}</span>}
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>👁 {ad.views_count ?? 0} vue{(ad.views_count ?? 0) > 1 ? 's' : ''}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Publié le {new Date(ad.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="ad-detail-seller">
                <div className="avatar">
                    {ad.users.avatar_url
                        ? <img src={`${SERVER_URL}${ad.users.avatar_url}`} alt={ad.users.username} />
                        : <span>{ad.users.username[0].toUpperCase()}</span>
                    }
                </div>
                <div>
                    <div style={{ fontWeight: 600 }}>{ad.users.username}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Vendeur</div>
                </div>
            </div>
            <div className="ad-detail-desc">{ad.description}</div>
            <div className="ad-detail-actions">
                {canEdit && <button onClick={() => navigate(`/ads/${id}/edit`)}>Modifier</button>}
                {canDelete && <button className="btn-danger" onClick={handleDelete}>Supprimer</button>}
                {token && !isOwner && (
                    <button className="btn-primary" onClick={handleContact}>✉ Contacter le vendeur</button>
                )}
            </div>
        </div>
    );
}
