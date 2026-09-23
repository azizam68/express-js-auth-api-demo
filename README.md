# Express API

API REST développée avec Node.js, Express.js et TypeScript.

Projet d'apprentissage visant à construire progressivement une API REST complète avec PostgreSQL, Drizzle ORM, validation des données, authentification et gestion des rôles métier.

## Objectifs

Projet d'apprentissage permettant d'expérimenter :

* Express.js
* API REST
* middlewares
* TypeScript
* gestion des erreurs
* PostgreSQL
* Drizzle ORM
* migrations de base de données
* seeds
* validation des données avec Zod
* sécurisation des mots de passe avec Argon2
* authentification
* gestion des sessions
* rôles métier
* tests automatisés
* déploiement

## Architecture des données

Le projet sépare les informations d'authentification des informations du profil utilisateur.

```text
users
  │
  │ 1
  │
  └────── 1 user_profiles
```

### `users`

Contient les informations nécessaires à l'identification du compte :

* `id`
* `email`
* `password_hash`
* `is_active`
* `created_at`
* `updated_at`

### `user_profiles`

Contient les informations personnelles du profil :

* `user_id`
* `first_name`
* `last_name`
* `created_at`
* `updated_at`

La relation entre les deux tables utilise une clé étrangère avec suppression en cascade.

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à partir des variables nécessaires au projet.

La connexion PostgreSQL est notamment définie avec :

```env
DATABASE_URL=...
```

Les variables d'environnement utilisées pour les migrations de production sont définies séparément dans `.env.production`.

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

## Base de données

### Générer une migration

```bash
npm run db:generate -- --name nom_de_la_migration
```

Exemple :

```bash
npm run db:generate -- --name add_user_profiles
```

Les migrations sont générées dans :

```text
drizzle/
```

### Appliquer les migrations en développement

```bash
npm run db:migrate
```

### Appliquer les migrations en production

```bash
npm run db:migrate:prod
```

Les migrations permettent de faire évoluer le schéma de la base de données de manière versionnée.

## Seed

Les données de démonstration sont séparées des migrations.

Le seed permet notamment de créer des utilisateurs de développement tels que :

* `admin@example.com`
* `test@example.com`
* `demo@example.com`

Les mots de passe ne sont pas stockés en clair : ils sont transformés en hash avec Argon2.

Le seed est conçu pour pouvoir être exécuté plusieurs fois sans créer de doublons.

```bash
npm run db:seed
```

## Validation

Les données reçues par l'API sont validées avec **Zod** avant leur traitement.

Exemple :

```text
HTTP request
     ↓
Express
     ↓
Zod
     ↓
Controller
     ↓
Drizzle
     ↓
PostgreSQL
```

## Mots de passe

Les mots de passe ne sont jamais stockés directement en base de données.

Ils sont transformés avec Argon2 :

```text
mot de passe
     ↓
   Argon2
     ↓
password_hash
     ↓
PostgreSQL
```

Lors de l'authentification, Argon2 vérifie le mot de passe fourni à partir du hash enregistré.

## Endpoints

| Méthode  | Endpoint         | Description                            |
| -------- | ---------------- | -------------------------------------- |
| `GET`    | `/`              | Page d'accueil                         |
| `GET`    | `/api/health`    | État de l'API et de la base de données |
| `GET`    | `/api/users`     | Liste les utilisateurs                 |
| `GET`    | `/api/users/:id` | Récupère un utilisateur                |
| `POST`   | `/api/users`     | Crée un utilisateur                    |
| `PUT`    | `/api/users/:id` | Remplace un utilisateur                |
| `PATCH`  | `/api/users/:id` | Modifie partiellement un utilisateur   |
| `DELETE` | `/api/users/:id` | Supprime un utilisateur                |

## Tests

Les tests automatisés utilisent Vitest et Supertest.

Ils permettent notamment de tester l'application Express sans avoir besoin de démarrer manuellement le serveur HTTP.

```text
tests/
└── app.test.ts
```

Le serveur HTTP et l'application Express sont séparés :

```text
app.ts
  ↓
application Express

server.ts
  ↓
démarrage du serveur HTTP
```

Cette séparation facilite les tests.

## Déploiement

L'API est déployée sur Render.

La base de données de production utilise PostgreSQL hébergé par Supabase.

Les migrations de production sont exécutées depuis le poste de développement avec :

```bash
npm run db:migrate:prod
```

## Évolution prévue

Le projet sera progressivement complété avec :

* authentification
* sessions
* rôles métier
* association utilisateurs / rôles
* gestion des permissions
* tests plus complets
* sécurisation de l'API
* amélioration de la gestion des erreurs
* protection contre les attaques courantes
* documentation de l'API
