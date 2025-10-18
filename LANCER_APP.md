# 🚀 Comment Lancer l'Application EDB

## ⚠️ Prérequis Importants

Avant de lancer l'application, vous devez avoir :

1. **PostgreSQL 15+** installé et en cours d'exécution
2. **Redis** installé et en cours d'exécution (optionnel pour commencer)
3. **Node.js 18+** installé

## 📝 Étape 1 : Créer la Base de Données PostgreSQL

### Option A : Via pgAdmin ou psql

```sql
CREATE DATABASE edb_database;
CREATE USER edb_user WITH PASSWORD 'edb_password_2025';
GRANT ALL PRIVILEGES ON DATABASE edb_database TO edb_user;
```

### Option B : Via ligne de commande psql

```bash
psql -U postgres
CREATE DATABASE edb_database;
CREATE USER edb_user WITH PASSWORD 'edb_password_2025';
GRANT ALL PRIVILEGES ON DATABASE edb_database TO edb_user;
\q
```

## 🔧 Étape 2 : Configuration (DÉJÀ FAIT ✅)

Les fichiers `.env` sont déjà créés :
- `backend/.env` ✅
- `frontend/.env` ✅

## 📦 Étape 3 : Installation Backend

```bash
cd backend
npm install
```

Si ça échoue, essayez :
```bash
npm install --legacy-peer-deps
```

## 🗄️ Étape 4 : Initialiser la Base de Données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma migrate dev --name init

# Insérer les données de test
npx prisma db seed
```

Cela va créer :
- 1 Admin : `admin@ecoledelabourse.com` / `Admin123!`
- 1 Coach : `coach@ecoledelabourse.com` / `Coach123!`
- 1 Apprenant : `apprenant@test.com` / `Apprenant123!`

## 🚀 Étape 5 : Démarrer l'Application

### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

Le backend démarrera sur : **http://localhost:3000**

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Le frontend démarrera sur : **http://localhost:5173**

## 🌐 Accéder à l'Application

- **Application Web** : http://localhost:5173
- **API Backend** : http://localhost:3000
- **Documentation API (Swagger)** : http://localhost:3000/api/docs

## 🔑 Se Connecter

Utilisez un de ces comptes :

**Administrateur** :
- Email : `admin@ecoledelabourse.com`
- Mot de passe : `Admin123!`

**Coach** :
- Email : `coach@ecoledelabourse.com`
- Mot de passe : `Coach123!`

**Apprenant** :
- Email : `apprenant@test.com`
- Mot de passe : `Apprenant123!`

## 🔴 Si vous n'avez pas PostgreSQL/Redis

### Option 1 : Installer PostgreSQL

**Windows** :
- Télécharger : https://www.postgresql.org/download/windows/
- Installer PostgreSQL 15 ou supérieur
- Noter le mot de passe que vous définissez pour l'utilisateur `postgres`

**Ou utiliser Docker (recommandé si installé)** :

```bash
docker run --name edb-postgres -e POSTGRES_PASSWORD=edb_password_2025 -e POSTGRES_USER=edb_user -e POSTGRES_DB=edb_database -p 5432:5432 -d postgres:15-alpine
```

### Option 2 : Utiliser Docker Compose (Plus Simple)

Si vous avez Docker Desktop installé :

```bash
# Démarrer seulement PostgreSQL et Redis
docker-compose up -d postgres redis

# Puis suivre les étapes 3, 4 et 5 ci-dessus
```

## ❌ Problèmes Courants

### Erreur "Cannot connect to database"

- Vérifier que PostgreSQL est démarré
- Vérifier que `DATABASE_URL` dans `backend/.env` est correct
- Tester la connexion : `psql -U edb_user -d edb_database`

### Erreur "Port 3000 already in use"

Un autre service utilise le port 3000. Modifier dans `backend/.env` :
```
PORT=3001
```

Et dans `frontend/.env` :
```
VITE_API_URL=http://localhost:3001/api
```

### Erreur Prisma "Client not generated"

```bash
cd backend
npx prisma generate
```

### Frontend ne se connecte pas au Backend

1. Vérifier que le backend est démarré
2. Vérifier `VITE_API_URL` dans `frontend/.env`
3. Tester : http://localhost:3000/api

## 📋 Ordre des Commandes Complet

```bash
# 1. Backend - Installation
cd c:\Users\JeremieBEDJE\Downloads\EDB\backend
npm install --legacy-peer-deps

# 2. Backend - Base de données
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 3. Backend - Démarrage
npm run start:dev

# Dans un NOUVEAU terminal

# 4. Frontend - Démarrage
cd c:\Users\JeremieBEDJE\Downloads\EDB\frontend
npm run dev

# 5. Ouvrir le navigateur
# http://localhost:5173
```

## ✅ Application Lancée !

Une fois que tout est démarré, vous devriez voir :

**Terminal Backend** :
```
✅ Database connected successfully
🚀 Server running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

**Terminal Frontend** :
```
VITE vX.X.X  ready in XXX ms
➜  Local:   http://localhost:5173/
```

Ouvrez http://localhost:5173 et connectez-vous !

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes, vérifiez :
1. PostgreSQL est installé et démarré
2. Les fichiers `.env` sont correctement configurés
3. Les ports 3000 et 5173 sont disponibles
4. Node.js version 18+ est installé
