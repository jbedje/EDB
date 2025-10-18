# 🎓 École de la Bourse (EDB) - Application Complète

> Application web de gestion des cohortes de formation, du coaching et des abonnements

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

---

## 📋 Vue d'Ensemble

Application complète full-stack développée pour l'École de la Bourse permettant de :

- 📚 Gérer les cohortes de formation
- 👨‍🏫 Suivre le coaching post-formation (3 mois gratuits)
- 💳 Gérer les abonnements et paiements (CinetPay, Orange Money, Wave)
- 📊 Visualiser des rapports et statistiques détaillés
- 👥 Administrer les utilisateurs (Admin, Coach, Apprenant)
- 🔔 Envoyer des notifications (Email, SMS, In-App)

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- 5 minutes de votre temps ⏱️

### Installation Express

```bash
# 1. Naviguer vers le projet
cd EDB

# 2. Démarrer avec Docker
docker-compose up -d

# 3. Initialiser la base de données
cd backend
npm install
npx prisma migrate dev
npx prisma db seed

# ✅ C'est prêt !
```

### Accès

- **Application** : http://localhost:5173
- **API** : http://localhost:3000
- **Documentation API** : http://localhost:3000/api/docs

### Connexion de Test

**Admin** : `admin@ecoledelabourse.com` / `Admin123!`
**Coach** : `coach@ecoledelabourse.com` / `Coach123!`
**Apprenant** : `apprenant@test.com` / `Apprenant123!`

**👉 Guide détaillé** : [QUICK_START.md](./QUICK_START.md)

---

## 🏗️ Architecture

### Stack Technique

**Backend**
- NestJS 10 + TypeScript
- PostgreSQL 15 + Prisma ORM
- Redis (Cache)
- Bull (Queue pour notifications)
- JWT + Passport (Auth)
- Swagger (Documentation)

**Frontend**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- React Router v6
- Zustand (State)
- React Query (Data fetching)

**Infrastructure**
- Docker + Docker Compose
- Nginx (Production)

---

## 📁 Structure du Projet

```
EDB/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── modules/     # Modules métier
│   │   ├── common/      # Code partagé
│   │   └── config/      # Configuration
│   └── prisma/          # Schéma DB + Migrations
│
├── frontend/            # App React
│   └── src/
│       ├── pages/       # Pages
│       ├── components/  # Composants
│       ├── stores/      # State management
│       └── lib/         # Utilitaires
│
├── docker/              # Config Docker
├── docs/                # Documentation
│   ├── INSTALLATION.md
│   ├── TECHNICAL.md
│   └── USER_GUIDE.md
│
├── docker-compose.yml
├── QUICK_START.md       # Guide rapide
└── PROJET_COMPLET.md    # Documentation complète
```

---

## ✨ Fonctionnalités

### ✅ Authentification & Sécurité
- Inscription/Connexion JWT
- RBAC (Admin, Coach, Apprenant)
- Refresh tokens
- Protection brute force
- Logs d'audit complets

### ✅ Gestion des Cohortes
- CRUD complet
- Types de formation configurables
- Suivi de progression (0-100%)
- Limitation du nombre de participants

### ✅ Coaching
- Coaching gratuit automatique (3 mois)
- Assignation de coaches
- Feedbacks bidirectionnels
- Notifications d'expiration

### ✅ Abonnements & Paiements
- 3 types : Mensuel, Trimestriel, Annuel
- Paiements via CinetPay, Orange Money, Wave
- Webhooks & callbacks
- Activation automatique

### ✅ Notifications
- Multi-canal : Email, SMS, In-App
- Queue asynchrone (Bull)
- Statuts de livraison

### ✅ Rapports & Dashboard
- Dashboard personnalisé par rôle
- Statistiques en temps réel
- Rapports exportables

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Démarrage en 5 minutes |
| [PROJET_COMPLET.md](./PROJET_COMPLET.md) | Documentation complète du projet |
| [docs/INSTALLATION.md](./docs/INSTALLATION.md) | Guide d'installation détaillé |
| [docs/TECHNICAL.md](./docs/TECHNICAL.md) | Documentation technique |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | Guide utilisateur |
| [API Docs](http://localhost:3000/api/docs) | Documentation Swagger (après démarrage) |

---

## 🔧 Commandes Principales

### Backend

```bash
cd backend

# Développement
npm run start:dev

# Production
npm run build && npm run start:prod

# Base de données
npx prisma studio          # Interface graphique
npx prisma migrate dev     # Nouvelle migration
npx prisma db seed         # Réinitialiser données
```

### Frontend

```bash
cd frontend

# Développement
npm run dev

# Production
npm run build
npm run preview
```

### Docker

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f backend
```

---

## 🗄️ Modèle de Données

### Entités Principales

1. **User** - Utilisateurs (Admin/Coach/Apprenant)
2. **Cohort** - Cohortes de formation
3. **CoachingSession** - Sessions de coaching
4. **Subscription** - Abonnements
5. **Payment** - Paiements
6. **Notification** - Notifications
7. **AuditLog** - Logs d'audit

**Schéma complet** : [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

---

## 📡 API Endpoints

### Authentification
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Utilisateurs
```
GET    /api/users
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id
```

### Cohortes
```
GET    /api/cohorts
POST   /api/cohorts
GET    /api/cohorts/:id
POST   /api/cohorts/:id/members
```

### Autres
- `/api/coaching` - Sessions de coaching
- `/api/subscriptions` - Abonnements
- `/api/payments` - Paiements
- `/api/notifications` - Notifications
- `/api/dashboard` - Tableaux de bord
- `/api/reports` - Rapports

**Documentation complète** : http://localhost:3000/api/docs

---

## 🔐 Sécurité

- ✅ HTTPS (production)
- ✅ JWT avec rotation
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting (100 req/min)
- ✅ CORS configuré
- ✅ Helmet headers
- ✅ Validation des entrées
- ✅ Protection injection SQL (Prisma)
- ✅ Bcrypt (cost 10)
- ✅ Logs d'audit

---

## 🚢 Déploiement Production

### Checklist

- [ ] Modifier tous les secrets (JWT, DB, etc.)
- [ ] Configurer HTTPS (Let's Encrypt)
- [ ] Services externes (SMTP, SMS, Paiements)
- [ ] Base de données managée (AWS RDS, etc.)
- [ ] Sauvegardes automatiques
- [ ] Monitoring (Sentry, Datadog)
- [ ] Tester webhooks paiement
- [ ] DNS & CDN

**Guide complet** : [docs/INSTALLATION.md](./docs/INSTALLATION.md)

---

## 🧪 Tests

```bash
# Backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage

# Frontend
npm run test           # Unit tests (à implémenter)
```

---

## 🛠️ Résolution de Problèmes

### Erreur de connexion DB

```bash
docker-compose ps
docker-compose restart postgres
```

### Port déjà utilisé

Modifier dans `docker-compose.yml` :
```yaml
ports:
  - "5433:5432"  # Au lieu de 5432:5432
```

### Prisma Client manquant

```bash
cd backend
npx prisma generate
```

**Plus de solutions** : [QUICK_START.md](./QUICK_START.md#-résolution-de-problèmes)

---

## 📦 Technologies Utilisées

| Catégorie | Technologies |
|-----------|-------------|
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Redis, Bull |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Zustand |
| Auth | JWT, Passport, Bcrypt |
| Paiements | CinetPay, Orange Money, Wave |
| Notifications | Nodemailer (Email), Twilio (SMS) |
| DevOps | Docker, Docker Compose, Nginx |
| Docs | Swagger/OpenAPI |

---

## 🔮 Roadmap

- [ ] WebSocket (notifications temps réel)
- [ ] Chat intégré
- [ ] Visioconférence (Zoom/Meet)
- [ ] Application mobile (React Native)
- [ ] Gamification (badges, points)
- [ ] Forum communautaire
- [ ] Multi-langue (i18n)
- [ ] Mode sombre

---

## 📄 Licence

Propriétaire - École de la Bourse © 2025

---

## 📞 Support

- **Email** : support@ecoledelabourse.com
- **Documentation** : Voir dossier `docs/`
- **API Docs** : http://localhost:3000/api/docs

**Heures** : Lundi-Vendredi 8h-18h, Samedi 9h-13h

---

## 🎉 Contributeurs

Développé pour l'École de la Bourse avec ❤️

---

## 🚀 Commencer Maintenant !

```bash
# Clone le projet (si depuis Git)
git clone [URL_DU_REPO]
cd EDB

# Ou navigue simplement vers le dossier EDB
cd EDB

# Lance l'application !
docker-compose up -d
cd backend && npm install && npx prisma migrate dev && npx prisma db seed

# Ouvre http://localhost:5173 et connecte-toi !
```

**Besoin d'aide ?** Consultez [QUICK_START.md](./QUICK_START.md) ou [PROJET_COMPLET.md](./PROJET_COMPLET.md)

---

**Made with 💙 for École de la Bourse**
