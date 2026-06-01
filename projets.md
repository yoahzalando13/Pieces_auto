# Projet Pieces Auto

## But du projet

Pieces Auto est une plateforme e-commerce specialisee dans les pieces et equipements automobiles. Le projet vise a reunir dans une seule application la consultation des produits, la recherche intelligente, le panier, la commande, le paiement, la livraison et les services pour vendeurs et administrateurs.

L objectif principal est de simplifier l achat de pieces auto en aidant l utilisateur a trouver rapidement le bon produit, puis a suivre tout le cycle jusqu a la livraison.

## Problemes que le projet resout

- Faciliter la recherche de pieces compatibles avec un vehicule.
- Centraliser un catalogue de pieces, categories et boutiques.
- Permettre aux clients de gerer un panier, passer commande et suivre les paiements.
- Donner aux vendeurs un espace de gestion pour leurs produits et leur boutique.
- Offrir aux administrateurs des outils de supervision et de moderation.
- Ajouter de la recherche par image et des recommandations pour accelerer l identification d une piece.

## Architecture generale

Le projet est organise en trois blocs principaux :

### 1. Frontend

Le dossier `frontend/` contient l interface utilisateur en React avec Vite. Il gere :

- la connexion et l inscription,
- la navigation entre les pages,
- l affichage des produits et du detail produit,
- le panier,
- le profil utilisateur,
- les vues vendeur et administrateur,
- l integration avec l API backend via Axios.

Le front suit un style visuel premium et sombre, documente dans `STYLING_GUIDE.md`.

### 2. Backend

Le dossier `pieces-auto-backend/` contient une API Spring Boot securisee par JWT. C est le coeur metier du projet. Il expose des endpoints pour :

- l authentification et le profil utilisateur,
- la gestion des produits, categories et compatibilites vehicules,
- le panier et la commande,
- le paiement,
- la livraison,
- les avis clients,
- les vendeurs et leurs boutiques,
- les group buys,
- les recommandations,
- la recherche par image.

Le fichier `api-docs.json` decrit l ensemble des routes disponibles et sert de reference fonctionnelle pour le frontend ou les tests d integration.

### 3. Service IA d image

Le dossier `ai-image-service/` contient un service Python/FastAPI qui analyse une image de piece auto. Il sert a :

- reconnaitre une piece a partir d une image,
- extraire des mots cles utiles pour la recherche,
- calculer des embeddings d image,
- comparer une image fournie avec des images produits pour proposer des resultats similaires.

Ce service renforce la recherche produit quand l utilisateur ne connait pas exactement le nom de la piece.

## Fonctionnalites metier principales

### Cote client

- creation de compte et connexion,
- consultation du catalogue,
- recherche simple, avancee ou par image,
- consultation des pieces compatibles avec un vehicule,
- ajout au panier,
- commande en ligne,
- paiement,
- suivi de livraison,
- consultation des recommandations,
- depot et modification d avis.

### Cote vendeur

- creation ou consultation de boutique,
- ajout et mise a jour de produits,
- gestion des stocks,
- enrichissement des tags de recherche image,
- suivi du tableau de bord vendeur,
- gestion des commandes liees a la boutique.

### Cote administrateur

- validation ou suspension des vendeurs,
- gestion des commandes et paiements,
- supervision des livraisons,
- gestion du contenu global de la plateforme,
- moderation des avis et des donnees de reference.

## Domaines fonctionnels couverts

Le projet couvre plusieurs domaines metier autour de la vente de pieces auto :

- comptes et roles utilisateurs,
- catalogue produits,
- compatibilite vehicule-piece,
- panier et checkout,
- paiements,
- livraisons,
- boutiques vendeurs,
- avis clients,
- group buying,
- recherche intelligente,
- recommandations personnalisees.

## Parcours utilisateur type

1. Un client cree un compte ou se connecte.
2. Il recherche une piece par mot cle, par categorie, par vehicule ou par image.
3. Il consulte le detail produit et ajoute le produit au panier.
4. Il valide sa commande avec une adresse et un numero de telephone.
5. Il paie la commande puis suit son etat de preparation et de livraison.
6. Apres reception, il peut laisser un avis.

## Parcours vendeur type

1. Un vendeur demande ou cree sa boutique.
2. Il ajoute ses produits et complete les informations utiles.
3. Il consulte son tableau de bord pour suivre son activite.
4. Il controle ses produits, ses stocks et ses ventes.

## Parcours administrateur type

1. L administrateur supervise les vendeurs et les boutiques.
2. Il controle les commandes, paiements et livraisons.
3. Il applique les regles de la plateforme et maintient la qualite des donnees.

## Technologies utilisees

- Frontend : React, Vite, React Router, Axios, Tailwind CSS.
- Backend : Spring Boot, Spring Security, Spring Data JPA, JWT, Springdoc OpenAPI.
- Base de donnees : MySQL en production, H2 pour les tests.
- IA image : Python, FastAPI, PyTorch, Hugging Face Transformers, Pillow.

## Pourquoi ce projet existe

Ce projet existe pour reduire la friction dans l achat de pieces automobiles. Au lieu de chercher manuellement des references ou de naviguer entre plusieurs outils, l utilisateur dispose d une plateforme centralisee qui combine catalogue, compatibilite, paiement, livraison et assistance intelligente par image.

En resume, Pieces Auto est pense comme une boutique en ligne specialisee pour l univers automobile, avec des fonctions avancees pour les clients, les vendeurs et les administrateurs.