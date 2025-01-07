// AddContact.js
import React, { useState } from 'react';
import axios from 'axios';

function AjouterContact({ onContactAdded }) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleAddContact = async () => {
    if (contactName && contactEmail) {
      try {
        const response = await axios.post('http://localhost:3000/add-contact', {
          name: contactName,
          email: contactEmail,
        });
        console.log(response.data);
        // Réinitialiser les champs
        setContactName('');
        setContactEmail('');
        onContactAdded();
        alert('Contact ajouté avec succès!');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du contact:', error);
        alert('Erreur lors de l\'ajout du contact.');
      }
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  };

  return (
    <div className='contact-form'>
      <h4>Ajouter un nouveau contact</h4>
      <label>
        Nom:
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className='input-field'
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className='input-field'
        />
      </label>
      <div className='button-group'>
        {/* <button onClick={() => onContactAdded(false)}>Annuler</button> */}
        <button onClick={handleAddContact}>Ajouter</button>
      </div>
    </div>
  );
}

export default AjouterContact;