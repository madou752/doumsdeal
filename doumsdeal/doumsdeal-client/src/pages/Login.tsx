import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });

            const credentials = btoa(`${email}:${password}`);
            localStorage.setItem('token', `Basic ${credentials}`);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('username', res.data.user.username);
            localStorage.setItem('userId', String(res.data.user.id));
            if (res.data.user.avatar_url) {
                localStorage.setItem('avatarUrl', res.data.user.avatar_url);
            } else {
                localStorage.removeItem('avatarUrl');
            }

            navigate('/');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            const message = e?.response?.data?.message;
            setError(message || "Email ou mot de passe incorrect.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Connexion à DoumsDeal</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Mot de passe</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>Se connecter</button>
                </div>
                <p className="form-footer">Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
            </form>
        </div>
    );
}