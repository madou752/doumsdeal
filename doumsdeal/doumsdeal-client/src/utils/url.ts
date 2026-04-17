// URL de base du serveur (sans /api) pour les fichiers uploadés
export const SERVER_URL = (import.meta.env.VITE_API_URL as string ?? 'http://localhost:3000/api').replace('/api', '');
