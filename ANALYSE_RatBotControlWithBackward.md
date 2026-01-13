# Analyse du Code : RatBotControlWithBackward.ino

## Vue d'ensemble
Ce code Arduino (ESP32) gère le contrôle d'un robot propulsé par moteurs d'hoverboard via une manette PS4 en Bluetooth. Il assure la communication bidirectionnelle avec la carte mère de l'hoverboard et le traitement des entrées du contrôleur.

---

## 1. Configuration et Constantes

### Paramètres UART/Hoverboard
- **HOVER_SERIAL_BAUD** : 115200 baud - Vitesse de communication avec la carte mère
- **START_FRAME** : 0xABCD - Marqueur du début de chaque paquet de données
- **TIME_SEND** : 50 ms - Intervalle d'envoi des commandes aux moteurs

### Paramètres Vitesse
- **SPEED_MAX_TEST** : 1000 - Valeur maximale des commandes moteurs (-1000 à +1000)
- **SPEED_STEP** : 20 - Incrément (non utilisé dans le code)

---

## 2. Structures de Données

### SerialCommand (Envoi vers hoverboard)
- **start** : Trame de démarrage (0xABCD)
- **steer** : Commande de rotation (-1000 à +1000)
- **speed** : Commande de vitesse (-1000 à +1000)
- **checksum** : Somme XOR pour vérification d'intégrité

### SerialFeedback (Réception depuis hoverboard)
- **start** : Trame de démarrage
- **cmd1** : Commande 1 (retour)
- **cmd2** : Commande 2 (retour)
- **speedR_meas** : Vitesse mesurée moteur droit
- **speedL_meas** : Vitesse mesurée moteur gauche
- **batVoltage** : Tension batterie
- **boardTemp** : Température de la carte mère
- **cmdLed** : État des LEDs
- **checksum** : Vérification d'intégrité

---

## 3. Section Manette PS4 (Bluetooth)

### Variables Globales
- **r2**, **l2** : Valeurs des gâchettes (0-1023)
- **leftJoyStick** : Position du joystick gauche (-512 à +512)
- **speed**, **turn** : Commandes calculées pour les moteurs
- **myControllers[]** : Tableau des contrôleurs connectés

### Callbacks Bluetooth
- **onConnectedController()** : S'exécute quand une manette se connecte
  - Affiche l'index, le modèle et les IDs vendor/product
  - Stocke le contrôleur dans un slot disponible

- **onDisconnectedController()** : S'exécute quand une manette se déconnecte
  - Libère le slot occupé
  - Affiche un message de déconnexion

### Fonction dumpGamepad()
Affiche les données complètes du contrôleur (buttons, axes, gyro, accéléromètre) - Debug uniquement

---

## 4. Traitement des Entrées Manette

### processGamepad()
Traduit les inputs PS4 en commandes moteurs :

**Gâchette Droite (R2)** 
- Code bouton : 0x0080
- Récupère la valeur du throttle (0-1023)
- Active l'avance du robot

**Gâchette Gauche (L2)**
- Code bouton : 0x0040
- Récupère la valeur du brake (0-1023)
- Active la marche arrière du robot

**Joystick Gauche (Rotation)**
- Axe X : -512 à +512
- Seuil de détection : ±25 (deadzone)
- Valeurs au-delà du seuil = rotation

### processControllers()
Boucle sur tous les contrôleurs connectés et traite les données reçues

---

## 5. Communication UART avec Hoverboard

### Send() - Envoi des Commandes
**Paramètres** : uSteer (rotation), uSpeed (vitesse)

**Processus** :
1. Crée une structure Command avec :
   - Trame de démarrage (0xABCD)
   - Valeur de rotation (steer)
   - Valeur de vitesse (speed)
   - Checksum (XOR de tous les champs)
2. Envoie la structure (8 bytes) via UART

### Receive() - Réception des Données
**Processus** :
1. Lit les bytes un par un depuis le buffer UART
2. Construit la trame de démarrage avec byte actuel + byte précédent
3. Si trame valide (0xABCD détectée), initialise la réception
4. Continue à accumuler les bytes jusqu'à avoir 9 bytes (sizeof(SerialFeedback))
5. Vérifie le checksum pour valider l'intégrité
6. Si valide, copie les données dans la structure Feedback
7. Stocke les mesures : vitesses moteurs, tension batterie, température

---

## 6. Initialisation (Setup)

### Configuration UART
- Initialise USB Serial à 115200 baud pour debug
- Initialise HardwareSerial(1) à 115200 baud
- Pins : RX=GPIO3, TX=GPIO1

### Configuration Bluetooth (Bluepad32)
- Affiche la version du firmware Bluepad32
- Affiche l'adresse MAC locale (BD Address)
- Configure les callbacks de connexion/déconnexion
- Oublie les clés Bluetooth précédentes (appairage frais)
- Désactive le périphérique virtuel

### Configuration GPIO
- GPIO LED_BUILTIN en sortie

---

## 7. Boucle Principale (Loop)

### Gestion Temps - Section Manette (Interval 50ms)
```
if (currentTime - previousMillis >= interval)
```
- Assure un traitement stable à 50ms d'intervalle (~20Hz)
- Réinitialise les variables (r2, l2, leftJoyStick)
- Met à jour les données du contrôleur via BP32.update()

### Calcul des Commandes Moteurs
```
if (l2 != 0):
    speed = -l2 * SPEED_MAX_TEST / 1023   // Marche arrière
else:
    speed = r2 * SPEED_MAX_TEST / 1023    // Avance
turn = leftJoyStick                        // Rotation directe
```
**Logique** : Priorité à L2 (marche arrière), sinon R2 (avance)

### Gestion Temps - Section Moteurs (50ms)
```
if (iTimeSend > timeNow) return;
iTimeSend = timeNow + TIME_SEND;
```
- Envoie les commandes tous les 50ms
- Reçoit en continu les données du hoverboard

### Envoi et Réception
1. **Receive()** : Traite les données entrantes de la carte mère
2. **Send(turn, speed)** : Envoie les nouvelles commandes moteurs
3. **Debug** : Affiche r2 et speed sur le port série

### Indicateur LED
```
digitalWrite(2, (timeNow%2000)<1000);
```
- Fait clignoter le GPIO2 avec une période de 2 secondes
- Indique que le robot est sous tension

### yield()
- Permet à l'ESP32 d'exécuter les tâches système en arrière-plan
- Essentiel pour la stabilité Bluetooth/WiFi

---

## 8. Flux de Données Global

```
Manette PS4
    ↓ (Bluetooth)
ESP32 (Bluepad32)
    ↓ (Traitement: vitesse + direction)
    ↓ (UART 115200)
Carte Mère STM32 (Hoverboard)
    ↓ (Contrôle PWM FOC)
Moteurs Triphasés
    ↓ (Retour télémétrie)
ESP32 (Réception UART)
    ↓ (Stockage dans Feedback)
Visualisation/Debug Serial
```

---

## 9. Résumé des Fonctionnalités

✅ **Contrôle Bluetooth PS4 sans fil**
✅ **Gâchettes pour marche avant/arrière**
✅ **Joystick gauche pour rotation**
✅ **Communication UART robuste avec checksum**
✅ **Réception des données de télémétrie (vitesses, batterie, temp)**
✅ **Failsafe implicite : réinitialisation des commandes à chaque boucle**
✅ **Indicateur de fonctionnement (LED clignotante)**
✅ **Gestion multi-contrôleurs (architecture extensible)**
✅ **Déadzones sur les joysticks**

---

## 10. Paramètres Clés à Ajuster

| Paramètre | Valeur Actuelle | Impact |
|-----------|-----------------|--------|
| TIME_SEND | 50 ms | Fréquence d'envoi des commandes |
| SPEED_MAX_TEST | 1000 | Vitesse maximale |
| Deadzone Joystick | ±25 | Sensibilité minimale de rotation |
| interval (PS4) | 50 ms | Fréquence de lecture du contrôleur |

