import React, { useEffect, useState, useContext, createContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mqtt from 'mqtt';

// Contexte pour transmettre les actions de VisioPage
const VisioActionsContext = createContext({
  handleValidate: () => console.log('handleValidate non défini'),
  handleNext: () => console.log('handleNext non défini'),
  handleConfirm: () => console.log('handleConfirm non défini'),
  handleCancel: () => console.log('handleCancel non défini'),
});

const MQTTHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sensorData, setSensorData] = useState(null);

  const visioActions = useContext(VisioActionsContext);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://192.168.250.196:9001');

    mqttClient.on('connect', () => {
      console.log('Connecté au serveur MQTT');
      mqttClient.subscribe('rfid/action', (err) => {
        if (err) {
          console.error("Erreur lors de l'abonnement au topic rfid/action:", err);
        }
      });

      mqttClient.subscribe('sensor/current-configuration', (err) => {
        if (err) {
          console.error("Erreur lors de l'abonnement au topic sensor/current-configuration:", err);
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      const msg = message.toString();
      console.log(`Message reçu sur le topic ${topic}: ${msg}`);
      try {
        const jsonData = JSON.parse(msg);

        if (topic === 'rfid/action' && jsonData.action === 'visio') {
          navigate('/visio');
        }

        if (topic === 'sensor/current-configuration') {
          console.log('Données des capteurs reçues :', jsonData);
          setSensorData(jsonData);

          if (location.pathname === '/visio' && visioActions) {
            if (jsonData.PIC1.touchDeviation > 100) {
              if (!isValidated()) {
                visioActions.handleValidate();
                console.log('Validation de la visio');
              } else {
                visioActions.handleConfirm();
                console.log('Confirmation de l\'appel');
              }
            }
            if (jsonData.PIC2.touchDeviation > 100) {
              if (!isValidated()) {
                visioActions.handleNext();
                console.log('Passage au contact suivant');
              } else {
                visioActions.handleCancel();
                console.log('Annulation de l\'appel');
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la réception ou du traitement du message:', error);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('Erreur de connexion MQTT:', err);
    });

    return () => {
      mqttClient.end();
    };
  }, [navigate, location, visioActions]);

  const isValidated = () => {
    return visioActions?.isValidatedState && visioActions.isValidatedState();
  };

  return (
    <VisioActionsContext.Provider value={visioActions}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { sensorData })
      )}
    </VisioActionsContext.Provider>
  );
};

export default MQTTHandler;
export { VisioActionsContext };