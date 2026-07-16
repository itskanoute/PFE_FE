# Guide d'Intégration Backend - Espace Étudiant

Ce document est destiné au développeur Backend (collègue). Il détaille les routes d'API (endpoints) et les structures de données (JSON) qui doivent être créées pour que l'Espace Étudiant fonctionne avec de vraies données.

## 1. Récupération des Offres Disponibles

Le Frontend (pages `EtudiantDashboard` et `EtudiantOffres`) a besoin de récupérer la liste de toutes les offres créées par les responsables.

- **Route suggérée :** `GET /api/offres` (ou `/api/etudiant/offres`)
- **Action :** Retourner la liste des offres d'assistanat.
- **Filtrage Intelligent :** Le Frontend gère *déjà* l'extraction dynamique des filtres (Matières, Niveaux, Périodes) et la recherche. Le Backend a juste besoin de renvoyer un tableau JSON plat avec toutes les données.

**Structure JSON attendue (exemple d'un objet offre) :**
```json
{
  "id": 1,
  "titre": "Base de données",
  "responsable": "Prof. Jean-Pierre Amand",
  "volume": "4h / semaine",
  "periode": "Semestre 1",
  "description": "Accompagnement des étudiants de L2 pour les TD...",
  "tags": ["SQL", "POSTGRESQL"],
  "niveau": "L3 Informatique",
  "statutCandidature": null 
}
```
*Note sur `statutCandidature` : Si l'étudiant connecté a déjà postulé à cette offre, le backend doit renvoyer `"postule"`, sinon `null`. Cela permet au Frontend de griser le bouton "Candidater".*

---

## 2. Soumission d'une Candidature

Quand l'étudiant clique sur "Candidater" et valide la modale, le Frontend doit envoyer les données du formulaire au Backend.

- **Route suggérée :** `POST /api/candidatures`
- **Action :** Enregistrer la candidature en base de données pour que le responsable puisse la voir.

**Payload JSON envoyé par le Frontend :**
```json
{
  "offreId": 1,
  "etudiantId": "id_de_letudiant_connecte",
  "phone": "06 12 34 56 78",
  "grade": 15.5,
  "motivation": "Je souhaite postuler car j'ai eu une excellente note...",
  "cvAttached": true
}
```
*Note sur le CV : Si la gestion des fichiers (upload) est implémentée, ce sera probablement du `multipart/form-data` avec le fichier physique joint.*

---

## 3. Informations de Profil (Optionnel pour le V1)

L'étudiant a accès à une page profil où il renseigne ses informations et son IBAN. L'alerte IBAN (en rouge sur le dashboard) est basée sur ces données.

- **Route suggérée :** `GET /api/etudiant/profil`
- **Action :** Récupérer les infos de l'étudiant.
- **Route suggérée :** `PUT /api/etudiant/profil`
- **Action :** Mettre à jour l'IBAN ou le numéro de téléphone.

## 4. Annulation d'une Séance (Urgence)

Quand un étudiant annule une de ses séances (à J-1 minimum), le système lui demande obligatoirement un motif d'annulation. Ce motif doit être enregistré et transmis au Responsable pour qu'il le voie dans son espace.

- **Route suggérée :** `POST /api/seances/:id/cancel` (ou `PUT /api/seances/:id/status`)
- **Action :** Passer le statut de la séance à "annulé" et sauvegarder la raison.

**Payload JSON envoyé par le Frontend :**
```json
{
  "motif": "Problème de transport, je ne pourrai pas assurer le tutorat."
}
```

---

## Intégration Frontend

Une fois ces routes créées côté Backend, il suffira d'aller dans les fichiers `Frontend/src/pages/etudiant/EtudiantDashboard.jsx`, `EtudiantOffres.jsx` et `EtudiantSeances.jsx` pour :
1. Remplacer le state initial statique (`useState([...])`) par un `useEffect` qui fait un appel `fetch()` ou `axios.get()`.
2. Remplacer les alertes et modifications de state locales (comme dans `handleConfirmCancel`) par des requêtes POST ou PUT vers l'API.
