-- 1. Helper: Vérifier si la table existe et comment elle s'appelle exactement
-- Exécutez cette ligne seule si vous avez encore l'erreur "relation does not exist"
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Ajouter la colonne theme (si la table s'appelle bien chatbots)
ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
