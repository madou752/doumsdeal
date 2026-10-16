<h1 align="center">DoumsDeal</h1>

<p align="center">Une marketplace de petites annonces entre particuliers, inspirée de LeBonCoin, en TypeScript de bout en bout.</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-1F5FBF?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<p align="center"><img src="docs/preview.png" alt="Aperçu de DoumsDeal" width="900" /></p>

## À propos

DoumsDeal est une application full-stack de petites annonces : on publie un objet, on le cherche, on le met en favori et on discute avec le vendeur.
Le projet est découpé en deux applications : un client React (Vite) et une API REST Express qui s'appuie sur PostgreSQL via Prisma.
L'objectif était de construire une vraie application complète, de la modélisation de la base jusqu'au déploiement sur un VPS, avec un espace d'administration.

## Fonctionnalités

- **Comptes utilisateurs** : inscription, connexion, mots de passe hachés avec bcrypt, profil modifiable (pseudo, mot de passe, avatar).
- **Annonces** : création, modification, suppression avec photo, prix, état de l'objet, prix négociable, localisation et catégorie.
- **Recherche et filtres** : recherche par titre, filtre par catégorie et fourchette de prix, tri par prix ou par date, pagination (25 annonces par page).
- **Compteur de vues** : chaque consultation d'une annonce incrémente son nombre de vues.
- **Favoris** : ajout et retrait en un clic, page dédiée aux annonces sauvegardées.
- **Messagerie acheteur / vendeur** : une conversation par annonce, interface en deux colonnes, messages marqués comme lus, badge de non-lus dans l'en-tête.
- **Notification par e-mail** : le destinataire reçoit un mail (Nodemailer) à chaque nouveau message, si un SMTP est configuré.
- **Marquer comme vendu** : le vendeur peut clôturer son annonce depuis la conversation.
- **Espace administrateur** : liste des utilisateurs, suspension / réactivation, suppression de comptes et d'annonces.
- **Journal d'activité** : inscriptions, connexions, créations et suppressions sont tracées en base et consultables par l'admin.
- **Upload sécurisé** : images uniquement, 5 Mo maximum, noms de fichiers uniques.

## Stack technique

| Côté | Technologies |
| --- | --- |
| Front | React 19, TypeScript, Vite, React Router, Axios |
| Back | Node.js, Express 5, TypeScript (tsx), Multer, Nodemailer, bcrypt |
| Base de données | PostgreSQL, Prisma 7 (adaptateur `@prisma/adapter-pg`) |
| Déploiement | VPS Linux, Express sert le build React en production |

## Architecture

```text
doumsdeal/
├── doumsdeal/
│   ├── doumsdeal-client/        # Application React (Vite)
│   │   └── src/
│   │       ├── api/             # Instance Axios et ajout de l'en-tête d'authentification
│   │       ├── components/      # En-tête avec badge de messages non lus
│   │       ├── pages/           # Accueil, annonce, profil, favoris, messagerie, admin
│   │       └── utils/           # URL du serveur pour les fichiers uploadés
│   └── doumsdeal-server/        # API REST Express
│       ├── prisma/              # Schéma Prisma (utilisateurs, annonces, favoris, messages, logs)
│       ├── upload/              # Images envoyées par les utilisateurs
│       └── src/
│           ├── routes/          # Déclaration des endpoints /api/*
│           ├── controllers/     # Lecture de la requête et réponse HTTP
│           ├── services/        # Règles métier, e-mails, journalisation
│           ├── managers/        # Accès aux données via Prisma
│           ├── security/        # Authentification, rôle admin, filtre d'upload
│           └── seed.ts          # Données de démo
└── sql/                         # Scripts SQL d'origine (création du rôle et des premières tables)
```

L'API suit un découpage en couches : `routes` -> `controllers` -> `services` -> `managers`.

## Lancer le projet en local

### Prérequis

- Node.js 20 ou plus et npm
- Une base PostgreSQL accessible

### 1. API

```bash
cd doumsdeal/doumsdeal-server
npm install
```

Créer un fichier `.env` dans `doumsdeal-server/` (valeurs factices à adapter) :

```env
DATABASE_URL=postgresql://utilisateur:mot_de_passe@localhost:5432/doumsdeal
PORT=3000
FRONTEND_URL=http://localhost:5173

# Optionnel : notifications e-mail
MAIL_HOST=smtp.exemple.com
MAIL_PORT=587
MAIL_USER=utilisateur_smtp
MAIL_PASS=mot_de_passe_smtp
MAIL_FROM="DoumsDeal <no-reply@exemple.com>"
```

Générer le client Prisma, créer les tables, puis charger les données de démo :

```bash
npx prisma generate
npx prisma db push
npx tsx src/seed.ts
npm run dev
```

Le seed crée les catégories, quelques annonces et trois comptes de démo (un admin et deux utilisateurs), affichés dans la console.

### 2. Client

```bash
cd doumsdeal/doumsdeal-client
npm install
```

Créer un fichier `.env.local` dans `doumsdeal-client/` :

```env
VITE_API_URL=http://localhost:PORT/api
```

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Production

`npm run build` dans le client génère `dist/`, que le serveur Express sert directement avec un fallback SPA pour toutes les routes hors `/api` et `/upload`.

## Ce que j'ai appris

- **Structurer une API en couches** : séparer routes, contrôleurs, services et accès aux données pour garder chaque fichier lisible.
- **Modéliser des relations réelles avec Prisma** : conversations uniques par acheteur, vendeur et annonce, favoris uniques, suppressions en cascade.
- **Gérer les fichiers uploadés** : filtrage Multer, chemins absolus pour que les images restent servies une fois déployé.
- **Déployer sur un VPS** : un seul serveur Express pour l'API et le front, variables d'environnement par environnement, CORS configuré.

## Auteur

**Mehdi Hammadou** (Madou)

[Portfolio](https://portfoliohammadoumehdi.vercel.app/) · [GitHub](https://github.com/madou752)
