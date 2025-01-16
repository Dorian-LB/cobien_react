import mqtt from 'mqtt';

const mqttClient = mqtt.connect('ws://192.168.160.216:9001'); 
// const mqttClient = mqtt.connect('ws://localhost:9001');

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

  // voice/"siwis" pour l'accent français; "ona" pour l'accent catalan; "riccardo" pour l'accet italien
  mqttClient.publish('voice/siwis', "Sélectionner le contact à appeler.");

  // Naviguer vers la page Visio
  navigate('/visio');
};