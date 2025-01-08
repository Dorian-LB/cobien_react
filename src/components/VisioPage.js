// VisioPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function VisioPage() {
  const [contacts, setContacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const navigate = useNavigate();

  // Récupérer les contacts depuis le serveur
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

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % contacts.length);
  };

  const handleValidate = () => {
    setIsValidated(true);
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
    const subject = 'Invitation à une visioconférence';
    const body = `Salut,\n\nJ'ai planifié une visioconférence. Voici le lien : ${meetUrl}`;

    try {
      const response = await fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, meetUrl }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'e-mail.');
      }
      alert('Invitation envoyée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de l\'invitation.');
    }
  };

  return (
    <div className="visio-page">
      <h1>Planifier une Visio</h1>
      {!isValidated ? (
        <div>
          {contacts.length > 0 ? (
            <p>Voulez-vous appeler {contacts[currentIndex].name} ?</p>
          ) : (
            <p>Chargement des contacts...</p>
          )}
          <div className="button-group">
          <button onClick={handleNext} className="next-button">Suivant</button>
          <button onClick={handleValidate} className="validate-button">Valider</button>
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