# Documentation Technique - École de la Bourse (EDB)

## Architecture

L'application EDB suit une architecture moderne full-stack avec séparation claire du frontend et du backend.

### Stack Technique

#### Backend
- **Framework** : NestJS 10 avec TypeScript
- **Base de données** : PostgreSQL 15
- **ORM** : Prisma 5
- **Authentification** : JWT + Passport
- **Cache** : Redis
- **Queue** : Bull
- **Validation** : Class-validator
- **Documentation API** : Swagger/OpenAPI

#### Frontend
- **Framework** : React 18 avec TypeScript
- **Build Tool** : Vite
- **Routing** : React Router v6
- **State Management** : Zustand
- **HTTP Client** : Axios
- **Data Fetching** : TanStack Query (React Query)
- **Forms** : React Hook Form + Zod
- **UI/CSS** : Tailwind CSS
- **Icons** : Lucide React
- **Charts** : Recharts
- **Notifications** : Sonner

### Architecture Hexagonale

Le backend suit les principes de la Clean Architecture :

```
src/
├── modules/              # Modules métier
│   ├── auth/            # Authentification
│   ├── users/           # Gestion utilisateurs
│   ├── cohorts/         # Gestion cohortes
│   ├── coaching/        # Sessions de coaching
│   ├── subscriptions/   # Abonnements
│   ├── payments/        # Paiements
│   ├── notifications/   # Notifications
│   ├── reports/         # Rapports
│   └── dashboard/       # Tableaux de bord
├── common/              # Code partagé
│   ├── prisma/         # Service Prisma
│   ├── redis/          # Service Redis
│   ├── filters/        # Filtres d'exception
│   └── interceptors/   # Intercepteurs
└── config/             # Configuration
```

## Modèle de données

### Entités principales

#### User
- Représente tous les utilisateurs (Admin, Coach, Apprenant)
- Gestion des rôles avec RBAC
- Authentification sécurisée avec bcrypt
- Support de vérification email/téléphone

#### Cohort
- Groupes de formation
- Types de formation configurables
- Statuts : DRAFT, ACTIVE, COMPLETED, ARCHIVED
- Limitation du nombre d'apprenants

#### CoachingSession
- Sessions de coaching individuelles
- Coaching gratuit de 3 mois post-formation
- Assignation de coaches
- Feedbacks bidirectionnels

#### Subscription
- Abonnements payants (Mensuel, Trimestriel, Annuel)
- Renouvellement automatique optionnel
- Gestion de l'annulation

#### Payment
- Historique des paiements
- Support multi-providers (CinetPay, Orange Money, Wave)
- Webhooks pour les callbacks
- Transactions sécurisées

#### Notification
- Système de notifications multi-canal (Email, SMS, In-App)
- File d'attente avec Bull
- Statuts de livraison

#### AuditLog
- Journalisation des actions sensibles
- Traçabilité complète
- Support des métadonnées

## API REST

### Authentification

```
POST   /api/auth/register          - Inscription
POST   /api/auth/login             - Connexion
POST   /api/auth/refresh           - Rafraîchir le token
POST   /api/auth/logout            - Déconnexion
POST   /api/auth/me                - Profil utilisateur
```

### Utilisateurs

```
GET    /api/users                  - Liste des utilisateurs (Admin)
GET    /api/users/coaches          - Liste des coaches
GET    /api/users/me               - Mon profil
GET    /api/users/me/stats         - Mes statistiques
GET    /api/users/:id              - Utilisateur par ID
PUT    /api/users/:id              - Mettre à jour utilisateur
PUT    /api/users/:id/status       - Changer statut (Admin)
DELETE /api/users/:id              - Supprimer utilisateur (Admin)
```

### Cohortes

```
GET    /api/cohorts                - Liste des cohortes
POST   /api/cohorts                - Créer cohorte (Admin)
GET    /api/cohorts/stats          - Statistiques (Admin)
GET    /api/cohorts/:id            - Cohorte par ID
PUT    /api/cohorts/:id            - Mettre à jour cohorte (Admin)
DELETE /api/cohorts/:id            - Supprimer cohorte (Admin)
POST   /api/cohorts/:id/members    - Ajouter membre (Admin)
DELETE /api/cohorts/:id/members/:userId  - Retirer membre (Admin)
PUT    /api/cohorts/:id/members/:userId/progress  - MAJ progression
```

### Coaching

```
GET    /api/coaching               - Liste des sessions
GET    /api/coaching/my-sessions   - Mes sessions
GET    /api/coaching/my-coaching   - Sessions que je coache (Coach)
GET    /api/coaching/:id           - Session par ID
PUT    /api/coaching/:id/assign-coach  - Assigner coach (Admin)
PUT    /api/coaching/:id/feedback  - Ajouter feedback
PUT    /api/coaching/:id/status    - Changer statut
```

### Abonnements

```
GET    /api/subscriptions          - Liste abonnements (Admin)
POST   /api/subscriptions          - Créer abonnement
GET    /api/subscriptions/my-subscriptions  - Mes abonnements
GET    /api/subscriptions/:id      - Abonnement par ID
PUT    /api/subscriptions/:id/cancel  - Annuler abonnement
PUT    /api/subscriptions/:id/renew   - Renouveler abonnement
```

### Paiements

```
GET    /api/payments               - Liste paiements (Admin)
POST   /api/payments/initiate      - Initier paiement
POST   /api/payments/callback/:provider  - Webhook paiement
GET    /api/payments/my-payments   - Mes paiements
GET    /api/payments/stats         - Statistiques (Admin)
GET    /api/payments/:id           - Paiement par ID
```

### Notifications

```
GET    /api/notifications/my-notifications  - Mes notifications
PUT    /api/notifications/:id/read  - Marquer comme lu
```

### Rapports

```
GET    /api/reports/overview       - Vue d'ensemble (Admin)
GET    /api/reports/users          - Rapport utilisateurs (Admin)
GET    /api/reports/revenue        - Rapport revenus (Admin)
GET    /api/reports/cohorts        - Rapport cohortes (Admin)
```

### Dashboard

```
GET    /api/dashboard              - Tableau de bord personnalisé
```

## Sécurité

### Authentification

- JWT avec signature RS256
- Refresh tokens pour renouvellement
- Expiration configurable
- Révocation des tokens

### Autorisation

- RBAC (Role-Based Access Control)
- Guards NestJS pour les routes protégées
- Vérification des permissions au niveau service

### Protection

- Rate limiting (100 req/min par défaut)
- CORS configuré
- Helmet pour headers sécurisés
- HTTPS obligatoire en production
- Validation des entrées avec class-validator
- Protection contre les injections SQL (Prisma)
- Chiffrement des mots de passe (bcrypt)

### Audit

- Logs de toutes les actions sensibles
- Traçabilité des modifications
- IP et User-Agent capturés
- Stockage sécurisé des logs

## Intégrations

### Paiements

#### CinetPay
- Documentation : https://docs.cinetpay.com
- Endpoint : `https://api-checkout.cinetpay.com/v2/payment`
- Callback : `/api/payments/callback/cinetpay`

#### Orange Money
- Endpoint : `https://api.orange.com/orange-money-webpay/dev/v1/webpayment`
- Callback : `/api/payments/callback/orange-money`

#### Wave
- Endpoint : `https://api.wave.com/v1/checkout/sessions`
- Callback : `/api/payments/callback/wave`

### Notifications

#### Email (SMTP)
- Configuration via nodemailer
- Templates HTML personnalisables
- Support des pièces jointes

#### SMS (Twilio)
- Configuration via Twilio SDK
- SMS transactionnels et marketing
- Vérification de numéros

## Performance

### Cache

- Redis pour le cache applicatif
- TTL configurables
- Invalidation automatique

### Base de données

- Index sur les colonnes fréquemment requêtées
- Relations optimisées avec Prisma
- Pagination sur toutes les listes

### Frontend

- Code splitting automatique avec Vite
- Lazy loading des composants
- Optimistic updates avec React Query
- Service Worker pour le cache

## Tests

### Backend

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
# Tests unitaires
npm run test

# Tests e2e (à implémenter avec Playwright)
npm run test:e2e
```

## Déploiement

### Variables d'environnement requises

Voir `.env.example` dans chaque dossier.

### Build

#### Backend
```bash
npm run build
npm run start:prod
```

#### Frontend
```bash
npm run build
# Les fichiers statiques sont dans dist/
```

### Docker

Les Dockerfiles sont prêts pour le déploiement :

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

Recommandations pour la production :

- **APM** : New Relic, Datadog
- **Logs** : Winston + ELK Stack
- **Errors** : Sentry
- **Uptime** : Pingdom, UptimeRobot
- **Analytics** : Google Analytics, Mixpanel

## Maintenance

### Sauvegardes

Script de sauvegarde quotidienne :

```bash
pg_dump -U edb_user edb_database > backup_$(date +%Y%m%d).sql
```

### Mises à jour

```bash
# Backend
npm update
npx prisma migrate deploy

# Frontend
npm update
npm run build
```

## Évolutions futures

- WebSocket pour notifications temps réel
- Système de chat entre apprenants et coaches
- Intégration de visioconférence (Zoom, Meet)
- Application mobile (React Native)
- Analytics avancés
- Système de badges et gamification
- API publique pour partenaires
