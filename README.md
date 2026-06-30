# Maison Lila

Application personnelle simple pour vider la charge mentale familiale au quotidien.

## Onglets

- Tableau de bord
- Agenda
- Courses & repas
- Notes famille
- À faire

## Site en ligne

GitHub Pages : `https://socrila.github.io/maison-lila/`

Vercel : `https://maison-lila-nine.vercel.app`

## Utilisation

L'application enregistre les données automatiquement dans le navigateur avec `localStorage`.
Elle peut aussi être installée comme PWA depuis Chrome, Edge ou un navigateur mobile compatible.

## Synchronisation Supabase

Pour retrouver les données sur Windows, Mac, téléphone et tablette :

1. Choisir un seul projet Supabase.
2. Ouvrir SQL Editor dans Supabase.
3. Copier/coller le contenu de `supabase-maison-lila.sql`.
4. Lancer le script.
5. Dans Maison Lila, cliquer sur `Cloud`.
6. Coller l'URL Supabase et la clé `anon public`.
7. Se connecter avec un email et un mot de passe.

Le script Supabase crée uniquement la table `maison_lila_app_states`.
Il ne supprime rien et ne modifie aucune table déjà existante.

## Vercel

Ce dépôt est prêt à être importé dans Vercel :

- Framework : Other
- Build command : vide
- Output directory : vide ou `.`

## Architecture

- HTML, CSS et JavaScript natif
- Sauvegarde locale automatique
- Synchronisation Supabase optionnelle avec `cloud-sync.js`
- Export/import JSON depuis l'application
- Manifest PWA et service worker
- Schéma simple dans `schema.sql`
