// VisioPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VisioPage() {
  const [contacts] = useState([
    { name: 'Leo1', email: 'kamdemleonard6@gmail.com' },
    { name: 'Leo_Prof', email: 'joseph.kamdem@2026.icam.fr' },
    { name: 'Leo2', email: 'kamdemleonard04@gmail.com' },
    {name: 'Dorian', email: 'dorian.le-boulch@2024.icam.fr'}
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const navigate = useNavigate();

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
          <p>Voulez-vous appeler {contacts[currentIndex].name} ?</p>
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