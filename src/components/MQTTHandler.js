import React, { useEffect, useState, useContext, createContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mqtt from 'mqtt';
import { navigateToVisio } from './utils';

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

  // Initial sensor configuration
  const initialSensors = {
    PIC1: { touchDeviation: 0, proximityDeviation: 0, touchState: 0, proximityState: 0, },
    PIC2: { touchDeviation: 0, proximityDeviation: 0, touchState: 0, proximityState: 0, },
  };

  const [sensors, setSensors] = useState(initialSensors);
  const [formerSensors, setformerSensors] = useState(initialSensors);
  const visioActions = useContext(VisioActionsContext);

  const updateSensorData = (data) => {
    setformerSensors(sensors);
    setSensors((prevSensors) => {
      if (typeof prevSensors !== 'object' || prevSensors === null) {
        console.error('prevSensors n\'est pas un objet valide:', prevSensors);
        return initialSensors; 
      }

      // return prevSensors.map((sensor) => {
      const updatedSensors = { ...prevSensors };
  
      if (data.PIC1) {
        updatedSensors.PIC1.touchDeviation = data.PIC1.touchDeviation;
        updatedSensors.PIC1.proximityDeviation = data.PIC1.proximityDeviation;
        updatedSensors.PIC1.touchState = data.PIC1.touchState;
        updatedSensors.PIC1.proximityState = data.PIC1.proximityState;
      }
  
      if (data.PIC2) {
        updatedSensors.PIC2.touchDeviation = data.PIC2.touchDeviation;
        updatedSensors.PIC2.proximityDeviation = data.PIC2.proximityDeviation;
        updatedSensors.PIC2.touchState = data.PIC2.touchState;
        updatedSensors.PIC2.proximityState = data.PIC2.proximityState;
      }
  
        return updatedSensors;
      });
  };

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://192.168.172.196:9001');

    const publishLedstripUpdate = (message) => {
      mqttClient.publish('ledstrip/update', JSON.stringify(message), (err) => {
        if (err) {
          console.error('Erreur lors de la publication sur ledstrip/update:', err);
        } else {
          console.log('Message publié sur ledstrip/update:', message);
        }
      });
    };

    mqttClient.on('connect', () => {
      console.log('Connecté au serveur MQTT');
      mqttClient.subscribe('rfid/action', (err) => {
        if (err) {
          console.error("Erreur lors de l'abonnement au topic rfid/action:", err);
        }else{
          console.log('Abonné au topic rfid/action');
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

        if (topic === 'rfid/action' && jsonData.action === 'Visio') {
          navigateToVisio(navigate);
        }

        if (topic === 'sensor/current-configuration') {
          updateSensorData(jsonData);
          console.log('Données des capteurs reçues :', sensors);
          // setSensors(jsonData); 

          if (location.pathname === '/visio' && visioActions) {
            if (jsonData.PIC1.touchState === 0 && sensors.PIC1.touchState === 1) {   
              if (!isValidated()) {
                visioActions.handleValidate();
                console.log('Validation de la visio');
                publishLedstripUpdate({ group: 2, intensity: 255, color: "#FF0000", mode: "ON" });
              } else {
                visioActions.handleConfirm();
                console.log('Confirmation de l\'appel');
              }
            }  
            if (jsonData.PIC2.touchState === 0 && sensors.PIC2.touchState === 1) {
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
        React.cloneElement(child, { sensors })
      )}
    </VisioActionsContext.Provider>
  );
};

export default MQTTHandler;
export { VisioActionsContext };
