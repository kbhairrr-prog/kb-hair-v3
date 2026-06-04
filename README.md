# KB Hair — Plateforme E-commerce Premium V3

## Stack
- **Next.js 16** + TypeScript + TailwindCSS
- **Supabase** (Auth · PostgreSQL · Storage · RLS)
- **Stripe** + **PayPal**
- **next-intl** (FR / EN)
- **Vercel** (déploiement)

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir les valeurs dans .env.local

# 3. Initialiser la base de données Supabase
# → Exécuter supabase/migrations/001_initial_schema.sql dans l'éditeur SQL Supabase

# 4. Lancer le serveur de développement
npm run dev
```

## Structure
```
app/[locale]/(shop)/       → Front Office (FR/EN)
app/[locale]/(admin)/      → Back Office sécurisé
components/shop/           → Composants boutique
components/page-builder/   → Blocs Page Builder
components/admin/          → Composants administration
lib/supabase/              → Clients Supabase
types/                     → Types TypeScript complets
supabase/migrations/       → Schéma SQL complet
messages/                  → Traductions FR + EN
```

## Design System
- **Noir profond** : `#0A0A0A`
- **Or luxe** : `#C9A84C`
- **Blanc pur** : `#FFFFFF`
- **Police display** : Cormorant Garamond
- **Police body** : Jost

## Variables d'environnement
Voir `.env.example` pour la liste complète.

## Déploiement Vercel
```bash
vercel --prod
```
