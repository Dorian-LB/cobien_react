import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisioActionsContext } from './MQTTHandler';

function VisioPage({ sensorData }) {
  const [contacts, setContacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const navigate = useNavigate();

  const visioActions = useContext(VisioActionsContext);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % contacts.length);
    console.log('Passage au contact suivant');
  };

  const handleValidate = () => {
    setIsValidated(true);
    console.log('Validation de la visio');
  };

  const handleConfirm = () => {
    const selectedContact = contacts[currentIndex];
    const meetUrl = createJitsiMeeting();
    window.open(meetUrl, '_blank');
    sendEmailInvitation(selectedContact.email, meetUrl);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const createJitsiMeeting = () => {
    const roomName = 'room-' + Math.random().toString(36).substring(2, 15);
    const userName = 'user1';
    return `https://meet.jit.si/${roomName}#userInfo.displayName=${encodeURIComponent(userName)}&config.prejoinPageEnabled=false`;
  };

  const sendEmailInvitation = async (to, meetUrl) => {
    try {
      const response = await fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, meetUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de l'envoi de l'e-mail: ${errorText}`);
      }
      alert('Invitation envoyée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de l\'invitation. Détails: ' + error.message);
    }
  };

  useEffect(() => {
    if (visioActions) {
      visioActions.handleValidate = handleValidate;
      visioActions.handleNext = handleNext;
      visioActions.handleConfirm = handleConfirm;
      visioActions.handleCancel = handleCancel;
      visioActions.isValidatedState = () => isValidated;
      console.log('Actions de visio enregistrées dans le contexte.');
    }
  }, [visioActions, handleValidate, handleNext, handleConfirm, handleCancel, isValidated]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('http://localhost:3000/contacts');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des contacts.');
        }
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la récupération des contacts.');
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="visio-page">
      <h1>Sélectionner le contact à appeler</h1>
      {!isValidated ? (
        <div>
          {contacts.length > 0 ? (
            <p>Voulez-vous appeler {contacts[currentIndex].name} ?</p>
          ) : (
            <p>Chargement des contacts...</p>
          )}
          <div className="button-group">
            <button onClick={handleValidate} className="validate-button">Valider</button>
            <button onClick={handleNext} className="next-button">Suivant</button>
          </div>
        </div>
      ) : (
        <div>
          <p>Confirmez-vous l'appel avec {contacts[currentIndex].name} ?</p>
          <div className="button-group">
            <button onClick={handleConfirm} className="confirm-button">Confirmer</button>
            <button onClick={handleCancel} className="cancel-button">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisioPage;
