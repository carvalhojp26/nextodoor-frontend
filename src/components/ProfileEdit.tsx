import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ProfileForm from './ProfileForm';

const ProfileEdit = () => {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState({
    nomeUtilizador: '',
    dataNascimento: '',
    pontos: 0,
    comprovativoResidencia: '',
    email: '',
    utilizador: '',
    password: ''
  });

  const toggleModal = () => setShowModal(!showModal);

  useEffect(() => {
    const token = Cookies.get('jwt');

    if (token) {
      fetch('http://localhost:3000/api/users/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => response.json())
        .then(data => setUserData(data))
        .catch(err => console.error('Erro ao buscar dados do utilizador:', err));
    }
  }, []);

  return (
    <>
      <button onClick={toggleModal} className="bg-blue-500 text-white p-2 rounded">Alterar Perfil</button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <ProfileForm userData={userData} toggleModal={toggleModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileEdit;
