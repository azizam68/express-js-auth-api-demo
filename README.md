# Express API

API REST développée avec Node.js et Express.js.

## Objectifs

Projet d'apprentissage permettant d'expérimenter :

- Express.js
- API REST
- middlewares
- TypeScript
- gestion des erreurs
- PostgreSQL
- Drizzle ORM
- authentification
- gestion des sessions
- rôles métier
- déploiement

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Le serveur est lancé avec `tsx` et redémarre automatiquement lors des modifications.

## Production

### Build

```bash
npm run build
```

### Launch

```bash
npm start
```

## Endpoints

| Méthode | Endpoint      | Description    |
| ------- | ------------- | -------------- |
| `GET`   | `/`           | Page d'accueil |
| `GET`   | `/api/health` | État de l'API  |
