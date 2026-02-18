# Intégration Universelle Vendo 🌐

Vendo est conçu pour fonctionner sur n'importe quel site web. Voici comment l'intégrer en quelques secondes.

## 🤝 Guide d'installation rapide

### 1. Boutique Shopify
- Installez l'extension Chrome Vendo (Bientôt) ou utilisez un **App Block** dans votre éditeur de thème.
- Collez votre **ID Chatbot** dans les paramètres.

### 2. WordPress, Wix, Webflow (ou HTML pur)
Copiez et collez le code suivant juste avant la balise fermante `</body>` de votre site :

```html
<!-- Script Vendo Assistant -->
<script 
  src="https://votre-domaine-vercel.app/embed.js" 
  data-chatbot-id="VOTRE_ID_CHATBOT"
  defer>
</script>
```

### 3. WhatsApp (Plan Agence)
- Connectez votre page Facebook Business dans l'onglet **Marketing WhatsApp**.
- Votre IA répondra automatiquement aux messages entrants sur votre numéro WhatsApp Business.

---

## 🚀 Pourquoi cette méthode ?
- **Performance** : Le script ne pèse que quelques ko et se charge après le reste du site.
- **Mises à jour auto** : Les changements que vous faites dans le dashboard Vendo sont appliqués instantanément sur votre site.
- **Sécurité** : Les requêtes sont sécurisées et votre clé API n'est jamais exposée.
