import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

interface Category {
    id: number;
    name: string;
}

export default function CreateAd() {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [categoryId, setCategoryId] = useState('');
    const [condition, setCondition] = useState('GOOD');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [location, setLocation] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesError, setCategoriesError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/categories')
            .then(res => {
                if (res.data.length > 0) {
                    setCategories(res.data);
                } else {
                    setCategoriesError(true);
                }
            })
            .catch(() => setCategoriesError(true));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('category_id', categoryId);
        formData.append('condition', condition);
        formData.append('is_negotiable', String(isNegotiable));
        if (location) formData.append('location', location);
        if (image) formData.append('image', image);

        try {
            await api.post('/ads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Annonce publiée !");
            navigate('/');
        } catch (error) {
            console.error("Erreur publication", error);
            alert("Erreur lors de la publication. Vérifiez que vous êtes connecté.");
        }
    };

    return (
        <div className="page">
            <h2 style={{ marginBottom: '20px' }}>Déposer une annonce sur DoumsDeal</h2>
            <form onSubmit={handleSubmit} className="ad-form">
                <div className="form-group">
                    <label>Titre</label>
                    <input type="text" placeholder="Titre de l'annonce" onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Prix (€)</label>
                    <input type="number" placeholder="0.00" step="0.01" min="0" onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Décrivez votre article..." rows={4} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Catégorie</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required disabled={categoriesError}>
                        <option value="">
                            {categoriesError ? '⚠ Catégories indisponibles' : '-- Choisir une catégorie --'}
                        </option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {categoriesError && (
                        <div className="alert alert-error" style={{ marginTop: '8px' }}>
                            Impossible de charger les catégories. Vérifiez que le serveur est actif et que la DB contient des données (exécutez sql/seeds.sql).
                        </div>
                    )}
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
                    <label>Localisation</label>
                    <input type="text" placeholder="Ex : Paris, Lyon..." value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="checkbox-row">
                    <input type="checkbox" id="negotiable" checked={isNegotiable} onChange={e => setIsNegotiable(e.target.checked)} />
                    <label htmlFor="negotiable">Prix négociable</label>
                </div>
                <div className="form-group">
                    <label>Photo du produit</label>
                    <input type="file" accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} />
                </div>
                <button type="submit" className="btn-success">Publier l'annonce</button>
            </form>
        </div>
    );
}