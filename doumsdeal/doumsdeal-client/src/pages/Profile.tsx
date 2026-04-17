import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
}

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        api.get('/auth/me')
            .then(res => {
                setUser(res.data);
                setUsername(res.data.username);
            })
            .catch(() => { localStorage.removeItem('token'); navigate('/login'); });
    }, [navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setAvatar(file);
        if (file) setAvatarPreview(URL.createObjectURL(file));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const formData = new FormData();
            formData.append('username', username);
            if (newPassword) formData.append('password', newPassword);
            if (avatar) formData.append('avatar', avatar);

            const res = await api.put('/auth/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            localStorage.setItem('username', res.data.username);
            if (res.data.avatar_url) localStorage.setItem('avatarUrl', res.data.avatar_url);
            else localStorage.removeItem('avatarUrl');
            window.dispatchEvent(new Event('focus'));

            setUser(prev => prev ? { ...prev, ...res.data } : prev);
            setMessage('Profil mis à jour avec succès.');
            setNewPassword('');
            setAvatar(null);
            setAvatarPreview(null);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message || 'Erreur lors de la mise à jour.');
        }
    };

    if (!user) return <div className="page" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;

    const currentAvatar = avatarPreview ?? user.avatar_url;

    return (
        <div className="profile-page">
            <h2>Mon profil</h2>
            <div className="profile-info">
                <div className="profile-avatar-row">
                    <div className="avatar avatar-lg">
                        {currentAvatar
                            ? <img src={currentAvatar} alt={user.username} />
                            : <span>{user.username[0].toUpperCase()}</span>
                        }
                    </div>
                    <div>
                        <strong style={{ fontSize: '18px' }}>{user.username}</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.role}</div>
                    </div>
                </div>
                <p><strong>Email :</strong> {user.email}</p>
                <p><strong>Membre depuis :</strong> {new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <h3 style={{ marginBottom: '16px' }}>Modifier mon profil</h3>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpdate} className="profile-form">
                <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Nouveau mot de passe <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(laisser vide pour ne pas changer)</span></label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="form-group">
                    <label>Photo de profil (avatar)</label>
                    <div className="avatar-upload-row">
                        <div className="avatar avatar-sm">
                            {currentAvatar
                                ? <img src={currentAvatar} alt="preview" />
                                : <span>{user.username[0].toUpperCase()}</span>
                            }
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                </div>
                <button type="submit" className="btn-primary">Enregistrer</button>
            </form>
        </div>
    );
}
