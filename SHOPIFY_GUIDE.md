# 🛍️ Guide Shopify pour Vendo

Ce guide vous explique comment transformer votre projet en une véritable application Shopify disponible sur l'App Store.

## 1. Créer un Compte Shopify Partner (Gratuit)
1. Rendez-vous sur [Shopify Partners](https://www.shopify.com/fr/partners).
2. Cliquez sur **Rejoindre maintenant** (totalement gratuit).
3. Cliquez sur **Applications** dans le menu de gauche, puis **Créer une application**.

## 2. Déployer l'Extension Vendo
L'extension que j'ai créée dans le dossier `/shopify/extension` est ce qui permet aux marchands d'ajouter Vendo sans coder.

### Avec la Shopify CLI :
Si vous avez Node.js installé, vous pouvez utiliser les commandes suivantes dans votre terminal :

```bash
# Se connecter à votre compte partner
npx shopify auth login

# Lier le projet (suivez les instructions pour choisir votre app)
npx shopify app deploy
```

## 3. Pourquoi c'est "Elite" ?
- **Sans Code** : Vos clients activent Vendo depuis leur éditeur de thème Shopify.
- **SaaS Natif** : L'app s'intègre parfaitement dans l'écosystème Shopify.
- **Scalable** : Prêt pour des milliers de boutiques.

---
*Note : Si vous avez besoin d'aide pour l'approbation sur l'App Store, n'hésitez pas à me demander !*
