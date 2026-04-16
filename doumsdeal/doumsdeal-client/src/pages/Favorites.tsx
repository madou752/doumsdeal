import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

interface Ad {
    id: number;
    title: string;
    price: number;
    image_url: string | null;
    status: string;
    users: { username: string; avatar_url: string | null };
}

export default function Favorites() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        api.get('/ads/favorites/me')
            .then(res => setAds(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [navigate]);

    const removeFavorite = async (adId: number) => {
        await api.post(`/ads/${adId}/favorite`);
        setAds(prev => prev.filter(a => a.id !== adId));
    };

    if (loading) return <div className="page" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;

    return (
        <div className="page">
            <h2 style={{ marginBottom: '20px' }}>Mes favoris</h2>
            {ads.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>♡</div>
                    <p>Vous n'avez pas encore de favoris.</p>
                    <Link to="/" style={{ marginTop: '12px', display: 'inline-block' }}>Parcourir les annonces</Link>
                </div>
            ) : (
                <div className="ads-grid">
                    {ads.map(ad => (
                        <div key={ad.id} className="ad-card" style={{ position: 'relative' }}>
                            <Link to={`/ads/${ad.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {ad.image_url ? (
                                    <div className="ad-card-img">
                                        <img src={`http://localhost:3000${ad.image_url}`} alt={ad.title}
                                            onError={e => {
                                                const p = (e.target as HTMLImageElement).parentElement;
                                                if (p) { p.className = 'ad-card-no-img'; p.innerHTML = '<span>Pas de photo</span>'; }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="ad-card-no-img"><span>Pas de photo</span></div>
                                )}
                                <div className="ad-card-body">
                                    <div className="ad-card-title">{ad.title}</div>
                                    <div className="ad-card-price">{Number(ad.price).toFixed(2)} €</div>
                                    <div className="ad-card-seller">
                                        <div className="avatar avatar-sm">
                                            {ad.users?.avatar_url
                                                ? <img src={`http://localhost:3000${ad.users.avatar_url}`} alt={ad.users.username} />
                                                : <span>{ad.users?.username?.[0]?.toUpperCase() ?? '?'}</span>
                                            }
                                        </div>
                                        <span>{ad.users?.username}</span>
                                    </div>
                                </div>
                            </Link>
                            <button
                                className="btn-favorite active"
                                style={{ position: 'absolute', top: '8px', right: '8px' }}
                                onClick={() => removeFavorite(ad.id)}
                                title="Retirer des favoris"
                            >♥</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
