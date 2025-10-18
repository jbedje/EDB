# École de la Bourse (EDB) - Application de Gestion

Application web de gestion des cohortes, du coaching et des abonnements pour l'École de la Bourse.

## 🎯 Objectif

Gérer les formations, le coaching post-formation et les abonnements payants des apprenants.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Base de données**: PostgreSQL
- **Cache**: Redis
- **Queue**: Bull
- **Authentification**: JWT + Passport
- **Paiements**: CinetPay, Orange Money, Wave
- **Notifications**: Email (SMTP) + SMS

## 📦 Structure du projet

```
edb-app/
├── backend/           # API NestJS
├── frontend/          # Application React
├── docker/            # Configuration Docker
├── docs/              # Documentation
└── README.md
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL 15+
- Redis

### Installation

```bash
# Cloner le projet
cd edb-app

# Installation des dépendances
cd backend && npm install
cd ../frontend && npm install

# Démarrage avec Docker
docker-compose up -d

# Migrations de base de données
cd backend && npx prisma migrate dev

# Démarrage en développement
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 👥 Rôles utilisateurs

- **Administrateur**: Supervision, création de cohortes, gestion des paiements
- **Coach**: Suivi des apprenants, planification du coaching
- **Apprenant**: Accès personnel, souscription aux abonnements

## 📋 Modules fonctionnels

1. Gestion des cohortes et formations
2. Coaching post-formation
3. Abonnements et paiements
4. Reporting et statistiques
5. Gestion des utilisateurs et rôles
6. Tableau de bord global

## 🔐 Sécurité

- HTTPS obligatoire
- JWT pour l'authentification
- RBAC (Role-Based Access Control)
- Bcrypt pour les mots de passe
- Logs d'audit
- Sauvegardes quotidiennes

## 📚 Documentation

- [Documentation technique](./docs/TECHNICAL.md)
- [Guide utilisateur](./docs/USER_GUIDE.md)
- [API Documentation](http://localhost:3000/api/docs) (Swagger)

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## 📄 Licence

Propriétaire - École de la Bourse © 2025

## 📧 Support

- Email: support@ecoledelabourse.com
- WhatsApp: [Numéro à définir]
- Ticketing interne: [URL à définir]
