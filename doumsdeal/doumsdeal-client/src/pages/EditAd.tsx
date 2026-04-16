import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

interface Category {
    id: number;
    name: string;
}

export default function EditAd() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [condition, setCondition] = useState('GOOD');
    const [status, setStatus] = useState('AVAILABLE');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [location, setLocation] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        api.get(`/ads/${id}`).then(res => {
            const ad = res.data;
            setTitle(ad.title);
            setPrice(String(ad.price));
            setDescription(ad.description);
            setCategoryId(String(ad.category_id));
            setCondition(ad.condition ?? 'GOOD');
            setStatus(ad.status ?? 'AVAILABLE');
            setIsNegotiable(ad.is_negotiable ?? false);
            setLocation(ad.location ?? '');
        }).catch(() => setError('Annonce introuvable.'));

        api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('category_id', categoryId);
        formData.append('condition', condition);
        formData.append('status', status);
        formData.append('is_negotiable', String(isNegotiable));
        if (location) formData.append('location', location);
        if (image) formData.append('image', image);

        try {
            await api.put(`/ads/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/ads/${id}`);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Erreur lors de la modification.');
        }
    };

    if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

    return (
        <div className="page">
            <h2 style={{ marginBottom: '20px' }}>Modifier l'annonce</h2>
            <form onSubmit={handleSubmit} className="ad-form">
                <div className="form-group">
                    <label>Titre</label>
                    <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Prix (€)</label>
                    <input type="number" placeholder="Prix" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Description" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Catégorie</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                        <option value="">-- Catégorie --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>État du produit</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)}>
                        <option value="NEW">Neuf</option>
                        <option value="LIKE_NEW">Comme neuf</option>
                        <option value="GOOD">Bon état</option>
                        <option value="FAIR">État correct</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Statut</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="AVAILABLE">Disponible</option>
                        <option value="SOLD">Vendu</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Localisation</label>
                    <input type="text" placeholder="Ex : Paris, Lyon..." value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="checkbox-row">
                    <input type="checkbox" id="negotiable" checked={isNegotiable} onChange={e => setIsNegotiable(e.target.checked)} />
                    <label htmlFor="negotiable">Prix négociable</label>
                </div>
                <div className="form-group">
                    <label>Nouvelle image (optionnel)</label>
                    <input type="file" accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} />
                </div>
                <button type="submit" className="btn-primary">Enregistrer les modifications</button>
            </form>
        </div>
    );
}
