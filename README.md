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
| `GET`   | `/api/users`  | Liste les users  |
| `GET`   | `/api/users:id`  | Liste 1 user  |
| `POST`   | `/api/users`  | creation d'un user  |
| `PUT`   | `/api/users:id`  | remplace un user  |
| `PATCH`   | `/api/users:id`  | modification d'un user  |
| `DELETE`   | `/api/users:id`  | supprime 1 user  |
