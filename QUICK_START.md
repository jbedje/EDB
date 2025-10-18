# 🚀 Guide de Démarrage Rapide - EDB

## ⚡ Démarrage en 5 Minutes

### 1. Configuration Backend

```bash
cd backend
npm install
cp .env.example .env
```

Éditer le fichier `.env` avec les configurations minimales :

```env
DATABASE_URL="postgresql://edb_user:edb_password_2025@localhost:5432/edb_database"
JWT_SECRET=votre-cle-secrete-changez-moi
JWT_REFRESH_SECRET=votre-cle-refresh-changez-moi
```

### 2. Configuration Frontend

```bash
cd frontend
npm install
```

Créer `.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Démarrage avec Docker

Retourner à la racine :

```bash
cd ..
docker-compose up -d
```

Attendre que tous les services démarrent (environ 30 secondes).

### 4. Initialiser la Base de Données

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Accéder à l'Application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **API Documentation** : http://localhost:3000/api/docs

### 6. Se Connecter

Utilisez un des comptes de test :

**Administrateur** :
- Email : `admin@ecoledelabourse.com`
- Mot de passe : `Admin123!`

**Coach** :
- Email : `coach@ecoledelabourse.com`
- Mot de passe : `Coach123!`

**Apprenant** :
- Email : `apprenant@test.com`
- Mot de passe : `Apprenant123!`

---

## 🛠️ Commandes Utiles

### Backend

```bash
# Développement (avec hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod

# Prisma Studio (interface graphique DB)
npx prisma studio

# Réinitialiser la DB
npx prisma migrate reset
npx prisma db seed
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build
npm run preview
```

### Docker

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Supprimer volumes (⚠️ supprime les données)
docker-compose down -v
```

---

## 📋 Structure des Fichiers Importants

```
EDB/
├── backend/
│   ├── src/main.ts              # Point d'entrée backend
│   ├── prisma/schema.prisma     # Schéma de base de données
│   └── .env                     # Configuration (À CRÉER)
│
├── frontend/
│   ├── src/main.tsx             # Point d'entrée frontend
│   ├── src/App.tsx              # Application principale
│   └── .env                     # Configuration (À CRÉER)
│
├── docker-compose.yml           # Orchestration Docker
├── PROJET_COMPLET.md           # Documentation complète
└── docs/
    ├── INSTALLATION.md         # Guide d'installation détaillé
    ├── TECHNICAL.md            # Documentation technique
    └── USER_GUIDE.md           # Guide utilisateur
```

---

## ✅ Vérifications Post-Installation

### 1. Vérifier PostgreSQL

```bash
docker-compose ps
# Doit montrer postgres comme "Up"

# Ou si installation locale:
psql -U edb_user -d edb_database -c "SELECT version();"
```

### 2. Vérifier Redis

```bash
docker exec -it edb-redis redis-cli ping
# Doit retourner: PONG
```

### 3. Vérifier Backend

```bash
curl http://localhost:3000/api
# Doit retourner une réponse JSON
```

### 4. Vérifier Frontend

Ouvrir http://localhost:5173 dans le navigateur

---

## 🔧 Résolution de Problèmes

### Port déjà utilisé

Si un port est déjà utilisé, modifier dans `docker-compose.yml` :

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Changer 5432 par 5433
```

### Erreur Prisma Client

```bash
cd backend
npx prisma generate
```

### Migration échouée

```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Frontend ne charge pas

Vérifier que le backend est démarré :

```bash
curl http://localhost:3000/api/auth/login
```

### Erreur CORS

Vérifier que `VITE_API_URL` dans frontend `.env` pointe vers le bon backend.

---

## 📦 Prochaines Étapes

### Configuration Production

1. **Changer tous les secrets**
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - Mots de passe DB

2. **Configurer les services externes**
   - SMTP pour les emails
   - Twilio pour les SMS
   - CinetPay, Orange Money, Wave pour les paiements

3. **HTTPS**
   - Installer Certbot
   - Configurer Nginx reverse proxy

4. **Monitoring**
   - Sentry pour les erreurs
   - Datadog/New Relic pour l'APM

### Développement

1. **Implémenter les pages frontend**
   - Les pages basiques sont créées
   - Ajouter les fonctionnalités CRUD complètes

2. **Ajouter les tests**
   - Tests unitaires (Jest)
   - Tests E2E (Playwright)

3. **Améliorer l'UX**
   - Loaders
   - Messages d'erreur détaillés
   - Animations

---

## 📞 Support

- **Documentation** : Voir `docs/` dans le projet
- **API Docs** : http://localhost:3000/api/docs
- **Email** : support@ecoledelabourse.com

---

## 🎯 Checklist de Démarrage

- [ ] Node.js 18+ installé
- [ ] Docker et Docker Compose installés
- [ ] Backend `npm install` exécuté
- [ ] Frontend `npm install` exécuté
- [ ] Fichier `.env` créé dans backend/
- [ ] Fichier `.env` créé dans frontend/
- [ ] `docker-compose up -d` exécuté
- [ ] `npx prisma migrate dev` exécuté
- [ ] `npx prisma db seed` exécuté
- [ ] Frontend accessible sur http://localhost:5173
- [ ] Backend accessible sur http://localhost:3000
- [ ] Connexion avec un compte de test réussie

---

**Félicitations ! Votre application EDB est maintenant opérationnelle ! 🎉**

Pour plus de détails, consultez [PROJET_COMPLET.md](./PROJET_COMPLET.md)
