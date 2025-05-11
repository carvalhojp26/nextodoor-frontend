// src/components/UserHeader.tsx

import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import ProfileForm from '../../components/ProfileForm'; // Ajuste o caminho se necessário
import "../../styles.css";
import { MapPinIcon } from '@heroicons/react/24/outline'; // Ícone para vizinhança

// Interface para o objeto Vizinhanca aninhado (como vem da API)
interface VizinhancaData {
  idVizinhanca: number;
  nomeFreguesia: string; // Ou o nome do campo que contém o nome da vizinhança
  // Outros campos da vizinhança se precisar
}

// Interface UserDataFromAPI atualizada
interface UserDataFromAPI {
  idUtilizador: number;
  nomeUtilizador: string;
  emailUtilizador?: string;
  dataNascimento?: string;
  pontos?: number;
  comprovativoResidencia?: string;
  utilizadorLogin?: string;
  Vizinhanca?: VizinhancaData; // << ADICIONADO: Objeto Vizinhanca aninhado
  // Adicione outros campos que sua API retorna e que ProfileForm possa precisar
}

export const UserHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDataFromAPI | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      const localToken = Cookies.get('jwt');
      console.log("UserHeader: Token JWT:", localToken ? 'Encontrado' : 'NÃO Encontrado');

      if (localToken) {
        try {
          console.log("UserHeader: Tentando buscar perfil em '/api/users/perfil'");
          const response = await axios.get('http://localhost:3000/api/users/perfil', {
            headers: { Authorization: `Bearer ${localToken}` },
          });
          console.log("UserHeader: Resposta da API de perfil:", response.data);

          if (response.data && response.data.user) {
            const userDataFromApi = response.data.user as UserDataFromAPI; // O objeto user já deve ter Vizinhanca aninhado
            
            if (userDataFromApi.nomeUtilizador) {
                setCurrentUser(userDataFromApi); // Armazena o objeto user completo
                console.log("UserHeader: currentUser definido com:", userDataFromApi.nomeUtilizador);
                if (userDataFromApi.Vizinhanca) {
                  console.log("UserHeader: Vizinhança do usuário:", userDataFromApi.Vizinhanca.nomeFreguesia);
                } else {
                  console.warn("UserHeader: Dados de Vizinhança não encontrados para o usuário.");
                }
            } else {
                console.warn("UserHeader: 'nomeUtilizador' não encontrado nos dados do usuário da API.");
                setCurrentUser(null);
            }
          } else {
            console.warn("UserHeader: Estrutura de dados inesperada ou sem 'user'. Resposta:", response.data);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("UserHeader: Erro ao buscar dados do usuário:", error);
          if (axios.isAxiosError(error)) {
            console.error("UserHeader: Detalhes do erro Axios:", error.response?.status, error.response?.data);
            if (error.response?.status === 401) { Cookies.remove('jwt'); }
          }
          setCurrentUser(null);
        } finally {
          setIsLoadingUser(false);
        }
      } else {
        setIsLoadingUser(false);
        setCurrentUser(null);
      }
    };
    fetchUserData();
  }, []);

  // ... (handleMenuToggle, handleLogout, useEffect para handleClickOutside - MANTIDOS COMO ANTES) ...
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
  };

  const handleLogout = () => {
    Cookies.remove('jwt');
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) { document.addEventListener('mousedown', handleClickOutside); }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [showUserMenu]);


  return (
    <header className='bg-white shadow-sm h-20 w-full font-[Inter] flex justify-between px-6 sm:px-12 md:px-24 items-center sticky top-0 z-50'>
      {/* Logo e Nome da Aplicação */}
      <div className='flex items-center'> {/* Container para Logo e Vizinhança */}
        <a href="/" className='flex items-center'>
          <img src="/icon.png" alt="NextDoor Logo" className='w-[40px] h-[40px]' />
          <h1 className='font-bold text-[#5A5A5A] text-xl ml-2 hidden sm:block'>NextDoor</h1>
        </a>
        {/* Exibir Vizinhança do Usuário */}
        {currentUser && currentUser.Vizinhanca && (
          <div className="ml-4 pl-4 border-l border-gray-300 hidden md:flex items-center">
            <MapPinIcon className="h-5 w-5 text-green-600 mr-1.5" />
            <span className="text-sm text-gray-600 font-medium">{currentUser.Vizinhanca.nomeFreguesia}</span>
          </div>
        )}
      </div>

      {/* Links de Navegação e Seção do Usuário/Login */}
      <div className='flex items-center space-x-6 md:space-x-8'>
        <ul className='flex space-x-4 items-center text-[#5A5A5A] text-sm sm:text-base'>
          <li><a href="/produtos" className='text-green-600 font-semibold hover:text-green-700 transition-colors'><strong>Produtos</strong></a></li>
          <li><a href="/tarefas" className='hover:text-black transition-colors'>Tarefas</a></li>
        </ul>

        {isLoadingUser ? (
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md"></div>
        ) : currentUser ? (
          <div className="flex items-center space-x-3 relative" ref={menuRef}>
            <span className="text-gray-700 text-sm font-medium hidden md:block">{currentUser.nomeUtilizador}</span>
            <button
              onClick={handleMenuToggle}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              aria-label="Menu do usuário"
            >
              <img src="/man.png" alt="Perfil" className="w-8 h-8 rounded-full object-cover" />
            </button>
            {showUserMenu && (
              <div className="origin-top-right absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md w-48 py-1 ring-1 ring-black ring-opacity-5 z-20 animate-modalFadeInScale">
                <button
                  onClick={() => { setShowProfileForm(true); setShowUserMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Alterar Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Terminar Sessão
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center space-x-3'>
            <a href="/login" className='text-[#5A5A5A] hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors'>Login</a>
            <a href="/register" className='bg-[#4CAF4F] hover:bg-[#439A45] duration-150 ease-in-out text-white px-4 py-2.5 rounded-md text-sm font-light'>Registre-se</a>
          </div>
        )}
      </div>

      {showProfileForm && currentUser && (
        <ProfileForm
           userData={{
            nomeUtilizador: currentUser.nomeUtilizador,
            email: currentUser.emailUtilizador || '', 
            dataNascimento: currentUser.dataNascimento || '',
            pontos: currentUser.pontos || 0,
            comprovativoResidencia: currentUser.comprovativoResidencia || '',
            utilizador: currentUser.utilizadorLogin || '', 
            password: ''
          }}
          toggleModal={() => setShowProfileForm(false)}
        />
      )}
    </header>
  );
};