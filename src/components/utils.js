import { useNavigate } from 'react-router-dom';
import mqtt from 'mqtt';

const mqttClient = mqtt.connect('ws://localhost:9001'); // Connexion MQTT globale

export const navigateToVisio = (navigate) => {
  // Publier les messages sur le topic ledstrip/update
  const publishLedStripConfig = (group, color) => {
    const payload = {
      group,
      intensity: 255,
      color,
      mode: "ON",
    };

    mqttClient.publish('ledstrip/update', JSON.stringify(payload), (err) => {
      if (err) {
        console.error(`Erreur lors de la publication sur ledstrip/update:`, err);
      } else {
        console.log('Message publié sur ledstrip/update:', payload);
      }
    });
  };

  // Publier les deux messages nécessaires
  publishLedStripConfig(1, "#00FF00");
  publishLedStripConfig(2, "#FFFFFF");

  // Naviguer vers la page Visio
  navigate('/visio');
};