export const NATUREL_DATA = {
    system_prompt: `
# SYSTEM PROMPT — Chatbot Naturel

---

## 🧬 IDENTITÉ

Tu es **Léa**, l'assistante beauté de **Naturel** — marque française de soins naturels, vegan et Made in France.

Tu n'es pas un chatbot générique. Tu es une experte en skincare, passionnée, bienveillante et honnête, qui connaît les produits Naturel sur le bout des doigts. Tu parles comme une amie qui s'y connaît en cosmétique — pas comme une fiche produit.

---

## 🎯 MISSION

Tu as trois rôles principaux :

1. **Conseillère beauté** — aider les clients à choisir les bons produits selon leur type de peau et leurs préoccupations
2. **Support client** — répondre aux questions sur les commandes, la livraison, les retours, les paiements
3. **Éducatrice skincare** — expliquer les actifs, les routines, les associations de produits de façon simple et accessible

---

## 🗣️ TON & STYLE

### Ton général
- **Chaleureux mais professionnel** — comme une amie experte, jamais condescendante
- **Direct et concis** — pas de blabla inutile, aller à l'essentiel
- **Rassurant** — les questions beauté peuvent être intimes, accueillir sans juger
- **Enthousiaste sans excès** — pas de "Super !" ou "Excellent !" à chaque phrase

### Ce qu'il faut FAIRE ✅
- Tutoyer le client (ton de marque jeune et accessible)
- Utiliser des phrases courtes et aérées
- Personnaliser les réponses selon le contexte donné par le client
- Proposer proactivement des suggestions pertinentes
- Utiliser occasionnellement des emojis pertinents (🌿 💧 ✨) — avec parcimonie, max 2-3 par message
- Terminer par une question ouverte quand c'est utile pour mieux conseiller

### Ce qu'il faut ÉVITER ❌
- Les formules robotiques : "Bien sûr !", "Absolument !", "Je comprends votre demande"
- Le vouvoiement (sauf si le client vouvoie en premier, s'adapter à lui)
- Les listes à puces systématiques pour tout — alterner avec du texte naturel
- Les réponses trop longues (> 150 mots sauf exception)
- Inventer des informations non présentes dans la base de données
- Dénigrer d'autres marques de cosmétique
- Promettre des résultats médicaux ou thérapeutiques

---

## 📏 LONGUEUR DES RÉPONSES

| Type de question | Longueur cible | Format |
|---|---|---|
| Salutation / small talk | 1-2 phrases | Texte libre |
| Question produit simple | 3-5 phrases | Texte + 1 liste max |
| Conseil de routine | 5-8 phrases | Étapes numérotées |
| Question commande / SAV | 3-6 phrases | Texte clair |
| Explication d'actif | 4-6 phrases | Texte + analogie si utile |
| Problème complexe | 8-12 phrases max | Structuré avec sous-parties |

**Règle d'or : si la réponse dépasse 150 mots, demande-toi si tu peux la couper en deux ou surpprimer le superflu.**

---

## 🧠 BASE DE CONNAISSANCES

Tu as accès à toutes les données du site Naturel (fournies ci-dessous), notamment :
- Produits, Ingrédients, Prix
- Politique de Livraison & Retours
- FAQ & Contact

**Si une information n'est pas dans ta base de données, dis-le clairement et oriente vers le service client (bonjour@naturel.fr / +33 1 23 45 67 89).**

---

## 💬 SCÉNARIOS & COMPORTEMENTS SPÉCIFIQUES

### 1. Recommandation produit
Avant de recommander, pose 1 à 2 questions max si le contexte est insuffisant :
- Type de peau (sèche, grasse, mixte, sensible)
- Préoccupation principale (hydratation, anti-âge, éclat, imperfections)

### 2. Questions sur les ingrédients
Expliquer simplement, sans jargon excessif. Utiliser des analogies quand c'est utile.

### 3. Associations de produits
Toujours vérifier les compatibilités avant de recommander une combinaison. Rappeler les règles clés :
- Vitamine C le matin / Rétinol le soir
- Ne pas combiner vitamine C + niacinamide en même temps
- Rétinol : introduire progressivement

### 4. Grossesse & contre-indications
Être prudente. "Pendant la grossesse, le rétinol est déconseillé. Je te recommande de consulter ton médecin."

### 5. Réclamation / Produit défectueux
Rester empathique. "Envoie-nous une photo du produit à bonjour@naturel.fr avec ton numéro de commande — on te fait un remplacement ou un remboursement immédiatement, sans question."

### 6. Le client compare avec une autre marque
Rester neutre et valoriser Naturel sans attaquer la concurrence.

### 7. Question hors périmètre
"Ça sort un peu de mon domaine d'expertise 😅 Pour ça, je te recommande vraiment de consulter un dermatologue."

---

## 🌟 PHRASES D'ACCROCHE — OUVERTURE

- *"Salut ! Je suis Léa 🌿 Tu cherches le bon soin ou tu as une question sur ta commande ?"*
- *"Bonjour ! Dis-moi tout — type de peau, préoccupations, je suis là pour t'aider à trouver ta routine idéale."*
`,
    "brand": {
        "name": "Naturel",
        "slogan": "Soins naturels, vegan & Made in France",
        "description": "Naturel est une marque française de cosmétiques naturels fondée en 2020. Notre philosophie : des formules courtes (moins de 10 ingrédients), des concentrations d'actifs affichées clairement, des prix accessibles et une transparence totale. Tous nos produits sont fabriqués en France, 100% vegan, sans parfum ajouté, sans parabènes, sans conservateurs inutiles.",
        "founded": 2020,
        "headquarters": "Paris, France",
        "manufacturing": "Fabriqué en France — nos laboratoires sont situés en région Île-de-France",
        "certifications": ["Vegan Society", "COSMOS Certified", "Cruelty-Free", "Made in France"],
        "values": [
            "Transparence totale des ingrédients et concentrations",
            "Formules courtes — moins de 10 ingrédients par produit",
            "100% Vegan et Cruelty-Free",
            "Emballages recyclables et éco-responsables",
            "Prix justes sans marges injustifiées",
            "Zéro parfum ajouté, zéro parabènes"
        ],
        "contact": {
            "email": "bonjour@naturel.fr",
            "phone": "+33 1 23 45 67 89",
            "hours": "Lundi–Vendredi 9h–18h",
            "address": "15 rue de la Paix, 75001 Paris, France",
            "social": {
                "instagram": "@naturel.fr",
                "tiktok": "@naturel.fr",
                "youtube": "Naturel Skincare"
            }
        },
        "stats": {
            "products_sold": "3 200 000+",
            "customer_reviews": "50 000+",
            "average_rating": 4.8,
            "ingredients_max_per_product": 10,
            "years_rnd": 3
        }
    },

    "products": [
        {
            "id": 1,
            "name": "Sérum Acide Hyaluronique 3%",
            "category": "Sérum visage",
            "sku": "NAT-SER-AH3",
            "price": 16.90,
            "size": "30ml",
            "badge": "Best-seller",
            "short_description": "Hydratation intense en profondeur",
            "full_description": "Notre sérum à l'acide hyaluronique 3% est une formule ultra-concentrée qui booste immédiatement l'hydratation cutanée. L'acide hyaluronique retient jusqu'à 1000 fois son poids en eau, comblant les ridules de déshydratation dès les premières applications.",
            "key_ingredients": [
                { "name": "Acide hyaluronique", "concentration": "3%", "benefit": "Hydratation intense, comblement des ridules" },
                { "name": "Provitamine B5 (Panthénol)", "concentration": "2%", "benefit": "Adoucissement, régénération" },
                { "name": "Eau thermale", "concentration": null, "benefit": "Apaisement, base purifiée" }
            ],
            "full_inci": "Aqua, Sodium Hyaluronate, Panthenol, Glycerin, Phenoxyethanol, Ethylhexylglycerin",
            "ingredients_count": 6,
            "skin_types": ["Tous types de peau", "Peau déshydratée", "Peau mature"],
            "concerns": ["Déshydratation", "Ridules superficielles", "Manque d'éclat"],
            "how_to_use": "Appliquer matin et/ou soir sur peau propre et légèrement humide. Déposer 3 à 4 gouttes et tapoter délicatement jusqu'à absorption complète. Suivre d'une crème hydratante.",
            "texture": "Gel aqueux, texture légère",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "results_timeline": {
                "immediate": "Peau repulpée et confortable",
                "2_weeks": "Ridules de déshydratation atténuées",
                "4_weeks": "Hydratation durablement améliorée"
            },
            "stock_status": "En stock",
            "available_sizes": ["30ml — 16,90 €"],
            "rating": 4.9,
            "reviews_count": 12400
        },
        {
            "id": 2,
            "name": "Sérum Niacinamide 10%",
            "category": "Sérum visage",
            "sku": "NAT-SER-NIA10",
            "price": 14.90,
            "size": "30ml",
            "badge": "Nouveau",
            "short_description": "Pores affinés, éclat unifié",
            "full_description": "Le niacinamide (vitamine B3) est l'un des actifs les plus polyvalents en cosmétique. À 10%, il resserre les pores, régule la production de sébum, unifie le teint et atténue les taches. Associé au zinc PCA, il offre une action anti-imperfections renforcée.",
            "key_ingredients": [
                { "name": "Niacinamide (Vitamine B3)", "concentration": "10%", "benefit": "Pores affinés, teint unifié, contrôle du sébum" },
                { "name": "Zinc PCA", "concentration": "1%", "benefit": "Régulation sébacée, anti-imperfections" },
                { "name": "Aloe Vera bio", "concentration": "5%", "benefit": "Apaisement, hydratation légère" }
            ],
            "full_inci": "Aqua, Niacinamide, Aloe Barbadensis Leaf Juice, Zinc PCA, Glycerin, Phenoxyethanol, Ethylhexylglycerin",
            "ingredients_count": 7,
            "skin_types": ["Peau grasse", "Peau mixte", "Peau à imperfections"],
            "concerns": ["Pores dilatés", "Taches", "Excès de sébum", "Teint terne"],
            "how_to_use": "Appliquer matin et soir après nettoyage sur peau sèche. 3 à 4 gouttes sur le visage, éviter le contour des yeux. Ne pas combiner avec de la vitamine C pure lors de la même application.",
            "texture": "Sérum liquide, non collant",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "results_timeline": {
                "immediate": "Teint plus mat",
                "2_weeks": "Pores visiblement affinés",
                "4_weeks": "Taches atténuées, teint unifié"
            },
            "stock_status": "En stock",
            "available_sizes": ["30ml — 14,90 €"],
            "rating": 4.8,
            "reviews_count": 8700
        },
        {
            "id": 3,
            "name": "Crème Hydratante Légère",
            "category": "Crème visage",
            "sku": "NAT-CRE-HYD",
            "price": 22.90,
            "size": "50ml",
            "badge": null,
            "short_description": "Texture gel, toutes peaux",
            "full_description": "Notre crème hydratante légère texture gel-crème convient à tous les types de peau. Elle apporte confort et hydratation sans alourdir, grâce au beurre de karité en faible concentration et au squalane végétal (dérivé d'olive).",
            "key_ingredients": [
                { "name": "Beurre de karité", "concentration": "3%", "benefit": "Nutrition, confort, protection" },
                { "name": "Squalane végétal (olive)", "concentration": "3%", "benefit": "Hydratation non grasse, renfort barrière" },
                { "name": "Allantoïne", "concentration": "0.5%", "benefit": "Apaisement, régénération" }
            ],
            "full_inci": "Aqua, Glycerin, Butyrospermum Parkii Butter, Squalane, Allantoin, Cetearyl Alcohol, Phenoxyethanol, Ethylhexylglycerin",
            "ingredients_count": 8,
            "skin_types": ["Tous types de peau", "Peau normale à mixte", "Peau sensible"],
            "concerns": ["Hydratation quotidienne", "Confort cutané", "Protection barrière"],
            "how_to_use": "Appliquer matin et/ou soir en dernière étape de votre routine, après sérums. Masser en mouvements circulaires jusqu'à absorption.",
            "texture": "Gel-crème légère",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "results_timeline": {
                "immediate": "Peau confortable et non grasse",
                "2_weeks": "Hydratation optimale, peau lisse",
                "4_weeks": "Barrière cutanée renforcée"
            },
            "stock_status": "En stock",
            "available_sizes": ["50ml — 22,90 €"],
            "rating": 4.7,
            "reviews_count": 5600
        },
        {
            "id": 4,
            "name": "Sérum Vitamine C Stable 10%",
            "category": "Sérum visage",
            "sku": "NAT-SER-VIC10",
            "price": 18.90,
            "size": "30ml",
            "badge": null,
            "short_description": "Éclat & protection antioxydante",
            "full_description": "Notre sérum vitamine C utilise une forme stable d'ascorbyl glucoside (10%) qui ne s'oxyde pas à l'air. Il protège la peau des radicaux libres, illumine le teint et atténue les taches pigmentaires progressivement.",
            "key_ingredients": [
                { "name": "Ascorbyl Glucoside (Vit. C stable)", "concentration": "10%", "benefit": "Éclat, anti-taches, antioxydant" },
                { "name": "Vitamine E (Tocophérol)", "concentration": "1%", "benefit": "Renforce l'action de la vit. C, antioxydant" },
                { "name": "Acide férulique", "concentration": "0.5%", "benefit": "Booste l'efficacité de la vitamine C" }
            ],
            "full_inci": "Aqua, Ascorbyl Glucoside, Glycerin, Tocopherol, Ferulic Acid, Propanediol, Phenoxyethanol, Ethylhexylglycerin",
            "ingredients_count": 8,
            "skin_types": ["Tous types de peau", "Peau terne", "Peau avec taches"],
            "concerns": ["Teint terne", "Taches pigmentaires", "Protection antioxydante"],
            "how_to_use": "Appliquer de préférence le matin sur peau propre avant la crème et la protection solaire. Ne pas combiner avec niacinamide dans la même couche.",
            "texture": "Sérum léger légèrement teinté (jaune pâle)",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "stock_status": "En stock",
            "available_sizes": ["30ml — 18,90 €"],
            "rating": 4.7,
            "reviews_count": 4200
        },
        {
            "id": 5,
            "name": "Huile Sèche Corps",
            "category": "Soin corps",
            "sku": "NAT-CORP-HUI",
            "price": 19.90,
            "size": "100ml",
            "badge": null,
            "short_description": "Légère, non grasse, absorbée rapidement",
            "full_description": "Notre huile sèche corps est un mélange d'huiles végétales légères qui s'absorbent immédiatement sans laisser de film gras. Elle nourrit, protège et sublime la peau du corps avec un fini satiné.",
            "key_ingredients": [
                { "name": "Squalane végétal (olive)", "concentration": "40%", "benefit": "Légèreté, absorption rapide" },
                { "name": "Huile de jojoba bio", "concentration": "30%", "benefit": "Nutrition, équilibre sébacé" },
                { "name": "Huile d'argan bio", "concentration": "20%", "benefit": "Éclat, nutrition profonde" }
            ],
            "full_inci": "Squalane, Simmondsia Chinensis Seed Oil, Argania Spinosa Kernel Oil, Tocopherol",
            "ingredients_count": 4,
            "skin_types": ["Tous types de peau", "Peau sèche", "Peau normale"],
            "concerns": ["Sécheresse corporelle", "Nutrition", "Éclat de la peau"],
            "how_to_use": "Appliquer après la douche sur peau encore légèrement humide. Masser en mouvements circulaires. Peut aussi être ajoutée à l'eau du bain.",
            "texture": "Huile sèche non grasse",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "stock_status": "En stock",
            "available_sizes": ["100ml — 19,90 €"],
            "rating": 4.8,
            "reviews_count": 3100
        },
        {
            "id": 6,
            "name": "Masque Argile Verte Détox",
            "category": "Masque visage",
            "sku": "NAT-MAS-ARG",
            "price": 12.90,
            "size": "75ml",
            "badge": null,
            "short_description": "Détox & pores nettoyés en profondeur",
            "full_description": "Ce masque à l'argile verte ultrasurfine absorbe l'excès de sébum, resserre les pores et détoxifie la peau. Le charbon actif renforce l'action purifiante. L'acide salicylique à 1% complète le traitement des imperfections.",
            "key_ingredients": [
                { "name": "Argile verte ultrasurfine", "concentration": "20%", "benefit": "Absorption du sébum, purification" },
                { "name": "Charbon actif végétal", "concentration": "2%", "benefit": "Détox, désincruste les pores" },
                { "name": "Acide salicylique", "concentration": "1%", "benefit": "Exfoliation chimique douce, anti-imperfections" }
            ],
            "full_inci": "Aqua, Kaolin, Bentonite, Charcoal Powder, Salicylic Acid, Glycerin, Allantoin, Phenoxyethanol",
            "ingredients_count": 8,
            "skin_types": ["Peau grasse", "Peau mixte", "Peau à imperfections"],
            "concerns": ["Pores bouchés", "Points noirs", "Excès de sébum"],
            "how_to_use": "Appliquer en couche épaisse sur peau propre et sèche, en évitant le contour des yeux et des lèvres. Laisser poser 10 à 15 minutes. Rincer à l'eau tiède. Utiliser 1 à 2 fois par semaine maximum.",
            "texture": "Crème épaisse",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "stock_status": "En stock",
            "available_sizes": ["75ml — 12,90 €"],
            "rating": 4.6,
            "reviews_count": 2800
        },
        {
            "id": 7,
            "name": "Rétinol Vegan 0.5%",
            "category": "Sérum visage",
            "sku": "NAT-SER-RET05",
            "price": 24.90,
            "size": "30ml",
            "badge": null,
            "short_description": "Anti-âge progressif, rénovation cellulaire",
            "full_description": "Notre rétinol d'origine végétale (bakuchiol + rétinol synthétique vegan) stimule le renouvellement cellulaire, atténue les rides, améliore la fermeté et l'éclat. La concentration de 0.5% est idéale pour débuter ou pour peaux sensibles.",
            "key_ingredients": [
                { "name": "Rétinol vegan", "concentration": "0.5%", "benefit": "Renouvellement cellulaire, anti-rides" },
                { "name": "Squalane végétal", "concentration": "5%", "benefit": "Apaisement, nutrition, tamponne le rétinol" },
                { "name": "Vitamine E", "concentration": "1%", "benefit": "Antioxydant, protection cellulaire" }
            ],
            "full_inci": "Aqua, Squalane, Retinol, Glycerin, Tocopherol, Caprylic/Capric Triglyceride, Phenoxyethanol, Ethylhexylglycerin",
            "ingredients_count": 8,
            "skin_types": ["Peau mature", "Peau normale à sèche", "Peaux avec rides"],
            "concerns": ["Rides et ridules", "Perte de fermeté", "Renouvellement cellulaire", "Taches"],
            "how_to_use": "Appliquer le soir uniquement sur peau propre et sèche. Commencer par 2 à 3 fois par semaine, puis augmenter progressivement. Toujours appliquer une protection solaire SPF30+ le matin. Déconseillé pendant la grossesse.",
            "texture": "Sérum fluide légèrement huileux",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "warning": "Déconseillé pendant la grossesse et l'allaitement. Utilisation nocturne uniquement. Appliquer SPF le matin obligatoirement.",
            "stock_status": "En stock",
            "available_sizes": ["30ml — 24,90 €"],
            "rating": 4.9,
            "reviews_count": 6700
        },
        {
            "id": 8,
            "name": "Huile Capillaire Réparatrice",
            "category": "Soin cheveux",
            "sku": "NAT-CAP-HUI",
            "price": 15.90,
            "size": "50ml",
            "badge": "Nouveau",
            "short_description": "Brillance, nutrition et réparation",
            "full_description": "Cette huile capillaire légère nourrit et répare les cheveux abîmés et secs. La kératine végane renforce la fibre capillaire, l'huile de ricin apporte brillance et force, l'huile d'argan nourrit en profondeur.",
            "key_ingredients": [
                { "name": "Huile de ricin", "concentration": "35%", "benefit": "Force, brillance, croissance" },
                { "name": "Kératine vegan", "concentration": "5%", "benefit": "Réparation de la fibre capillaire" },
                { "name": "Huile d'argan bio", "concentration": "30%", "benefit": "Nutrition, anti-frisottis" }
            ],
            "full_inci": "Ricinus Communis Seed Oil, Argania Spinosa Kernel Oil, Hydrolyzed Wheat Protein (Vegan Keratin), Tocopherol",
            "ingredients_count": 4,
            "hair_types": ["Cheveux secs", "Cheveux abîmés", "Cheveux colorés", "Tous types"],
            "concerns": ["Sécheresse capillaire", "Frisottis", "Manque de brillance", "Pointes sèches"],
            "how_to_use": "En pré-shampoing : appliquer sur cheveux secs, laisser poser 30 min à 1h, shampouiner normalement. En coiffant : appliquer une noisette sur les pointes sèches pour les nourrir et dompter les frisottis.",
            "texture": "Huile sèche légère",
            "fragrance": "Sans parfum",
            "vegan": true,
            "cruelty_free": true,
            "recyclable_packaging": true,
            "made_in": "France",
            "stock_status": "En stock",
            "available_sizes": ["50ml — 15,90 €"],
            "rating": 4.7,
            "reviews_count": 1800
        }
    ],

    "shipping": {
        "free_shipping_threshold": 45.00,
        "free_shipping_threshold_display": "45,00 €",
        "carriers": [
            {
                "name": "Colissimo (La Poste)",
                "delay": "2 à 3 jours ouvrés",
                "price": 4.90,
                "tracking": true
            },
            {
                "name": "Chronopost Express",
                "delay": "24h (commande passée avant 14h)",
                "price": 7.90,
                "tracking": true
            },
            {
                "name": "Retrait en point relais (Mondial Relay)",
                "delay": "3 à 5 jours ouvrés",
                "price": 3.50,
                "tracking": true
            },
            {
                "name": "Livraison internationale (UE)",
                "delay": "5 à 10 jours ouvrés",
                "price": 9.90,
                "tracking": true
            }
        ],
        "processing_time": "Les commandes passées avant 14h sont expédiées le jour même (jours ouvrés). Après 14h ou le week-end, expédition le prochain jour ouvré.",
        "countries": ["France métropolitaine", "Belgique", "Luxembourg", "Suisse", "Allemagne", "Espagne", "Italie", "Pays-Bas", "Portugal", "et +30 pays UE"],
        "packaging": "Nos colis sont emballés dans des matériaux 100% recyclables — papier kraft, papier de soie recyclé, sans plastique.",
        "notes": "Les délais de livraison sont indicatifs et peuvent varier selon la période (fêtes, soldes). Toute commande est accompagnée d'un numéro de suivi envoyé par email."
    },

    "returns": {
        "return_window_days": 30,
        "return_policy": "Vous disposez de 30 jours à compter de la réception de votre commande pour nous retourner un produit non ouvert et dans son état d'origine.",
        "conditions": [
            "Le produit doit être non ouvert et non utilisé",
            "L'emballage d'origine doit être intact",
            "Le retour doit être effectué dans les 30 jours suivant la réception",
            "Un bon de retour doit être demandé au préalable par email"
        ],
        "how_to_return": "1. Envoyer un email à retours@naturel.fr avec votre numéro de commande. 2. Nous vous envoyons un bon de retour prépayé. 3. Déposez le colis en bureau de poste. 4. Remboursement sous 5 à 7 jours ouvrés après réception.",
        "refund_method": "Remboursement sur le moyen de paiement original",
        "refund_delay": "5 à 7 jours ouvrés après réception du retour",
        "exceptions": [
            "Produits ouverts ou utilisés non remboursables (sauf défaut produit)",
            "Coffrets personnalisés non remboursables",
            "Produits en promotion finale (hors SAV)"
        ],
        "damaged_product": "En cas de produit reçu endommagé ou défectueux, nous procédons à un remplacement immédiat ou un remboursement intégral. Joindre une photo du produit à bonjour@naturel.fr."
    },

    "payment": {
        "methods": [
            { "name": "Carte bancaire (Visa, Mastercard, Amex)", "instant": true },
            { "name": "PayPal", "instant": true },
            { "name": "Apple Pay", "instant": true },
            { "name": "Google Pay", "instant": true },
            { "name": "Virement bancaire", "delay": "2 à 3 jours ouvrés" },
            { "name": "Klarna (paiement en 3 fois sans frais)", "condition": "Dès 30€ d'achat" }
        ],
        "security": "Toutes les transactions sont sécurisées par cryptage SSL 256 bits. Nous ne stockons jamais vos données de carte bancaire.",
        "currency": "EUR (€)",
        "invoicing": "Une facture est automatiquement envoyée par email après chaque commande."
    },

    "loyalty_program": {
        "name": "Naturel Club",
        "description": "Programme de fidélité gratuit permettant de cumuler des points à chaque achat.",
        "points_earning": "1€ dépensé = 1 point",
        "points_redemption": "100 points = 5€ de réduction",
        "tiers": [
            { "name": "Essentiel", "min_points": 0, "benefits": ["Points x1", "Accès aux ventes privées"] },
            { "name": "Précieux", "min_points": 500, "benefits": ["Points x1.5", "Livraison offerte dès 30€", "Produits offerts anniversaire"] },
            { "name": "Rare", "min_points": 1500, "benefits": ["Points x2", "Livraison toujours offerte", "Accès aux nouvelles formules en avant-première", "Service client prioritaire"] }
        ],
        "how_to_join": "Créer un compte sur naturel.fr, l'inscription est automatique et gratuite."
    },

    "faq": [
        {
            "question": "Vos produits sont-ils vraiment 100% vegan ?",
            "answer": "Oui, absolument. Tous nos produits sont certifiés Vegan Society. Aucun ingrédient d'origine animale (cire d'abeille, kératine animale, collagène animal, etc.) n'est utilisé dans nos formules. Nos tests sont également réalisés sans cruauté envers les animaux.",
            "category": "Produits"
        },
        {
            "question": "Pourquoi affichez-vous les concentrations de vos actifs ?",
            "answer": "La transparence est au cœur de notre philosophie. Dans l'industrie cosmétique, les concentrations d'actifs sont rarement communiquées. Nous affichons les nôtres pour que vous sachiez exactement ce que vous appliquez sur votre peau et puissiez évaluer l'efficacité réelle du produit.",
            "category": "Produits"
        },
        {
            "question": "Combien d'ingrédients y a-t-il dans vos formules ?",
            "answer": "Nos formules contiennent entre 4 et 10 ingrédients maximum. Nous croyons que moins d'ingrédients = moins de risques d'irritation et plus d'efficacité pour chaque actif. La liste INCI complète est disponible sur chaque page produit.",
            "category": "Produits"
        },
        {
            "question": "Vos produits contiennent-ils du parfum ?",
            "answer": "Non. Aucun de nos produits ne contient de parfum ajouté (ni synthétique ni naturel). Le parfum est l'une des premières causes d'allergie cosmétique. Certains produits ont une légère odeur naturelle provenant de leurs ingrédients (ex: huile d'argan), mais ce n'est pas un ajout intentionnel.",
            "category": "Produits"
        },
        {
            "question": "Puis-je utiliser plusieurs sérums en même temps ?",
            "answer": "Oui, mais avec quelques précautions. Certains actifs ne doivent pas être combinés dans la même couche : la vitamine C (matin) et le niacinamide (soir de préférence), le rétinol (soir uniquement) avec d'autres actifs exfoliants. Nous recommandons de consulter notre guide de layering disponible sur le blog.",
            "category": "Conseils"
        },
        {
            "question": "Puis-je utiliser le rétinol si je suis enceinte ?",
            "answer": "Non. Le rétinol est contre-indiqué pendant la grossesse et l'allaitement. Nous vous recommandons de consulter votre médecin ou dermatologue pour une alternative adaptée. Des alternatives sûres pendant la grossesse incluent le bakuchiol (effet similaire).",
            "category": "Conseils"
        },
        {
            "question": "Comment savoir quelle routine est faite pour moi ?",
            "answer": "Utilisez notre diagnostic de peau disponible sur le site (3 questions simples). Vous pouvez également contacter notre équipe de conseil beauté par email ou chat pour une recommandation personnalisée gratuite.",
            "category": "Conseils"
        },
        {
            "question": "Quelle est la durée de vie de vos produits ?",
            "answer": "Nos produits ont une durée de conservation de 24 mois avant ouverture (date inscrite sur l'emballage). Après ouverture, référez-vous au symbole PAO (pot ouvert) indiqué sur le packaging : 6M = 6 mois, 12M = 12 mois. Conservez vos produits à l'abri de la chaleur et de la lumière directe.",
            "category": "Produits"
        },
        {
            "question": "Où sont fabriqués vos produits ?",
            "answer": "Tous nos produits sont fabriqués en France, dans nos laboratoires partenaires situés en région Île-de-France. Nous sommes fiers du label Made in France et travaillons avec des fournisseurs d'ingrédients certifiés durables, majoritairement européens.",
            "category": "Marque"
        },
        {
            "question": "Ma commande est-elle sécurisée ?",
            "answer": "Oui. Notre site est sécurisé par un certificat SSL. Toutes les transactions bancaires sont cryptées (256 bits). Nous ne stockons jamais vos coordonnées bancaires. Nos paiements sont traités par Stripe et PayPal, des leaders mondiaux du paiement sécurisé.",
            "category": "Commande"
        },
        {
            "question": "Puis-je modifier ou annuler ma commande ?",
            "answer": "Une commande peut être modifiée ou annulée uniquement si elle n'a pas encore été expédiée. Contactez-nous au plus vite à bonjour@naturel.fr ou par téléphone au +33 1 23 45 67 89 (lun-ven 9h-18h). Après expédition, il faut procéder à un retour.",
            "category": "Commande"
        },
        {
            "question": "Avez-vous des produits pour peaux sensibles ?",
            "answer": "Oui. Tous nos produits sont sans parfum et formulés sans parabènes, ce qui les rend généralement bien tolérés par les peaux sensibles. Le sérum acide hyaluronique, la crème hydratante légère et l'huile sèche corps sont particulièrement adaptés aux peaux sensibles. Pour le rétinol ou la vitamine C, introduisez-les progressivement et faites un test dans le creux du coude avant utilisation.",
            "category": "Conseils"
        },
        {
            "question": "Comment fonctionne votre programme de fidélité ?",
            "answer": "Le Naturel Club est gratuit et automatique à la création d'un compte. Vous gagnez 1 point par euro dépensé. 100 points = 5€ de réduction. Trois niveaux : Essentiel (0 pts), Précieux (500 pts) et Rare (1500 pts) avec des avantages exclusifs à chaque palier.",
            "category": "Fidélité"
        },
        {
            "question": "Livrez-vous à l'international ?",
            "answer": "Oui, nous livrons dans plus de 30 pays en Europe. La livraison internationale est à 9,90€ et gratuite dès 80€ d'achat pour les pays UE. Les délais sont de 5 à 10 jours ouvrés selon le pays. Pour les pays hors UE, contactez-nous directement.",
            "category": "Livraison"
        },
        {
            "question": "Proposez-vous des coffrets cadeaux ?",
            "answer": "Oui ! Nous proposons des coffrets cadeaux prêts à offrir (boîte kraft avec ruban), disponibles sur le site dans la section Coffrets. Vous pouvez également personnaliser votre coffret en choisissant les produits. Un message cadeau manuscrit est inclus gratuitement sur demande.",
            "category": "Commande"
        }
    ],

    "routines": {
        "morning_basic": {
            "name": "Routine matin essentielle",
            "steps": [
                { "step": 1, "product": "Nettoyant doux (non vendu seul)", "note": "Nettoyage léger le matin" },
                { "step": 2, "product_id": 4, "product": "Sérum Vitamine C 10%", "note": "Éclat et protection antioxydante" },
                { "step": 3, "product_id": 3, "product": "Crème Hydratante Légère", "note": "Hydratation et protection" },
                { "step": 4, "product": "SPF 30+ (conseillé)", "note": "Protection solaire indispensable, non vendu chez Naturel" }
            ]
        },
        "evening_basic": {
            "name": "Routine soir essentielle",
            "steps": [
                { "step": 1, "product": "Nettoyant double (huile + eau)", "note": "Double nettoyage recommandé le soir" },
                { "step": 2, "product_id": 1, "product": "Sérum Acide Hyaluronique 3%", "note": "Sur peau légèrement humide" },
                { "step": 3, "product_id": 3, "product": "Crème Hydratante Légère", "note": "Scelle l'hydratation" }
            ]
        },
        "antiage": {
            "name": "Routine anti-âge (soir)",
            "steps": [
                { "step": 1, "product": "Nettoyant doux" },
                { "step": 2, "product_id": 1, "product": "Sérum AH 3%", "note": "Sur peau humide" },
                { "step": 3, "product_id": 7, "product": "Rétinol 0.5%", "note": "2 à 3 fois par semaine max en commençant" },
                { "step": 4, "product_id": 3, "product": "Crème Hydratante", "note": "Tampon le rétinol, nourrit" }
            ]
        },
        "anti_imperfections": {
            "name": "Routine anti-imperfections",
            "steps": [
                { "step": 1, "product_id": 2, "product": "Sérum Niacinamide 10%", "note": "Matin et soir" },
                { "step": 2, "product_id": 6, "product": "Masque Argile 2x/semaine", "note": "En étape soin 1 à 2 fois par semaine" },
                { "step": 3, "product_id": 3, "product": "Crème Hydratante Légère", "note": "Même peau grasse a besoin d'hydratation" }
            ]
        },
    },

    "ingredients_glossary": [
        {
            "name": "Acide Hyaluronique (Sodium Hyaluronate)",
            "description": "Molécule naturellement présente dans la peau qui retient jusqu'à 1000x son poids en eau. Comble les ridules de déshydratation et repulpe.",
            "found_in_products": [1],
            "safe_for": ["Tous types de peau", "Grossesse"]
        },
        {
            "name": "Niacinamide (Vitamine B3)",
            "description": "Actif polyvalent qui réduit les pores, régule le sébum, unifie le teint et renforce la barrière cutanée.",
            "found_in_products": [2],
            "safe_for": ["Tous types de peau", "Grossesse (avec avis médical)"]
        },
        {
            "name": "Rétinol",
            "description": "Dérivé de la vitamine A, c'est l'actif anti-âge le plus documenté scientifiquement. Stimule le collagène et accélère le renouvellement cellulaire.",
            "found_in_products": [7],
            "safe_for": ["Peau normale, sèche, mature"],
            "avoid_if": ["Grossesse", "Allaitement", "Peau très sensible (sans avis dermato)"]
        },
        {
            "name": "Vitamine C (Ascorbyl Glucoside)",
            "description": "Forme stable de la vitamine C. Antioxydant puissant qui protège, illumine et atténue les taches.",
            "found_in_products": [4],
            "safe_for": ["Tous types de peau"]
        },
        {
            "name": "Squalane végétal",
            "description": "Dérivé d'olive, biocompatible avec la peau. Nourrit et protège sans occlusion. Ultra-léger.",
            "found_in_products": [5, 7],
            "safe_for": ["Tous types de peau", "Grossesse"]
        },
        {
            "name": "Acide Salicylique (BHA)",
            "description": "Exfoliant chimique liposoluble qui pénètre dans les pores pour les désincruster et réduire les imperfections.",
            "found_in_products": [6],
            "avoid_if": ["Grossesse", "Peau très sensible (à concentrations élevées)"]
        }
    ],

    "promotions": {
        "current_offers": [
            {
                "code": "BIENVENUE10",
                "description": "10% de réduction sur la première commande",
                "condition": "Valable pour les nouveaux clients uniquement, sans minimum d'achat",
                "expiry": "Sans date d'expiration"
            },
            {
                "code": "ROUTINE3",
                "description": "20% de réduction pour l'achat de 3 produits ou plus",
                "condition": "Réduction automatique dans le panier, sans code nécessaire",
                "expiry": "Offre permanente"
            }
        ],
        "permanent_offers": [
            "Livraison gratuite dès 45€ d'achat",
            "Échantillons offerts à chaque commande (2 échantillons au choix)",
            "Cadeau de bienvenue pour toute première commande (miniature sérum AH)"
        ]
    },

    "customer_service": {
        "channels": [
            { "type": "Email", "contact": "bonjour@naturel.fr", "response_time": "Sous 24h ouvrées" },
            { "type": "Chat en ligne", "availability": "Lundi–Vendredi 9h–18h", "response_time": "Immédiat" },
            { "type": "Téléphone", "contact": "+33 1 23 45 67 89", "availability": "Lundi–Vendredi 9h–18h" },
            { "type": "Instagram DM", "contact": "@naturel.fr", "response_time": "Sous 48h" }
        ],
        "team": "Notre équipe est composée de passionnés de cosmétique et d'une pharmacienne conseil disponible pour toute question sur les actifs ou les associations de produits.",
        "languages": ["Français", "Anglais"]
    },

    "sustainability": {
        "packaging": "Nos flacons sont en verre ou en plastique recyclé (PCR). Nos cartons sont en papier FSC certifié. Nos colis sont sans plastique à usage unique.",
        "refill_program": "Programme de recharge disponible pour la Crème Hydratante et l'Huile Sèche Corps. Économisez 30% et réduisez vos déchets.",
        "carbon_footprint": "Nous compensons 100% de nos émissions de CO2 liées au transport via un partenariat avec Ecotree.",
        "suppliers": "Nos ingrédients sont sourcés auprès de fournisseurs certifiés durables, principalement européens. Aucun ingrédient issu d'espèces menacées.",
        "biodegradability": "Toutes nos formules sont biodégradables."
    }
}
