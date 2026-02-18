export const VENDO_KNOWLEDGE_BASE = JSON.stringify({
    "meta": {
        "version": "2025.1",
        "last_updated": "2025-02-18",
        "purpose": "Base de connaissances optimisée pour le chatbot Vendo — couvre ventes, support, technique, objections et onboarding"
    },

    "brand": {
        "name": "Vendo",
        "tagline": "Transformez vos visiteurs en acheteurs. Automatiquement.",
        "positioning": "Assistant IA de vente autonome — pas un simple chatbot support, un vrai employé commercial disponible 24h/24.",
        "mission": "Démocratiser l'IA de vente 'niveau agence' pour tous les entrepreneurs, du dropshipper au fondateur SaaS.",
        "differentiators": [
            "Sales-First : entraîné sur des scripts de vente éprouvés, il engage, convainc et convertit",
            "Universel : fonctionne sur TOUT site web avec une seule ligne de code",
            "Zéro code : setup en 2 minutes — upload PDF ou URL, le bot est prêt",
            "Wallet flexible : tu paies uniquement les messages consommés, pas un forfait fixe surdimensionné"
        ],
        "website": "https://usevendo.com",
        "support_email": "support@usevendo.com",
        "privacy_email": "privacy@usevendo.com"
    },

    "plans": [
        {
            "id": "free",
            "name": "Plan Gratuit",
            "price_monthly": 0,
            "price_display": "0€/mois",
            "nickname": "Le Testeur",
            "target": "Débutants, curieux, tests de validation",
            "limits": {
                "chatbots": 1,
                "messages_per_month": 1000,
                "messages_type": "Hard limit — le bot s'arrête à 1000 messages",
                "wallet": false
            },
            "features": [
                "1 chatbot",
                "Base de connaissances RAG (texte, PDF, URL)",
                "Widget standard",
                "Message de bienvenue personnalisable"
            ],
            "restrictions": [
                "Branding 'Powered by Vendo' non supprimable",
                "Nom du bot verrouillé sur 'Mon Assistant Vendo'",
                "Pas de capture d'emails",
                "Pas de récupération de panier"
            ],
            "ideal_for": "Tester la technologie avant de s'engager — risque zéro",
            "upgrade_trigger": "Dès que le site dépasse 1000 visiteurs/mois ou que la capture de leads devient prioritaire"
        },
        {
            "id": "growth",
            "name": "Plan Growth",
            "price_monthly": 49,
            "price_display": "49€/mois",
            "nickname": "Le Solopreneur",
            "target": "E-commerces générant 1 000€ à 10 000€/mois",
            "limits": {
                "chatbots": 10,
                "messages_per_month": "Illimité (consommation via Wallet)",
                "wallet": true
            },
            "features": [
                "10 chatbots",
                "Messages illimités via Wallet",
                "Branding 100% custom (logo, nom, avatar, couleur)",
                "Suppression 'Powered by Vendo'",
                "Capture d'emails intégrée dans le chat",
                "Récupération de panier (messages proactifs)",
                "Support prioritaire",
                "Analytics & logs de conversations",
                "Attribution de revenus (pixel page de remerciement)"
            ],
            "restrictions": [],
            "roi_argument": "Si le bot convertit UN client supplémentaire à 50€, il s'autofinance. Avec 10 clients, ROI de 10x.",
            "ideal_for": "E-commerçants qui veulent des leads, moins d'abandons de panier et un support automatisé"
        },
        {
            "id": "agency",
            "name": "Plan Agency",
            "price_monthly": 249,
            "price_display": "249€/mois",
            "nickname": "L'Empire Builder",
            "target": "Agences, serial entrepreneurs, revendeurs SaaS",
            "limits": {
                "chatbots": 999999,
                "chatbots_display": "Illimité (999 999)",
                "messages_per_month": "Illimité via Wallet",
                "wallet": true
            },
            "features": [
                "Chatbots illimités",
                "White-Label complet — revends Vendo sous ta propre marque",
                "Gestion clients (tokens individuels par client)",
                "Mode Iframe — intègre le dashboard dans ton site d'agence",
                "Accès API complet (contrôle programmatique total)",
                "Intégration WhatsApp Marketing (broadcasting)",
                "Custom Domain CNAME (ex: chat.monagence.com) — à venir",
                "Liberté totale de pricing (tu fixes tes propres tarifs clients)"
            ],
            "restrictions": [],
            "roi_argument": "Tu paies 249€. Tu revends 3 bots à 100€/mois = déjà en profit. La plupart des agences facturent 500€ à 2000€ le setup + retainer mensuel.",
            "ideal_for": "Agences digitales, freelances qui veulent une offre IA récurrente, entrepreneurs qui veulent un 'business dans une boîte'"
        }
    ],

    "wallet": {
        "description": "Système de crédits pour les messages IA sur les plans Growth et Agency",
        "currency": "Crédits Vendo",
        "exchange_rate": "1€ = environ 10 000 messages IA",
        "cost_per_message": "Extrêmement bas — fraction de centime par message",
        "auto_refill": {
            "available": true,
            "trigger": "Rechargement automatique si le solde tombe sous 5€",
            "setup": "À configurer dans /billing"
        },
        "why_wallet": "Permet d'utiliser des modèles IA puissants (GPT-4o, Claude, DeepSeek V3) sans forfait fixe surdimensionné. Tu paies exactement ce que tu consommes.",
        "models_used": ["DeepSeek V3 (raisonnement principal)", "GPT-4o (fallback)", "Claude 3.5 Sonnet (disponible)"]
    },

    "features": {
        "chatbot_editor": {
            "identity": {
                "name": "Personnalisable librement (Growth & Agency)",
                "avatar": "Upload image ou initiale avec couleur de fond",
                "brand_color": "Code hexadécimal — s'applique au widget",
                "welcome_message": "Premier message proactif — tester A/B pour maximiser les conversions"
            },
            "system_prompt": {
                "description": "Le 'cerveau' du bot — définit la personnalité, le ton, les règles de comportement",
                "examples": [
                    "Concierge luxe — ton raffiné, vouvoiement, recommandations premium",
                    "Vendeur agressif — urgence, push promotionnel, closing rapide",
                    "Conseiller expert — pédagogique, objectif, basé sur les faits",
                    "Assistant Gen Z — langage cash, emojis, humour"
                ]
            },
            "knowledge_base": {
                "description": "Système RAG — le bot répond uniquement avec les infos que tu lui fournis",
                "sources": [
                    "Texte brut — coller directement",
                    "URL / Sitemap — Vendo crawle automatiquement le site et apprend tous les produits",
                    "PDF — catalogues produits, CGV, politiques de retour, fiches techniques",
                    "CSV — listes de produits, prix, stocks",
                    "TXT — FAQ, scripts de vente"
                ],
                "how_rag_works": "Le texte est découpé en chunks de 500 tokens, converti en vecteurs (embeddings OpenAI), stocké dans Supabase pgvector. À chaque question, les passages les plus proches sont récupérés et envoyés au LLM avec la question."
            }
        },
        "lead_generation": {
            "email_capture": {
                "description": "Le bot demande l'email dans la conversation, ex : 'Je peux t'envoyer un code promo de 10%, tu veux bien ton email ?'",
                "storage": "Dashboard > Leads",
                "export": ["CSV", "Klaviyo via Zapier", "Webhooks custom"]
            }
        },
        "cart_recovery": {
            "description": "Messages proactifs déclenchés quand un visiteur stagne sur la page panier",
            "example": "Après 45 secondes d'inactivité → 'Tu hésites encore ? Je peux t'aider à choisir ou t'offrir la livraison gratuite 😊'",
            "available_on": ["Growth", "Agency"]
        },
        "analytics": {
            "revenue_attribution": "Suit si un utilisateur a chatté avant d'acheter (pixel sur page de confirmation)",
            "conversation_logs": "Lire chaque conversation, filtrer par sentiment (à venir)",
            "global_search": "Rechercher un mot-clé dans toutes les interactions",
            "available_on": ["Growth", "Agency"]
        },
        "white_label": {
            "description": "Revendre Vendo sous ta propre marque sans que le client sache que c'est Vendo",
            "features": [
                "Client tokens individuels",
                "Mode Iframe (dashboard intégré dans ton site)",
                "Liberté totale de pricing"
            ],
            "available_on": ["Agency"]
        },
        "whatsapp": {
            "description": "Intégration WhatsApp API pour broadcasting et conversations",
            "available_on": ["Agency"]
        },
        "api_access": {
            "description": "Contrôle programmatique complet de Vendo",
            "available_on": ["Agency"]
        }
    },

    "integrations": [
        {
            "platform": "HTML universel (tout site)",
            "difficulty": "⭐ Très facile",
            "steps": ["Copier le script fourni dans le dashboard", "Coller avant </body> dans le code HTML", "Remplacer YOUR_BOT_ID par l'ID de ton bot"],
            "code": "<script src=\"https://usevendo.com/embed.js\" data-chatbot-id=\"YOUR_BOT_ID_HERE\" defer></script>",
            "note": "Fonctionne sur 100% des sites web"
        },
        {
            "platform": "Shopify",
            "difficulty": "⭐ Très facile",
            "steps": ["Online Store > Themes > Edit Code", "Ouvrir theme.liquid", "Coller le script avant </body>"],
            "note": "App Shopify avec lecture dynamique du panier en développement"
        },
        {
            "platform": "WordPress / WooCommerce",
            "difficulty": "⭐ Très facile",
            "steps": ["Installer le plugin 'Insert Headers and Footers'", "Coller le script dans 'Footer Scripts'", "Sauvegarder"]
        },
        {
            "platform": "Wix",
            "difficulty": "⭐ Très facile",
            "steps": ["Settings > Custom Code", "Coller dans 'Body - End'", "Appliquer à 'All Pages'"]
        },
        {
            "platform": "Webflow",
            "difficulty": "⭐ Très facile",
            "steps": ["Project Settings > Custom Code", "Footer Code box", "Coller le script", "Publier"]
        },
        {
            "platform": "Framer",
            "difficulty": "⭐ Très facile",
            "steps": ["Settings > General > Custom Code", "End of Body", "Coller le script", "Publier"]
        },
        {
            "platform": "ClickFunnels",
            "difficulty": "⭐ Très facile",
            "steps": ["Settings > Tracking Code", "Footer Code", "Coller le script", "Save & Update"]
        },
        {
            "platform": "Systeme.io",
            "difficulty": "⭐ Très facile",
            "steps": ["Settings > Sales Funnel Settings", "Edit Page > Settings > Raw HTML", "Glisser un élément 'Raw HTML' en bas de page", "Coller le script"]
        },
        {
            "platform": "Squarespace",
            "difficulty": "⭐ Facile",
            "steps": ["Settings > Advanced > Code Injection", "Footer", "Coller le script", "Sauvegarder"],
            "note": "Nécessite le plan Business minimum"
        },
        {
            "platform": "BigCommerce",
            "difficulty": "⭐ Facile",
            "steps": ["Storefront > Script Manager", "Create a Script", "Location: Footer, All pages, Category: Essential", "Coller le script", "Sauvegarder"]
        },
        {
            "platform": "Carrd.co",
            "difficulty": "⭐ Facile",
            "steps": ["Add Element > Embed", "Style: Hidden > Body End", "Coller le script"],
            "note": "Nécessite le plan Pro Standard"
        },
        {
            "platform": "Ghost CMS",
            "difficulty": "⭐ Facile",
            "steps": ["Settings > Code Injection", "Site Footer", "Coller le script", "Sauvegarder"]
        },
        {
            "platform": "Magento 2 / Adobe Commerce",
            "difficulty": "⭐⭐ Moyen",
            "steps": ["Admin > Content > Configuration", "Sélectionner la vue de boutique", "HTML Head > Scripts and Style Sheets", "Coller le script", "Sauvegarder", "Vider le cache via System > Cache Management"]
        },
        {
            "platform": "PrestaShop 1.7+",
            "difficulty": "⭐⭐ Moyen",
            "steps": ["Installer le module 'Custom HTML'", "Ou modifier /themes/YOUR_THEME/templates/_partials/javascript.tpl", "Coller le script en bas", "Vider le cache via Advanced Parameters > Performance"]
        },
        {
            "platform": "Drupal 9/10",
            "difficulty": "⭐⭐ Moyen",
            "steps": ["Installer le module 'Asset Injector'", "Configuration > Development > Asset Injector > JS", "Créer un nouvel injecteur JS", "Coller le script, scope: All pages", "Sauvegarder"]
        },
        {
            "platform": "Joomla 4",
            "difficulty": "⭐⭐ Moyen",
            "steps": ["System > Site Template Styles", "Sélectionner le template actif", "Custom Code tab OU installer le plugin 'Sourcerer'", "Coller dans la position footer"]
        }
    ],

    "faq": [
        {
            "id": 1,
            "question": "Est-ce que Vendo fonctionne sur mon site ?",
            "answer": "Si ton site est sur internet, oui. C'est une seule ligne de JavaScript. Peu importe la plateforme — Shopify, Wix, WordPress, site custom — si tu peux ajouter un script, Vendo fonctionne. Tu as accès au code de ton site ?",
            "category": "Technique"
        },
        {
            "id": 2,
            "question": "Est-ce que ça va ralentir mon site ?",
            "answer": "Non. Le script se charge de façon asynchrone — il attend que ton site soit entièrement chargé avant d'apparaître. L'impact sur le score Google PageSpeed est inférieur à 1%. On utilise un CDN mondial pour servir le fichier en quelques millisecondes.",
            "category": "Technique"
        },
        {
            "id": 3,
            "question": "C'est quoi le Wallet exactement ?",
            "answer": "C'est ton solde de crédits pour les messages IA. 1€ = environ 10 000 messages. Le coût moyen d'une conversation complète est une fraction de centime. Tu peux activer le rechargement automatique pour ne jamais être à court. C'est bien plus rentable qu'un forfait fixe.",
            "category": "Facturation"
        },
        {
            "id": 4,
            "question": "Que se passe-t-il si je stop de payer ?",
            "answer": "Tes bots sont mis en pause. Tes données sont conservées 30 jours. Tu peux réactiver à tout moment sans perdre ta configuration.",
            "category": "Facturation"
        },
        {
            "id": 5,
            "question": "Comment fonctionne le White-Label ?",
            "answer": "Sur le plan Agency, tu peux revendre Vendo sous ta propre marque. Ton client voit ton logo, ton nom, ton domaine. Il ne sait pas que tu utilises Vendo. Tu crées un token client dans le dashboard et tu fixes toi-même le prix que tu lui factures. Toi tu paies 249€, tu peux facturer 100-200€/mois par client.",
            "category": "Agency"
        },
        {
            "id": 6,
            "question": "Puis-je utiliser ma propre clé OpenAI ?",
            "answer": "Non. On gère l'infrastructure IA pour toi — modèles, rate limits, gestion des erreurs. Tu n'as rien à configurer. Tu consommes des crédits Wallet, c'est tout.",
            "category": "Technique"
        },
        {
            "id": 7,
            "question": "Le bot parle quelle langue ?",
            "answer": "95 langues. Il détecte automatiquement la langue du visiteur. Si quelqu'un écrit en espagnol, il répond en espagnol. Zéro configuration nécessaire.",
            "category": "Fonctionnalités"
        },
        {
            "id": 8,
            "question": "Comment fonctionne la capture d'emails ?",
            "answer": "Dans l'éditeur de chatbot, active 'Collecter les emails'. Le bot intégrera naturellement une demande d'email dans la conversation (ex: pour envoyer un code promo). L'email est sauvegardé dans l'onglet Leads. Tu peux exporter en CSV ou connecter à Klaviyo via Zapier.",
            "category": "Fonctionnalités"
        },
        {
            "id": 9,
            "question": "Mes données sont-elles sécurisées ?",
            "answer": "Oui. Chiffrement AES-256 pour les données stockées, TLS 1.3 pour les données en transit. Chaque instance client est isolée — tes données ne sont jamais partagées avec d'autres comptes. Serveurs en UE/US, conformité RGPD.",
            "category": "Sécurité"
        },
        {
            "id": 10,
            "question": "Comment supprimer le branding Vendo ?",
            "answer": "En passant sur le plan Growth (49€/mois) ou Agency (249€/mois). Le plan Gratuit maintient le 'Powered by Vendo' de façon non supprimable.",
            "category": "Facturation"
        },
        {
            "id": 11,
            "question": "Le bot peut halluciner ou inventer des infos ?",
            "answer": "Avec une base de connaissances bien configurée, non. Le bot répond UNIQUEMENT avec les infos que tu lui as fournies (système RAG). Si l'info n'est pas dans sa base, il dit qu'il ne sait pas et propose de contacter un humain. Astuce : ajoute dans le system prompt 'Si tu ne sais pas, dis Je vais te connecter avec un conseiller'.",
            "category": "Technique"
        },
        {
            "id": 12,
            "question": "Est-ce qu'il y a une application mobile ?",
            "answer": "Pas encore d'app dédiée, mais le dashboard est entièrement responsive — tu peux gérer tes bots depuis ton téléphone sans problème.",
            "category": "Fonctionnalités"
        },
        {
            "id": 13,
            "question": "Comment upgrader mon plan ?",
            "answer": "Va dans /billing dans ton dashboard. On utilise Stripe (même technologie qu'Uber ou Booking.com). L'upgrade est instantané et sécurisé.",
            "category": "Facturation"
        },
        {
            "id": 14,
            "question": "Je n'ai pas encore de trafic, ça sert à quoi ?",
            "answer": "C'est le meilleur moment pour commencer. Vendo t'aide à capturer les rares visiteurs que tu as déjà. Chaque lead compte quand tu démarres. Commence avec le plan Gratuit — c'est zéro risque et tu construis ta liste d'emails dès le premier visiteur.",
            "category": "Vente"
        },
        {
            "id": 15,
            "question": "Puis-je tester avant de payer ?",
            "answer": "Oui, le plan Gratuit est disponible sans carte bancaire. 1 bot, 1000 messages/mois. C'est suffisant pour valider que la techno fonctionne sur ton site et voir les premiers résultats.",
            "category": "Facturation"
        }
    ],

    "objections": [
        {
            "trigger": ["trop cher", "c'est cher", "prix élevé", "coûte trop", "pas les moyens"],
            "response": "Comparé à quoi ? Un agent support humain coûte 2000€/mois minimum. Vendo te permet des conversations illimitées pour le prix d'un repas au restaurant. Ton volume de support actuel, c'est combien de messages par semaine ?",
            "technique": "Ancrage + Question de qualification"
        },
        {
            "trigger": ["249€ c'est beaucoup", "agency trop cher"],
            "response": "Ce n'est pas un coût, c'est un investissement. Si tu revends juste 3 bots à 100€/mois, tu es déjà rentable. Et tu gardes 100% de la différence. La plupart des agences facturent 2000€ rien que pour le setup. Toi tu as la plateforme complète.",
            "technique": "Reframe investissement + ROI concret"
        },
        {
            "trigger": ["ça marche sur mon site", "compatible", "mon site est custom"],
            "response": "Si ton site est sur internet, oui. C'est littéralement une ligne de JavaScript. Tu as accès au code de ton site ?",
            "technique": "Confirmation + Question de closing"
        },
        {
            "trigger": ["données sécurisées", "confidentiel", "rgpd", "vie privée"],
            "response": "100% sécurisé. Chiffrement AES-256, TLS 1.3, serveurs en Europe, conformité RGPD totale. Chaque instance est isolée — tes données n'ont aucun contact avec d'autres comptes. On peut te fournir notre politique de confidentialité complète.",
            "technique": "Réassurance + Preuve"
        },
        {
            "trigger": ["trop compliqué", "pas technique", "je sais pas coder"],
            "response": "Le setup prend 2 minutes. C'est copier-coller un script dans ton site. On a des guides pas-à-pas pour Shopify, WordPress, Wix, et 15 autres plateformes. Si tu bloques, le support est là. Tu es sur quelle plateforme ?",
            "technique": "Simplification + Réorientation"
        },
        {
            "trigger": ["ralentir site", "performance", "pagespeed"],
            "response": "Aucun impact. Le script est asynchrone — il attend que ton site soit chargé. Impact sur Google PageSpeed < 1%. On utilise un CDN mondial. Ton SEO ne bougera pas.",
            "technique": "Réassurance technique"
        },
        {
            "trigger": ["je réfléchis", "je verrai plus tard", "pas urgent"],
            "response": "Bien sûr, prends le temps. Juste pour t'aider à décider : qu'est-ce qui te fait hésiter ? Le prix, la compatibilité avec ton site, ou autre chose ?",
            "technique": "Identification de la vraie objection"
        },
        {
            "trigger": ["essai gratuit", "test", "tester"],
            "response": "Le plan Gratuit est disponible maintenant, sans carte bancaire. 1 bot, 1000 messages/mois. Tu valides que ça marche sur ton site et tu vois les premiers résultats. Tu veux que je t'aide à démarrer ?",
            "technique": "Redirection vers Free Plan + Close"
        },
        {
            "trigger": ["hallucine", "invente", "fausses infos"],
            "response": "C'est pour ça qu'on utilise le RAG — le bot répond UNIQUEMENT avec les infos que tu lui donnes. Il ne peut pas inventer ce qui n'est pas dans sa base. Et tu peux ajouter dans son system prompt 'Si tu ne sais pas, dis-le.' pour sécuriser encore plus.",
            "technique": "Éducation + Réassurance"
        }
    ],

    "sales_methodology": {
        "core_principle": "Micro-engagements progressifs — obtenir une série de petits 'oui' avant de proposer l'achat",
        "framework": "Empathie → Reformulation → Réponse → Close",
        "rules": [
            "Toujours terminer par une question — ne jamais laisser une conversation sans rebond",
            "Ne jamais attaquer un concurrent nommément — valoriser ses propres atouts",
            "Identifier la vraie objection derrière l'objection exprimée",
            "Utiliser le coût d'opportunité ('combien ça te coûte de ne pas avoir ça ?')"
        ],
        "micro_yes_examples": [
            "Tu vends en B2B ou B2C ? (micro-engagement 1)",
            "Ton volume de support, c'est combien de messages/semaine ? (micro-engagement 2)",
            "Tu es sur Shopify ou autre chose ? (micro-engagement 3 + qualification technique)"
        ],
        "urgency_ethical": [
            "Offre limitée dans le temps (ex: promotion en cours)",
            "Mentionner que les concurrents adoptent déjà la tech",
            "Calculer le coût des leads perdus chaque jour sans Vendo"
        ]
    },

    "use_cases": [
        {
            "sector": "E-commerce / Dropshipping",
            "problem": "Trafic sans conversion, paniers abandonnés",
            "solution": "Bot stylist qui guide, récupération de panier proactive, capture d'emails avec code promo",
            "result_example": "Lumina Fashion : conversion 0.8% → 2.4% (+300%), +15 000€/mois. Coût Vendo : 49€."
        },
        {
            "sector": "SaaS / Tech B2B",
            "problem": "Page pricing incompréhensible, peu de démos bookées",
            "solution": "Bot consultant qui calcule le ROI en temps réel selon la taille de l'équipe",
            "result_example": "TechNova CRM : +40% de démos bookées"
        },
        {
            "sector": "Compléments / Santé",
            "problem": "Méfiance clients sur les ingrédients",
            "solution": "Bot entraîné sur rapports de labo, certificats, FAQ ingrédients",
            "result_example": "GreenLeaf : taux de rebond -15%, tickets support -70%"
        },
        {
            "sector": "Immobilier",
            "problem": "Prospects qui partent sans contacter l'agence",
            "solution": "Bot qui connaît chaque bien (prix, m², charges), réserve des visites automatiquement",
            "pitch": "Les leads immobilier valent 500€+. Vendo les capture instantanément."
        },
        {
            "sector": "Restaurants",
            "problem": "Appels répétitifs pour horaires, réservations, allergènes",
            "solution": "Bot qui répond aux questions, prend les réservations, propose des accords mets/vins",
            "pitch": "Libère le staff pendant le service, upsell automatique."
        },
        {
            "sector": "Coaches / Consultants",
            "problem": "Perdre du temps à qualifier des prospects non adaptés",
            "solution": "Bot qui pré-qualifie (budget, timing, besoin) avant le premier RDV",
            "pitch": "Tu ne parles plus qu'aux prospects qualifiés."
        }
    ],

    "roadmap": [
        {
            "feature": "Mode Vocal",
            "description": "Parler au bot via microphone",
            "status": "À venir"
        },
        {
            "feature": "Automation Instagram DM",
            "description": "Connecter Vendo aux messages directs Instagram",
            "status": "À venir"
        },
        {
            "feature": "Vision API",
            "description": "L'utilisateur envoie une photo → le bot identifie le produit à acheter",
            "status": "À venir"
        },
        {
            "feature": "Auto-Add to Cart (Shopify)",
            "description": "Le bot ajoute des articles au panier automatiquement",
            "status": "À venir"
        },
        {
            "feature": "Custom Domain CNAME",
            "description": "chat.monagence.com pour les revendeurs Agency",
            "status": "Bientôt disponible"
        },
        {
            "feature": "Filtre Sentiment dans les logs",
            "description": "Filtrer les conversations par sentiment Positif / Négatif",
            "status": "Bientôt disponible"
        }
    ],

    "troubleshooting": [
        {
            "problem": "Le bot ne répond pas",
            "solutions": [
                "Vérifier le solde Wallet (doit être > 0€ sur Growth/Agency)",
                "Vérifier la limite mensuelle (1000 messages sur Free — peut être atteinte)",
                "Vérifier le script : l'ID du bot est-il correct ? Ouvrir la console (F12) pour voir les erreurs",
                "Le script est-il bien placé avant </body> ?"
            ]
        },
        {
            "problem": "Le bot invente des informations",
            "solutions": [
                "Vérifier la base de connaissances : pas d'infos contradictoires ?",
                "Ajouter dans le system prompt : 'Si tu ne sais pas, dis exactement : Je vais te connecter avec un conseiller humain'",
                "La température est réglée à 0.3 (basse) par défaut pour la précision factuelle"
            ]
        },
        {
            "problem": "Le widget n'apparaît pas",
            "solutions": [
                "Vider le cache du navigateur (Ctrl+Shift+R)",
                "Vérifier que le script a l'attribut 'defer'",
                "Tester sur un autre navigateur",
                "Vérifier qu'un ad-blocker ne bloque pas le script"
            ]
        },
        {
            "problem": "Comment upgrader ?",
            "solutions": ["Aller sur /billing dans le dashboard", "Paiement via Stripe (sécurisé)", "L'upgrade est instantané"]
        }
    ],

    "security_and_legal": {
        "encryption_at_rest": "AES-256",
        "encryption_in_transit": "TLS 1.3",
        "data_isolation": "Chaque compte est isolé — aucune donnée partagée entre clients",
        "gdpr_compliance": true,
        "servers": "UE et US",
        "data_retention": "30 jours après résiliation",
        "data_deletion_request": "privacy@usevendo.com",
        "payment_processor": "Stripe (certifié PCI-DSS — jamais tes coordonnées bancaires stockées chez Vendo)",
        "ai_providers": ["OpenAI", "DeepSeek", "Anthropic (Claude)"],
        "disclaimer": "Le chatbot interagit avec une IA. Bien que nous visions l'exactitude maximale, vérifiez toujours les informations critiques (prix, dimensions) sur la page produit officielle.",
        "prohibited_uses": "Toute utilisation illégale entraîne un bannissement immédiat et permanent.",
        "gdpr_full_text": "Données collectées : IP (anonymisée), Logs de chat. Finalité : Support client. Durée : 30 jours. Droit d'oubli : contact privacy@usevendo.com. Sous-traitants : Supabase AWS (Frankfurt), OpenAI Ireland Ltd.",
        "tos_snippet": "L'utilisateur s'engage à ne pas utiliser Vendo pour des activités illicites. Vendo se réserve le droit de suspendre tout compte abusif."
    },

    "tech_stack": {
        "frontend": "Next.js 14 (App Router)",
        "backend": "Supabase (PostgreSQL + pgvector)",
        "ai_primary": "DeepSeek V3",
        "ai_fallback": "GPT-4o",
        "embeddings": "OpenAI text-embedding-3-small",
        "styling": "TailwindCSS + Lucide Icons",
        "payments": "Stripe",
        "rag_chunk_size": "500 tokens",
        "rag_similarity": "Cosine Similarity (Nearest Neighbor)",
        "temperature": 0.3
    },

    "comparison_vs_competitors": {
        "positioning_note": "Ne jamais nommer les concurrents — valoriser les atouts Vendo",
        "key_advantages": [
            "Setup en 2 minutes vs des heures de configuration flowchart",
            "Wallet flexible vs forfaits rigides à 200-500€/mois",
            "White-Label inclus dans Agency vs options premium à plusieurs centaines d'euros",
            "RAG natif — répond avec VOS données, pas des généralités",
            "Orienté vente par défaut — pas juste du support"
        ]
    },

    "onboarding_checklist": [
        { "step": 1, "action": "Créer un compte sur usevendo.com" },
        { "step": 2, "action": "Créer son premier bot (nom, avatar, couleur)" },
        { "step": 3, "action": "Configurer le system prompt (ton, règles de comportement)" },
        { "step": 4, "action": "Alimenter la base de connaissances (coller URL du site ou upload PDF)" },
        { "step": 5, "action": "Personnaliser le message de bienvenue" },
        { "step": 6, "action": "Copier le script d'intégration" },
        { "step": 7, "action": "Coller le script sur son site (avant </body>)" },
        { "step": 8, "action": "Tester en live sur le site" },
        { "step": 9, "action": "Configurer le rechargement automatique du Wallet (Growth/Agency)" },
        { "step": 10, "action": "Activer la capture d'emails si pertinent (Growth/Agency)" }
    ],

    "sales_scripts_examples": {
        "hesitant_beginner": "C'est le moment parfait. Vendo capture tes premiers visiteurs. 1000 messages gratuits pour commencer ta liste email.",
        "too_expensive_agency": "C'est un investissement, pas un coût. Vends 3 bots à 100€ et tu es rentable. Tu achètes un 'Business in a Box' complet.",
        "technical_worry": "Aucun ralentissement. Script asynchrone chargé via CDN mondial. Impact invisible sur la vitesse."
    }
}, null, 2)
