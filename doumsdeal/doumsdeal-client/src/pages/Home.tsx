import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';

interface Ad {
    id: number;
    title: string;
    price: number;
    image_url: string;
    location?: string;
    status?: string;
    condition?: string;
    users: { username: string; avatar_url: string | null };
}

interface Category {
    id: number;
    name: string;
}

export default function Home() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        const params: Record<string, string> = { page: String(page) };
        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sort) params.sort = sort;

        api.get('/ads', { params })
            .then(res => setAds(res.data))
            .catch(err => console.error("Erreur lors du chargement des annonces", err));
    }, [search, category, minPrice, maxPrice, sort, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="page">
            <form onSubmit={handleSearch} className="filters-bar">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                    <option value="">Toutes les catégories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" placeholder="Prix min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
                <input type="number" placeholder="Prix max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                    <option value="">Trier par : date récente</option>
                    <option value="date_asc">Date ancienne</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                </select>
            </form>

            <div className="ads-grid">
                {ads.length > 0 ? (
                    ads.map((ad: Ad) => (
                        <Link key={ad.id} to={`/ads/${ad.id}`} className={`ad-card${ad.status === 'SOLD' ? ' ad-card-sold' : ''}`}>
                            {ad.image_url ? (
                                <div className="ad-card-img">
                                    <img
                                        src={`http://localhost:3000${ad.image_url}`}
                                        alt={ad.title}
                                        onError={e => {
                                            const parent = (e.target as HTMLImageElement).parentElement;
                                            if (parent) {
                                                parent.className = 'ad-card-no-img';
                                                parent.innerHTML = '<svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM8.25 9.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg><span>Pas de photo</span>';
                                            }
                                        }}
                                    />
                                    {ad.status === 'SOLD' && <div className="ad-card-sold-overlay">VENDU</div>}
                                </div>
                            ) : (
                                <div className="ad-card-no-img">
                                    {ad.status === 'SOLD' && <div className="ad-card-sold-overlay">VENDU</div>}
                                    <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM8.25 9.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                    </svg>
                                    <span>Pas de photo</span>
                                </div>
                            )}
                            <div className="ad-card-body">
                                <div className="ad-card-title">{ad.title}</div>
                                <div className="ad-card-price">
                                    {ad.status === 'SOLD'
                                        ? <span className="ad-card-sold-badge">Vendu</span>
                                        : <>{Number(ad.price).toFixed(2)} €</>
                                    }
                                </div>
                                {ad.location && <div className="ad-card-location">📍 {ad.location}</div>}
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
                    ))
                ) : (
                    <p>Aucune annonce pour le moment...</p>
                )}
            </div>

            <div className="pagination">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</button>
                <span>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={ads.length < 25}>Suivant</button>
            </div>
        </div>
    );
}