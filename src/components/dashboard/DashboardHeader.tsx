import React, { useState } from 'react';
import Cookies from 'js-cookie';
import ProfileForm from '../ProfileForm';

export const DashboardHeader = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const userData = {
    nomeUtilizador: 'Admin',
    dataNascimento: '1990-01-01',
    pontos: 100,
    comprovativoResidencia: 'Comprovativo.pdf',
    email: 'admin@example.com',
    utilizador: 'adminUser',
    password: '123456'
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleClickOutside = () => {
    if (showMenu) setShowMenu(false);
  };

  const handleLogout = () => {
    Cookies.remove('jwt');
    window.location.href = '/';
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-4 relative">
        <span className="text-gray-600">{userData.nomeUtilizador}</span>

        <button
          onClick={handleMenuToggle}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 focus:outline-none"
        >
          <img
            src="/man.png"
            alt="person"
            className="w-6 h-6 rounded-full object-cover"
          />
        </button>

        {showMenu && (
          <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md w-32 z-10">
            <ul className="text-gray-700">
              <li
                onClick={() => setShowProfileForm(true)}
                className="hover:bg-gray-100 p-2 text-sm cursor-pointer"
              >
                Alterar Perfil
              </li>
              <li
                onClick={handleLogout}
                className="hover:bg-gray-100 p-2 text-sm cursor-pointer"
              >
                Terminar Sessão
              </li>
            </ul>
          </div>
        )}
      </div>

      {showProfileForm && (
        <ProfileForm userData={userData} toggleModal={() => setShowProfileForm(false)} />
      )}
    </header>
  );
};

export default DashboardHeader;
