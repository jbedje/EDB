# Guide d'Installation - École de la Bourse (EDB)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les logiciels suivants :

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Docker** et **Docker Compose**
- **PostgreSQL** 15+ (si installation locale sans Docker)
- **Redis** (si installation locale sans Docker)

## Installation avec Docker (Recommandé)

### 1. Cloner le projet

```bash
cd EDB
```

### 2. Configuration des variables d'environnement

#### Backend

```bash
cd backend
cp .env.example .env
```

Éditer le fichier `.env` et configurer les variables suivantes :

```env
# Database
DATABASE_URL="postgresql://edb_user:edb_password_2025@localhost:5432/edb_database"

# JWT
JWT_SECRET=votre-clé-secrète-jwt-très-sécurisée
JWT_REFRESH_SECRET=votre-clé-refresh-très-sécurisée

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app

# SMS (Twilio)
TWILIO_ACCOUNT_SID=votre-account-sid
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# CinetPay
CINETPAY_API_KEY=votre-api-key
CINETPAY_SITE_ID=votre-site-id
CINETPAY_SECRET_KEY=votre-secret-key

# Orange Money
ORANGE_MONEY_API_KEY=votre-api-key
ORANGE_MONEY_MERCHANT_KEY=votre-merchant-key

# Wave
WAVE_API_KEY=votre-api-key
WAVE_SECRET_KEY=votre-secret-key
```

#### Frontend

```bash
cd ../frontend
```

Créer un fichier `.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Lancer l'application avec Docker

Retourner à la racine du projet :

```bash
cd ..
docker-compose up -d
```

Cette commande va :
- Démarrer PostgreSQL sur le port 5432
- Démarrer Redis sur le port 6379
- Démarrer le backend sur le port 3000
- Démarrer le frontend sur le port 5173
- Démarrer pgAdmin sur le port 5050 (optionnel)

### 4. Initialiser la base de données

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
```

### 5. Accéder à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **API Documentation (Swagger)** : http://localhost:3000/api/docs
- **pgAdmin** : http://localhost:5050

### Identifiants par défaut

Après le seed, vous pouvez vous connecter avec :

**Administrateur**
- Email : `admin@ecoledelabourse.com`
- Mot de passe : `Admin123!`

**Coach**
- Email : `coach@ecoledelabourse.com`
- Mot de passe : `Coach123!`

**Apprenant**
- Email : `apprenant@test.com`
- Mot de passe : `Apprenant123!`

## Installation locale (Sans Docker)

### 1. Installer PostgreSQL

Installer PostgreSQL 15+ et créer une base de données :

```sql
CREATE DATABASE edb_database;
CREATE USER edb_user WITH PASSWORD 'edb_password_2025';
GRANT ALL PRIVILEGES ON DATABASE edb_database TO edb_user;
```

### 2. Installer Redis

```bash
# Sur Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Sur macOS
brew install redis
brew services start redis

# Sur Windows
# Télécharger depuis https://redis.io/download
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos configurations

# Générer le client Prisma
npx prisma generate

# Migrer la base de données
npx prisma migrate dev

# Seed la base de données
npx prisma db seed

# Lancer le serveur
npm run start:dev
```

### 4. Frontend

```bash
cd frontend
npm install

# Créer .env
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Lancer le serveur de développement
npm run dev
```

## Scripts utiles

### Backend

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Prisma
npx prisma studio          # Interface graphique de la DB
npx prisma migrate dev     # Créer une migration
npx prisma db seed         # Réinitialiser les données
npx prisma generate        # Générer le client Prisma
```

### Frontend

```bash
# Développement
npm run dev

# Production
npm run build
npm run preview

# Linting
npm run lint
```

### Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Reconstruire les images
docker-compose up -d --build

# Supprimer les volumes (attention: supprime les données)
docker-compose down -v
```

## Dépannage

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est bien démarré :

```bash
docker-compose ps
# ou
sudo systemctl status postgresql
```

### Port déjà utilisé

Si le port 3000, 5173 ou 5432 est déjà utilisé, modifier les ports dans `docker-compose.yml` ou dans les fichiers `.env`.

### Prisma Client non généré

```bash
cd backend
npx prisma generate
```

### Erreur de migration Prisma

```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

## Configuration de production

Pour un déploiement en production :

1. Modifier toutes les clés secrètes dans `.env`
2. Configurer HTTPS avec un reverse proxy (Nginx, Caddy)
3. Utiliser un service de base de données managé (AWS RDS, etc.)
4. Configurer les services de paiement avec les vraies clés API
5. Configurer un service d'envoi d'emails (SendGrid, Mailgun)
6. Activer les sauvegardes automatiques de la base de données
7. Configurer un système de monitoring (Sentry, LogRocket)

## Support

Pour toute question ou problème :
- Email : support@ecoledelabourse.com
- Documentation : Voir `docs/` dans le projet
- Issues : GitHub Issues (si applicable)
