# EduManage — Backend (Node.js + Express + MySQL)

API backend pour la plateforme de gestion des assistants de TP.

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0+

## Installation

```bash
cd Backend
npm install
cp .env.example .env
```

Configurez `.env` avec vos identifiants MySQL.

## Créer la base de données

```bash
mysql -u root -p < database/schema.sql
```

Optionnel — données de démo :

```bash
mysql -u root -p < database/seed.sql
```

## Démarrer l'API

```bash
npm run dev
```

L'API écoute sur `http://localhost:3000`.

## Tester le backend (sans modifier le frontend)

Le frontend du groupe **n'appelle pas encore l'API** — les formulaires font seulement `console.log()`.  
Tu peux donc tester ton backend **indépendamment**, sans toucher au code React.

### 1. Navigateur (le plus simple)

Avec `npm run dev` lancé, ouvre :

- http://localhost:3000/ → liste des routes
- http://localhost:3000/api/health → vérifie MySQL
- http://localhost:3000/api/schools → liste des écoles en JSON

### 2. Fichier `api.http` (recommandé)

Le fichier `Backend/api.http` contient des requêtes prêtes à l'emploi.

Dans Cursor/VS Code : installe l'extension **REST Client**, ouvre `api.http`, clique sur **Send Request** au-dessus de chaque requête.

### 3. Postman / Thunder Client / Insomnia

Importe les mêmes URLs :

```
GET  http://localhost:3000/api/health
GET  http://localhost:3000/api/schools
GET  http://localhost:3000/api/schools/1/filieres
```

### 4. Terminal (PowerShell)

```powershell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod http://localhost:3000/api/schools
```

### 5. Vérifier les données en base

Dans MySQL Workbench ou phpMyAdmin :

```sql
USE edumanage;
SELECT * FROM schools;
SELECT email, role FROM users;
```

### Contrat API pour l'équipe frontend

Quand ils brancheront le frontend, voici ce qu'ils devront appeler (à implémenter côté backend) :

| Page frontend | Endpoint backend prévu |
|---------------|------------------------|
| Login | `POST /api/auth/login` ✅ |
| Inscription école | `POST /api/auth/register/school` |
| Inscription étudiant | `POST /api/auth/register/student` + `GET /api/schools` |
| Dropdown écoles | `GET /api/schools` ✅ déjà prêt |

### POST /api/auth/login

**Body (JSON) :**
```json
{
  "email": "admin@escp.eu",
  "password": "Password123!"
}
```

**Réponse succès (200) :**
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": 1,
    "email": "admin@escp.eu",
    "role": "admin",
    "firstName": "Jean",
    "lastName": "Dupont",
    "schoolId": 1,
    "mustChangePassword": false
  }
}
```

**Erreurs possibles :**
| Code | Message |
|------|---------|
| 400 | Email et mot de passe sont obligatoires |
| 401 | Email ou mot de passe incorrect |
| 403 | Ce compte est désactivé |

**Test PowerShell :**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@escp.eu","password":"Password123!"}'
```

## Endpoints disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Santé de l'API + connexion MySQL |
| POST | `/api/auth/login` | Connexion (email + mot de passe → JWT + `redirectTo`) |
| POST | `/api/auth/register/school` | Inscription école + admin |
| POST | `/api/auth/register/student` | Inscription étudiant |
| GET | `/api/auth/me` | Profil connecté (Bearer token) |
| GET | `/api/schools` | Liste des écoles (inscription étudiant) |
| GET | `/api/schools/:id/filieres` | Filières d'une école |

## Schéma de la base

```
schools
  ├── filieres
  ├── users (admin | responsable | etudiant)
  │     ├── student_profiles
  │     └── responsable_profiles
  ├── offers
  │     ├── applications
  │     └── sessions
  │           ├── session_assignments
  │           └── hour_records
  ├── notifications
  ├── monthly_exports
  └── activity_logs
```

### Rôles utilisateurs

| Rôle | Inscription | Tables liées |
|------|-------------|--------------|
| **admin** | Formulaire école | `users` + école créée dans `schools` |
| **responsable** | Créé par l'admin | `users` + `responsable_profiles` |
| **etudiant** | Auto-inscription | `users` + `student_profiles` |

### Comptes de démo (seed)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@escp.eu | Password123! | Admin |
| e.ettori@escp.eu | Password123! | Responsable |
| lea.martin@escp.eu | Password123! | Étudiant |

## Prochaines étapes

- Middleware JWT sur les routes métier (offres, candidatures…)
- CRUD responsables, offres, candidatures, séances
- Pages dashboard complètes (équipe frontend)

## Intégration frontend ↔ backend

Les formulaires auth du frontend appellent l'API via `Frontend/src/services/api.js`.

**Lancer les deux serveurs :**
```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd Frontend && npm install && npm run dev
```

**Flux testés :**
- `/login` → POST `/api/auth/login` → redirection via `redirectTo` (admin, responsable, étudiant)
- `/register/school` → POST `/api/auth/register/school`
- `/register/student` → GET `/api/schools` + POST `/api/auth/register/student`
- Validation des heures et export mensuel
