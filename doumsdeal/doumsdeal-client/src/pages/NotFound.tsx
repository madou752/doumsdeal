import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="notfound-page">
            <div className="notfound-code">404</div>
            <h2 className="notfound-title">Page introuvable</h2>
            <p className="notfound-desc">Cette page n'existe pas ou a été déplacée.</p>
            <Link to="/">
                <button className="btn-primary">← Retour à l'accueil</button>
            </Link>
        </div>
    );
}
