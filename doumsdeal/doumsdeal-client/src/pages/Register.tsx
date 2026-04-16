import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/auth/register', { username, email, password });

            // Connexion automatique après inscription
            const loginRes = await api.post('/auth/login', { email, password });
            const credentials = btoa(`${email}:${password}`);
            localStorage.setItem('token', `Basic ${credentials}`);
            localStorage.setItem('role', loginRes.data.user.role);
            localStorage.setItem('username', loginRes.data.user.username);
            localStorage.setItem('userId', String(loginRes.data.user.id));
            if (loginRes.data.user.avatar_url) {
                localStorage.setItem('avatarUrl', loginRes.data.user.avatar_url);
            }
            navigate('/');

        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            if (error?.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Erreur lors de la création du compte.");
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Inscription à DoumsDeal</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Mot de passe</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-success" style={{ width: '100%', padding: '10px' }}>Créer mon compte</button>
                </div>
                <p className="form-footer">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
            </form>
        </div>
    );
}