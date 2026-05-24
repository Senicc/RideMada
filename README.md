# RideMada

Application de covoiturage (Madagascar) — Android (Jetpack Compose) + API Node.js/TypeScript/PostgreSQL.

## Structure

| Dossier | Description |
|---------|-------------|
| `ride_mada_backend/` | API REST + Socket.IO (Express, Prisma, JWT) |
| `ride_mada_mobile/` | Application Android (Kotlin, Compose, Hilt, Room, Retrofit) |

## Prérequis

- **Node.js** 18+
- **PostgreSQL** 14+
- **Android Studio** Ladybug ou plus récent
- **JDK** 11+

## Backend

```powershell
cd ride_mada_backend
copy .env.example .env
# Éditer .env (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET)

npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

API : `http://localhost:5000/api`  
Santé : `http://localhost:5000/health`

### Endpoints principaux

- `POST /api/auth/register` — inscription + OTP SMS (log console en dev)
- `POST /api/auth/verify-otp` — validation OTP
- `POST /api/auth/login` — JWT access + refresh
- `POST /api/auth/refresh` — renouveler le token
- `GET /api/rides/nearby` — trajets à proximité
- `GET /api/rides/nearby-drivers` — conducteurs en ligne
- `POST /api/bookings` — réserver un trajet
- Socket.IO : position conducteur, chat temps réel

## Application Android

1. Ouvrir `ride_mada_mobile/` dans Android Studio.
2. **Émulateur** : l’URL API par défaut est `http://10.0.2.2:5000/api/` (définie dans `app/build.gradle.kts`).
3. **Téléphone physique** : remplacer par l’IP LAN de votre PC, par ex. `http://192.168.1.10:5000/api/`.
4. Ajouter votre clé Google Maps dans `AndroidManifest.xml` (`com.google.android.geo.API_KEY`).
5. Synchroniser Gradle puis **Run**.

```powershell
cd ride_mada_mobile
.\gradlew.bat assembleDebug
```

> Si le build Gradle échoue avec une erreur TLS/réseau, vérifiez proxy/VPN/firewall ou relancez avec une connexion stable.

## Parcours utilisateur

1. **Splash** → session ou login
2. **Inscription** → OTP → accueil
3. **Carte** — conducteurs proches (GPS + API)
4. **Trajets** — liste et réservation
5. **Profil** — déconnexion, devenir conducteur

## Stack

**Mobile** : Kotlin, Jetpack Compose, Material 3, Hilt, Retrofit, Room, Maps Compose, Socket.IO, DataStore  

**Backend** : Express 5, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Socket.IO, Helmet, CORS, rate limiting

## Sécurité (production)

- Changer `JWT_SECRET` et `JWT_REFRESH_SECRET`
- HTTP clair limité au dev via `network_security_config` (Android)
- Retirer `tempOTP` en production (`NODE_ENV=production`)
- Configurer `ALLOWED_ORIGINS` sans wildcard

## Améliorations récentes (audit complet)

### Backend
- Exclusion des mots de passe / OTP des réponses API
- Inscription forcée en `PASSENGER` (pas d'escalade `ADMIN`)
- OTP cryptographique + comparaison timing-safe
- Rate limit auth (5 tentatives / 15 min)
- Middleware `ensureActiveUser` (comptes bloqués)
- Upload Cloudinary en mémoire (multer `memoryStorage`)
- Réservations : anti-doublon, restitution des places à l'annulation
- Paiements : montant réel + contrôle d'accès
- Trajets : filtre Haversine 50 km, conducteur `isApproved` requis
- Socket.IO : rooms sécurisées, rôle DRIVER pour GPS
- Conducteurs proches : auth JWT requis

### Mobile
- `SocketService` : auth au handshake, pas de reconnexion cassée
- Refresh token automatique (401 → `/auth/refresh`)
- Permissions GPS runtime sur la carte
- États succès/erreur sur publication trajet et devenir conducteur
- DTOs alignés backend (`RideDetailResponse`, `BecomeDriverResponse`, etc.)
- Cleartext HTTP limité à l'émulateur (`network_security_config`)

### Fonctionnalités complétées (dernière passe)
- **Reset password** : écran OTP + nouveau mot de passe (`/auth/reset-password`)
- **Stockage chiffré** : `EncryptedSharedPreferences` pour tokens JWT
- **FCM** : `RideMadaMessagingService` + `PATCH /users/fcm-token`
- **Véhicules** : écran Mes véhicules, ajout, sélection à la publication
- **Chat** : `receiverId` depuis réservation, Socket `newMessage`, room trajet
- **Réservations** : écran liste + contact conducteur

## Transformation professionnelle (VTC moderne)

### Trois interfaces distinctes
| Rôle | Écran d'accueil | Navigation |
|------|-----------------|------------|
| **PASSENGER** | Accueil + Carte VTC | Accueil, Carte, Trajets, Activité, Compte |
| **DRIVER** | Dashboard conducteur | Conduire, Courses, Carte, Gains, Compte |
| **ADMIN** | Tableau de bord admin | Stats, Users, Chauffeurs, Courses, Compte |

La redirection après login/splash/OTP utilise le rôle utilisateur (`RoleNavigation`).

### Nouvelles API backend
- `GET /api/rides/estimate-fare` — tarif dynamique (distance + type véhicule)
- `PUT /api/drivers/status` — en ligne / hors ligne
- `GET /api/drivers/earnings` — revenus et courses du conducteur
- `GET /api/admin/rides/active` — monitoring courses
- `GET /api/admin/reports` — signalements
- `POST /api/admin/unblock-user/:id` — débloquer utilisateur

### Parcours passager (style Uber)
1. **Carte** → destination + type véhicule → estimation prix
2. **Commander** → suivi course simulé (`TripTrackingScreen`)
3. **Paiement** simulé (Espèces, MVola, Orange, Airtel)
4. **Notation** du chauffeur

### Admin connecté à l'API
- Statistiques réelles (users, drivers, revenus, signalements)
- Liste utilisateurs avec blocage/déblocage
- Validation conducteurs en attente
- Monitoring des courses actives

### Design
- Thème sombre/clair Material 3
- Bottom sheet carte style VTC (fond clair sur carte)
- Palette : cyan RideMada + vert conducteur + or admin
