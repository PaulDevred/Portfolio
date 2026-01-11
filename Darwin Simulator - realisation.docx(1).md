# Darwin Simulator

## À la Croisée du Vivant et du numérique: Naissance de Darwin Simulator

Darwin Simulator est une **simulation** en trois dimensions des mécanismes de **sélection naturelle** et de **mutations génétiques** comme on peut les observer dans la **nature** ou dans la **théorie de l’évolution de Charles Darwin.** Cette simulation est matérialisée par un plateau intégrant de la nourriture, des obstacles et des dangers susceptibles de provoquer la mort des entités.

Chaque entité représente un organisme vivant simplifié, doté d’un **cerveau artificiel** simulé par un **réseau de neurones** **évolutif**.

Ce projet permet à l’utilisateur d’**observer**, de **comprendre** et d’**expérimenter** avec l’**évolution** **génétique** et **comportementale** d’une population virtuelle au fil du temps.

## L’Exploration de l’Évolution Artificielle : Objectifs et Défis Initiaux

Ce projet a été réalisé dans le cadre d’un **travail d’équipe universitaire** sur quatre mois, avec carte blanche sur le sujet et les technologies utilisées. L’équipe était composée de quatre développeurs: Robin Palmier, Mirindra Rabenjarijaona, Ruben Hayoun et moi-même.  
Nous avons choisi d’utiliser **Unity 3D** pour la simulation et de mettre en œuvre l’algorithme **NEAT** (*Neuroevolution of Augmenting Topologies*) afin de permettre l’évolution progressive des comportements.

Nos principaux **objectifs** étaient les suivants :

* Concevoir un **réseau de neurones évolutif** capable d’adapter le comportement des entités selon leur environnement.

* Intégrer un **mécanisme de mutation génétique** permettant à l’espèce d’évoluer au fil des générations.

* Offrir à l’utilisateur une **visualisation claire des phénomènes d’évolution** et une compréhension intuitive des mécanismes techniques définissant le comportement de chaque entité.

Les principaux **enjeux** du projet étaient à la fois **scientifiques** et **techniques** :

Le premier enjeu de notre projet était de **concilier réalisme biologique et efficacité algorithmique**. En effet, il s’agissait de simuler des comportements naturels complexes (sélection naturelle, mutations, reproduction…) tout en créant une simulation efficace et fluide.

Le second enjeu est induit par le premier, pour créer une simulation réaliste, il ne suffisait pas de créer un réseau de neurones et de procéder à un apprentissage supervisé pour entraîner les individus à survivre. Nous devions **créer une architecture neuronale capable d’apprendre convenablement avec pour seule supervision, la sélection naturelle.**

Le dernier enjeu était d’**assurer la compréhension scientifique de l’utilisateur**. Ce projet visant à offrir un outil pédagogique et exploratoire, l’utilisateur devait pouvoir observer et comprendre le fonctionnement et les phénomènes d’évolution des entités.

Les **risques** identifiés concernaient la **technique** et **l’organisation**

Le risque le plus critique était lié à la performance de la simulation. La complexité de l’algorithme NEAT, couplée au fait que chaque entité utilise un réseau de neurones implémentant NEAT, implique un **risque important de manque de performance et de scalabilité de la simulation**.

Nous avons travaillé en respectant la méthode agile SCRUM. Étant quatre développeurs aspirant à devenir experts informatiques, nous nous sommes partagés à quatre, le travail de SCRUM master, de product owner et de développeur.

Nous faisions aussi face à un **risque concernant la pertinence** de notre algorithme.Comme nous voulions mettre en place un algorithme évolutif, rien ne nous garantissait l'émergence de comportements visibles ou même pertinents.

Concernant les risques organisationnels, le principal était celui de se désaligner concernant les prises de décisions car nous n’avions pas décidé d'assigner un rôle à chaque membre de l’équipe.

## Donner Vie au Monde Virtuel : Mon Rôle dans la Conception et le Développement

Nous avons établi, avec Trello, un planning sur quatre mois, divisé en trois itérations et une recette finale. Les premiers développements furent les suivants :

### Preuve de concept

Nous avons développé une **preuve de concept** en créant un plateau en trois dimensions intégrant des entités et de la nourriture apparaissant à des positions aléatoires. Dans cette implémentation conceptuelle, les entités se dirigeaient simplement vers la nourriture pour la manger.

### Au Cœur de l’Intelligence Émergente : Le Réseau de Neurones Évolutif

Pendant que mes coéquipiers concevaient les maquettes, et les premiers éléments graphiques, j’ai développé le **réseau de neurones** servant de base à l’implémentation de l’**algorithme NEAT**

Cet algorithme repose sur un principe fondamental : faire **évoluer, génération après génération**, les réseaux de neurones contrôlant les entités afin qu’ils deviennent de plus en plus efficaces dans leur environnement.

Chaque entité du simulateur dispose ainsi d’un **cerveau artificiel** sous la forme d’un réseau de neurones. Celui-ci reçoit en **entrée** diverses informations sensorielles issues de l’environnement (comme la position de la nourriture ou la distance aux obstacles), et produit en **sortie** des ordres moteurs déterminant le comportement de l’entité (se déplacer, tourner, s’arrêter, se reproduire).

Voici les entrées et sorties de la première version du réseau de neurones :

| Entrées | Sorties |
| :---- | :---- |
| Faim | Vitesse de déplacement |
| Santé | Vitesse de rotation |
| Âge |  |
| Vitesse de déplacement |  |
| Distance de la nourriture la plus proche |  |
| Angle de la nourriture la plus proche |  |
| Distance à l’entité la plus proche |  |
| Angle à l’entité la plus proche |  |
| Distance à l’obstacle le plus proche |  |
| Angle à l’obstacle le plus proche |  |

Nb : Les valeurs des neurones de sortie peuvent être négatives, permettant ainsi des comportements plus variés (reculer ou tourner dans le sens inverse).

Au départ, les réseaux sont très simples et leurs comportements largement aléatoires. Certaines entités avancent sans direction claire, d’autres tournent sur elles-mêmes.  
Par exemple, lors de la création d’une entité, son réseau de neurones peut se limiter à **une seule liaison** : un neurone d’entrée représentant la *distance à la nourriture la plus proche*, relié à un neurone de sortie contrôlant la *vitesse de rotation*. Dans ce cas, plus l’entité est proche de la nourriture, plus elle tourne rapidement sur elle-même. Ce comportement n’est évidemment pas favorable à la survie, mais il illustre bien la **phase initiale** du processus évolutif.

Lorsque certaines entités parviennent à survivre suffisamment longtemps pour se reproduire, elles transmettent leur réseau de neurones à leur descendance, **modifié par des mutations aléatoires**. J’ai implémenté plusieurs types de mutations influençant directement la topologie et la force des connexions :

* Création d’une liaison entre deux neurones existants ;

* Suppression d’une liaison ;

* Insertion d’un neurone intermédiaire sur une liaison existante ;

* Augmentation de la puissance (poids) d’une liaison ;

* Diminution de la puissance d’une liaison.

Chaque mutation a un **impact plus ou moins significatif** sur le comportement global de l’entité. Certaines améliorent sa capacité à survivre, d’autres la rendent moins efficace, mais toutes participent au processus d’**évolution artificielle**.

Au fil des générations, les entités présentant les comportements les plus adaptés (déplacements efficaces, consommation optimale d’énergie, meilleure orientation vers la nourriture) sont naturellement sélectionnées. Ainsi, sans intervention directe, la population entière évolue progressivement vers des formes de comportement **plus intelligentes et mieux adaptées à leur environnement**.

### Rendre visible l’invisible : Conception de l’Interface neuronale

Afin de permettre une meilleure compréhension du fonctionnement interne des entités, j’ai conçu et développé une **interface de visualisation du réseau de neurones** intégrée directement dans le simulateur.  
 Cette interface avait pour objectif de rendre **visible et compréhensible l’évolution du cerveau artificiel** de chaque entité au fil du temps, tout en restant légère et intuitive.

L’idée principale était de **traduire des données abstraites** (poids synaptiques, connexions, activations) en **éléments visuels simples**.

#### **Principes de conception**

L’interface a été pensée selon trois axes :

1. **Lisibilité** : les réseaux sont représentés sous forme de schéma nodal, où chaque **neurone** est affiché sous forme de cercle et chaque **connexion** sous forme de trait reliant deux neurones.

2. **Temps réel**: les changements de topologie (ajout de neurones, suppression ou création de connexions) sont visibles en temps réel, permettant d’observer l’apparition de nouvelles structures au fil des générations.

3. **Simplicité et performance** : l’objectif n’était pas d’obtenir un rendu esthétique complexe, mais une **interface claire, fluide et pédagogique**, adaptée à un contexte d’expérimentation scientifique et non à une démonstration graphique.

**Code couleur des connexions** :

* Les connexions **positives** sont affichées en **vert**,

* Les connexions **négatives** en **rouge**,

* L’épaisseur du trait varie selon le **poids synaptique**, offrant une lecture intuitive de l’importance de chaque liaison.

Ainsi cette interface permet de faire le lien entre la théorie de l’évolution et son implémentation informatique. Elle est simple et intuitive pour permettre à l’utilisateur de comprendre la logique derrière le comportement des entités.

## Quand la Vie Émerge du Code : Résultats et Comportements Observés

Le projet **Darwin Simulator** a abouti à une simulation fonctionnelle et stable, capable de démontrer concrètement les principes de la sélection naturelle et de l’évolution artificielle par réseaux de neurones.

#### **Résultats techniques**

Sur le plan technique, l’équipe a réussi à :

* **Implémenter une simulation d’évolution complète** combinant gestion d’environnement 3D, algorithme NEAT et reproduction génétique des entités ;

* **Faire cohabiter une centaine d’individus** dans un même environnement sans perte de performance notable.

* **Mettre en place un réseau de neurones évolutif stable**, capable de modifier sa topologie au fil des générations.

* **Intégrer une interface de visualisation dynamique** rendant visible la structure du cerveau de chaque individu, et donc les mutations successives au sein de la population.

Ces avancées ont permis de constater l’émergence de **comportements spontanés**, produits sans aucune supervision humaine :

* Certaines entités ont appris à **se diriger vers la nourriture** plutôt qu’à tourner aléatoirement ;

* D’autres ont adapté leur vitesse de déplacement en fonction de leur faim ou de leur santé, démontrant une **économie d’énergie** ;

* Des différences de comportement sont apparues entre espèces, certaines privilégiant la mobilité, d’autres la résistance ou la reproduction.


Voici les entrées en sortie du réseau de neurones final :

| Entrées | Sorties |
| :---- | :---- |
| Faim | Vitesse de déplacement |
| Santé | Vitesse de rotation |
| Âge | Reproduction |
| Vitesse de déplacement | Reset chronomètre |
| Distance de la nourriture la plus proche |  |
| Angle de la nourriture la plus proche |  |
| Distance à l’entité la plus proche |  |
| Angle à l’entité la plus proche |  |
| Distance à l’obstacle le plus proche |  |
| Angle à l’obstacle le plus proche |  |
| Nombre d’entités dans un périmètre rapproché |  |
| Chronomètre |  |

## Vers un Écosystème Auto-Régulé : Les Pistes d’Évolution du Projet

Ce projet est déjà abouti dans sa première version mais possède un fort potentiel d’évolution. Si bien qu’une version future pourrait être totalement différente, autant sur le plan technique que sur le plan conceptuel.

**Evolution Technique :**

Actuellement, le plateau peut accueillir une centaine d’individus sans aucune perte de performance. C’est suffisant pour observer l’émergence de comportements non supervisés mais ce n’est pas assez pour voir des comportements plus complexes comme l’appropriation de territoires, de compétition/collaboration entre espèces. 

Une évolution qui augmenterait largement les performances serait la vectorisation des calculs neuronaux via des bibliothèques de calculs matriciels. Cela permettrait en théorie de simuler des milliers d’individus sans perte de performance. Nous pourrions ainsi simuler des comportements individuels et collectifs bien plus poussés.

**Ajout de fonctionnalités :**

* **Système de digestion et de métabolisme** :  
   Une amélioration majeure consisterait à doter chaque entité d’un **système de transformation énergétique réaliste** : la nourriture ingérée serait convertie en énergie selon un rendement variable, avec une part de perte (déchets, chaleur). Ce système permettrait d’introduire la notion de **rendement biologique**, rendant la simulation plus cohérente d’un point de vue physique et naturelle.

* **Conservation de l’énergie et recyclage de la matière** :  
   Une autre amélioration qui renforcerait la cohérence de la simulation serait d’assurer un **cycle énergétique fermé**. L’énergie consommée par les entités ne serait jamais créée ni détruite, mais **redistribuée** dans l’écosystème. Les entités mortes pourraient se décomposer et servir de nourriture ou d’engrais, tandis que les **déchets produits** par les vivants seraient intégrés dans le cycle sous forme de ressource secondaire. Cela permettrait d’établir un équilibre naturel durable et d’observer l’émergence d’un **écosystème auto-régulé**.

* **Introduction de la prédation** :  
   Une évolution évidente de la simulation consisterait à introduire des **chaînes alimentaires**. Certaines espèces deviendraient prédatrices, d’autres proies. Cela engendrerait des comportements complexes de fuite, de chasse, de camouflage et de stratégie collective. L’évolution sélectionnerait alors non plus uniquement la résistance ou la vitesse, mais aussi la **capacité d’adaptation comportementale**.

* **Apparence physique évolutive** :  
   Les entités pourraient avoir des **caractéristiques visuelles et morphologiques** dépendantes de leur génome ou de leur comportement : couleur de peau, taille, forme du corps, motifs distinctifs. Ces traits permettraient d’**identifier visuellement les espèces** et leurs stratégies adaptatives (vitesse, discrétion, agressivité, sociabilité). Cela permettrait aussi de visualiser les espèces descendant d’un ancêtre commun.

* **Ajout d’un module de visualisation statistique** : suivi en temps réel des courbes de population, de la diversité génétique et de la complexité moyenne des réseaux neuronaux, afin de quantifier les tendances évolutives.

* **Export et partage de données** : possibilité d’enregistrer des réseaux de neurones, des individus, ou même des générations entières pour les rejouer, comparer différentes configurations, expérimenter…

#### **Vision à long terme**

À long terme, **Darwin Simulator** pourrait devenir un **véritable laboratoire virtuel d’évolution artificielle**, capable de modéliser des écosystèmes complets et auto-suffisants, où chaque entité suit des lois biologiques, physiques et énergétiques cohérentes.  
 L’ambition serait de créer un environnement où la vie, même artificielle, **émerge, s’adapte et se perpétue** selon les mêmes principes fondamentaux que dans la nature, offrant ainsi un outil à la fois scientifique et pédagogique.

## Ce que l’Évolution M’a Appris : Analyse et Enseignements Personnels

Avec le recul, **Darwin Simulator** a été un projet marquant, qui m’a fait conscientiser **l’équilibre naturel** propre au monde du vivant. En cherchant à reproduire ces mécanismes dans un cadre numérique, j’ai réalisé la complexité et la subtilité des systèmes auto-régulés. 

Ce travail m’a également fait réaliser à quel point le **développement informatique** est une  discipline vaste, presque sans limites. Cette expérience a renforcé ma **curiosité** et ma **motivation à approfondir** mes compétences en conception logicielle.

Ce projet m’a permis de franchir une étape dans ma compréhension de l’**intelligence artificielle**. J’ai appris à concevoir un système qui ne suit pas des règles figées, mais qui **apprend, s’adapte et se transforme** en fonction de son environnement. Cela m’a confronté à des problématiques intéressantes : comment créer des comportements crédibles sans les coder explicitement ? Comment garantir la stabilité d’un système fondé sur l’aléatoire ?

#### **Mes apports et ma valeur ajoutée**

Ma contribution la plus marquante a été la **conception du réseau de neurones évolutif** et de son **interface de visualisation**. J’ai cherché à rendre visible ce qui, d’ordinaire, reste abstrait : la naissance d’un comportement. En rendant les mécanismes internes compréhensibles, j’ai permis à aux utilisateurs d’interpréter les résultats non pas comme de simples animations, mais comme de véritables phénomènes émergents.  
 En tant que chef de projet, j'ai également apporté une rigueur technique : structuration du code, méthodes de travail, gestion des versions du projet. Ces choix ont permis à la simulation d’évoluer avec stabilité, et à chaque membre de contribuer efficacement.

#### **Un regard critique sur les limites**

Le manque d’outils de mesure précis (suivi statistique, courbes d’évolution) limitait l’analyse quantitative des résultats. La simulation, bien que fonctionnelle, aurait gagné à être davantage **paramétrable** pour explorer plusieurs scénarios. Enfin, la gestion de projet en utilisant SCRUM, sans assigner de rôle précis à chacun, a parfois ralenti la prise de décision sur les priorités techniques.  
 Ces limites n’enlèvent rien à la réussite du projet, mais constituent aujourd’hui des **axes clairs de progression** que je garde en tête pour mes futurs travaux.

#### **Ce que j’en tire aujourd’hui**

Darwin Simulator m’a appris à trouver un équilibre entre la rigueur scientifique et la créativité du développeur. Il a confirmé mon goût pour les projets où la technique sert une finalité intellectuelle : comprendre, simuler, expliquer.  
 C’est aussi un projet dont je suis sincèrement fier, non seulement pour ce qu’il accomplit sur le plan technique, mais pour ce qu’il symbolise : une **première approche holistique** de l’expertise informatique, où la compréhension des systèmes vivants, la conception logicielle et la réflexion scientifique se rejoignent dans une même démarche.

En somme, Darwin Simulator n’a pas seulement fait évoluer ses entités : il m’a, moi aussi, fait évoluer en tant que développeur et humain.