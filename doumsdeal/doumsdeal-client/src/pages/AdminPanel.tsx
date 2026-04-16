import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface Ad {
    id: number;
    title: string;
    status: string;
    users: { username: string };
}

interface Log {
    id: number;
    action: string;
    target_type: string | null;
    target_id: number | null;
    details: string | null;
    created_at: string;
    users: { username: string } | null;
}

export default function AdminPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [tab, setTab] = useState<'users' | 'ads' | 'logs'>('users');
    const navigate = useNavigate();

    const loadData = useCallback(() => {
        api.get('/admin/users').then(res => setUsers(res.data)).catch(() => navigate('/'));
        api.get('/ads').then(res => setAds(res.data)).catch(() => {});
        api.get('/admin/logs').then(res => setLogs(res.data)).catch(() => {});
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        loadData();
    }, [navigate, loadData]);

    const deleteUser = async (id: number) => {
        if (!window.confirm('Supprimer cet utilisateur et toutes ses annonces ?')) return;
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
    };

    const toggleBan = async (id: number) => {
        const res = await api.patch(`/admin/users/${id}/toggle-active`);
        setUsers(users.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
    };

    const deleteAd = async (id: number) => {
        if (!window.confirm('Supprimer cette annonce ?')) return;
        await api.delete(`/admin/ads/${id}`);
        setAds(ads.filter(a => a.id !== id));
    };

    return (
        <div className="admin-page">
            <h2 style={{ marginBottom: '20px' }}>Panel Administration</h2>
            <div className="admin-tabs">
                <button className={`admin-tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
                    Utilisateurs ({users.length})
                </button>
                <button className={`admin-tab${tab === 'ads' ? ' active' : ''}`} onClick={() => setTab('ads')}>
                    Annonces ({ads.length})
                </button>
                <button className={`admin-tab${tab === 'logs' ? ' active' : ''}`} onClick={() => setTab('logs')}>
                    Journaux ({logs.length})
                </button>
            </div>

            {tab === 'users' && (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Inscrit le</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className={!u.is_active ? 'user-banned' : ''}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <span className={`badge ${u.is_active ? 'badge-available' : 'badge-sold'}`}>
                                        {u.is_active ? 'Actif' : 'Suspendu'}
                                    </span>
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                                <td style={{ display: 'flex', gap: '6px' }}>
                                    {u.role !== 'ADMIN' && (<>
                                        <button
                                            className={u.is_active ? 'btn-warning' : 'btn-success'}
                                            onClick={() => toggleBan(u.id)}
                                        >
                                            {u.is_active ? 'Suspendre' : 'Réactiver'}
                                        </button>
                                        <button className="btn-danger" onClick={() => deleteUser(u.id)}>Supprimer</button>
                                    </>)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {tab === 'ads' && (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Titre</th>
                            <th>Vendeur</th>
                            <th>Statut</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ads.map(ad => (
                            <tr key={ad.id}>
                                <td>{ad.title}</td>
                                <td>{ad.users?.username}</td>
                                <td>
                                    <span className={`badge ${ad.status === 'AVAILABLE' ? 'badge-available' : 'badge-sold'}`}>
                                        {ad.status === 'AVAILABLE' ? 'Disponible' : 'Vendu'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-danger" onClick={() => deleteAd(ad.id)}>Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {tab === 'logs' && (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Utilisateur</th>
                            <th>Action</th>
                            <th>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {new Date(log.created_at).toLocaleString('fr-FR')}
                                </td>
                                <td>{log.users?.username ?? <em style={{ color: 'var(--text-muted)' }}>supprimé</em>}</td>
                                <td><span className="log-action-badge">{log.action}</span></td>
                                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.details ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
