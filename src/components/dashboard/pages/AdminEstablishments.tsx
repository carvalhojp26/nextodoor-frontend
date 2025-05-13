// src/components/AdminEstablishments.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChevronLeftIcon, ChevronRightIcon,
  // PhotoIcon, // Não mais necessário se removermos completamente a imagem
} from '@heroicons/react/24/outline';

const token = Cookies.get('jwt');

interface EstabelecimentoFromAPI {
  idEstabelecimento: number;
  nomeEstabelecimento: string;
  EnderecoidEndereco?: number;
  VizinhancaidVizinhanca?: number;
  Endereco?: Address;
  Vizinhanca?: Neighborhood;
  telefoneEstabelecimento: string;
  emailEstabelecimento: string;
}

interface NewEstablishmentFormState {
  nomeEstabelecimento?: string;
  telefoneEstabelecimento?: string;
  emailEstabelecimento?: string;
  enderecoId?: number;
  neighborhoodId?: number;
}

interface Neighborhood {
  idVizinhanca: number;
  nomeFreguesia: string;
}

interface Address {
  idEndereco: number;
  numeroPorta: string;
  distrito: string;
  freguesia: string;
  codigoPostal: string;
  rua: string;
}

export const AdminEstablishments = () => {
  const [estabelecimentos, setEstabelecimentos] = useState<EstabelecimentoFromAPI[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedFilterNeighborhood, setSelectedFilterNeighborhood] = useState<string>("");
  const [newEstablishment, setNewEstablishment] = useState<NewEstablishmentFormState>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEstablishmentDetails, setSelectedEstablishmentDetails] = useState<EstabelecimentoFromAPI | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchNeighborhoods();
    fetchAddresses();
  }, []);

  useEffect(() => {
    fetchEstablishments();
  }, [selectedFilterNeighborhood, currentPage, itemsPerPage]);

  useEffect(() => {
    if (selectedFilterNeighborhood !== "" && currentPage !== 1) {
        setCurrentPage(1);
    } else if (selectedFilterNeighborhood === "" && currentPage !== 1 && totalItems > 0) {
        setCurrentPage(1);
    }
  }, [selectedFilterNeighborhood, totalItems]);


  const fetchNeighborhoods = async () => { 
    try {
        const res = await axios.get('http://localhost:3000/api/neighborhoods/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNeighborhoods(res.data.neighborhoods || res.data.neighborhood || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
        console.error('Erro ao carregar vizinhanças:', err);
        setMessage('Erro ao carregar vizinhanças.');
    }
  };
  const fetchAddresses = async () => { 
    try {
        const res = await axios.get('http://localhost:3000/api/addresses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(res.data.addresses || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
        console.error('Erro ao carregar endereços:', err);
        setMessage('Erro ao carregar endereços.');
    }
  };
  const fetchEstablishments = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      let url = 'http://localhost:3000/api/establishments/all'; 
      if (selectedFilterNeighborhood) {
        url = `http://localhost:3000/api/establishments/neighborhood/${selectedFilterNeighborhood}`;
      }
      const res = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: itemsPerPage } 
      });
      setEstabelecimentos(res.data.establishments || []);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      console.error('Erro ao carregar estabelecimentos:', err);
      setEstabelecimentos([]);
      setTotalItems(0);
      setMessage('Erro ao carregar estabelecimentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEstablishment(prev => ({
      ...prev,
      [name]: (name === 'enderecoId' || name === 'neighborhoodId') && value !== '' ? Number(value) : value
    }));
  };
  
  const handleAddEstablishment = async () => {
    const { nomeEstabelecimento, telefoneEstabelecimento, emailEstabelecimento, enderecoId, neighborhoodId } = newEstablishment;
    if (!nomeEstabelecimento || !telefoneEstabelecimento || !emailEstabelecimento || !enderecoId || !neighborhoodId) {
      setMessage('Nome, Telefone, Email, Endereço e Vizinhança são obrigatórios.');
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    const payloadParaBackend = {
      nomeEstabelecimento,
      telefoneEstabelecimento,
      emailEstabelecimento,
      EnderecoidEndereco: enderecoId,
      VizinhancaidVizinhanca: neighborhoodId,
    };
    try {
      await axios.post('http://localhost:3000/api/establishments/', payloadParaBackend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Estabelecimento adicionado com sucesso!');
      setShowFormModal(false);
      setNewEstablishment({});
      await fetchEstablishments(); 
    } catch (err: any) {
      console.error('Erro ao adicionar estabelecimento:', err);
      let errorMessage = 'Erro ao adicionar estabelecimento.';
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        errorMessage += ` Detalhes: ${JSON.stringify(err.response.data.error || err.response.data)}`;
      }
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddressForDisplay = (addressId: number | undefined): string => {
    if (addressId === undefined) return 'N/A';
    const address = addresses.find(addr => addr.idEndereco === addressId);
    return address ? `${address.rua}, ${address.numeroPorta || ''} - ${address.codigoPostal} ${address.freguesia}` : `Endereço não encontrado`;
  };
  
  const getNeighborhoodName = (neighborhoodId: number | undefined): string => {
    if (neighborhoodId === undefined) return 'N/A';
    return neighborhoods.find(n => n.idVizinhanca === neighborhoodId)?.nomeFreguesia || `Vizinhança não encontrada`;
  };

  const handleOpenDetailsModal = (est: EstabelecimentoFromAPI) => {
    setSelectedEstablishmentDetails(est);
    setShowDetailsModal(true);
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEstablishmentDetails(null);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (newPage: number) => { 
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5; 
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        if (totalPages > 0) pageNumbers.push(1); 
        if (currentPage > halfPagesToShow + 2) {
            if (currentPage - halfPagesToShow > 2) { 
                 pageNumbers.push('...');
            }
        }
        let startPage = Math.max(2, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
        if (currentPage <= halfPagesToShow + 1) {
            endPage = Math.min(totalPages - 1, maxPagesToShow);
        } else if (currentPage >= totalPages - halfPagesToShow) {
            startPage = Math.max(2, totalPages - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            if (i > 0) pageNumbers.push(i);
        }
        if (currentPage < totalPages - halfPagesToShow - 1) {
            if (currentPage + halfPagesToShow < totalPages -1) { 
                pageNumbers.push('...'); 
            }
        }
        if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
            pageNumbers.push(totalPages);
        }
    }
    return pageNumbers.filter((item, index, self) => {
        if (item === '...') { return index === 0 || self[index - 1] !== '...'; }
        return self.findIndex(it => it === item) === index; 
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Estabelecimentos
            </h2>
            <button
              className="btn-primary mt-4 sm:mt-0" 
              onClick={() => { setShowFormModal(true); setMessage(null); setNewEstablishment({}); }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Adicionar Estabelecimento
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 text-center rounded-md shadow text-sm flex items-center justify-center gap-2 ${message.toLowerCase().includes('erro') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              <InformationCircleIcon className="h-5 w-5" />
              <span>{message}</span>
            </div>
          )}
          
          <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
            <label htmlFor="filterNeighborhood" className="form-label">Filtrar por Vizinhança:</label> {/* Usando sua classe .form-label */}
            <select
              id="filterNeighborhood"
              value={selectedFilterNeighborhood}
              onChange={(e) => setSelectedFilterNeighborhood(e.target.value)}
              className="form-select mt-1" 
            >
              <option value="">Todas as Vizinhanças</option>
              {neighborhoods.map(n => (
                <option key={n.idVizinhanca} value={n.idVizinhanca.toString()}>{n.nomeFreguesia}</option>
              ))}
            </select>
          </div>

          {showFormModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300" onClick={() => setShowFormModal(false)}>
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-modalFadeInScale" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 mb-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-800">Adicionar Novo Estabelecimento</h3>
                  <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="nomeEstabelecimento" className="form-label">Nome <span className="text-red-500">*</span></label>
                    <input id="nomeEstabelecimento" type="text" name="nomeEstabelecimento" className="form-input" value={newEstablishment.nomeEstabelecimento || ''} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label htmlFor="telefoneEstabelecimento" className="form-label">Telefone <span className="text-red-500">*</span></label>
                    <input id="telefoneEstabelecimento" type="tel" name="telefoneEstabelecimento" className="form-input" value={newEstablishment.telefoneEstabelecimento || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="emailEstabelecimento" className="form-label">Email <span className="text-red-500">*</span></label>
                    <input id="emailEstabelecimento" type="email" name="emailEstabelecimento" className="form-input" value={newEstablishment.emailEstabelecimento || ''} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label htmlFor="enderecoId" className="form-label">Endereço <span className="text-red-500">*</span></label>
                    <select id="enderecoId" name="enderecoId" className="form-select" value={newEstablishment.enderecoId || ""} onChange={handleInputChange} required>
                      <option value="" disabled>-- Selecione --</option>
                      {addresses.map(addr => (<option key={addr.idEndereco} value={addr.idEndereco}>{`${addr.rua}, ${addr.numeroPorta} - ${addr.codigoPostal}`}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="neighborhoodId" className="form-label">Vizinhança <span className="text-red-500">*</span></label>
                    <select id="neighborhoodId" name="neighborhoodId" className="form-select" value={newEstablishment.neighborhoodId || ""} onChange={handleInputChange} required>
                      <option value="" disabled>-- Selecione --</option>
                      {neighborhoods.map(n => (<option key={n.idVizinhanca} value={n.idVizinhanca}>{n.nomeFreguesia}</option>))}
                    </select>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button className="btn-secondary w-full sm:w-auto" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>
                    Cancelar
                  </button>
                  <button className="btn-primary w-full sm:w-auto" onClick={handleAddEstablishment} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        A Adicionar...
                      </span>
                    ) : 'Adicionar Estabelecimento'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDetailsModal && selectedEstablishmentDetails && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={handleCloseDetailsModal}>
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all animate-modalFadeInScale" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center pb-4 mb-5 border-b">
                        <h3 className="text-xl font-semibold text-blue-700">{selectedEstablishmentDetails.nomeEstabelecimento}</h3>
                        <button onClick={handleCloseDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2 text-gray-500"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Telefone:</strong> {selectedEstablishmentDetails.telefoneEstabelecimento}</p>
                        <p className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Email:</strong> {selectedEstablishmentDetails.emailEstabelecimento}</p>
                        <p className="flex items-start"><MapPinIcon className="h-4 w-4 mr-2 text-gray-500 mt-0.5 shrink-0"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Endereço:</strong> <span>{selectedEstablishmentDetails.Endereco ? formatAddressForDisplay(selectedEstablishmentDetails.Endereco.idEndereco) : formatAddressForDisplay(selectedEstablishmentDetails.EnderecoidEndereco)}</span></p>
                        <p className="flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2 text-gray-500"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Vizinhança:</strong> {selectedEstablishmentDetails.Vizinhanca?.nomeFreguesia || getNeighborhoodName(selectedEstablishmentDetails.VizinhancaidVizinhanca)}</p>
                    </div>
                    <div className="mt-8 pt-5 border-t flex justify-end">
                        <button className="btn-secondary" onClick={handleCloseDetailsModal}>Fechar</button>
                    </div>
                </div>
            </div>
          )}

          {isLoading && estabelecimentos.length === 0 && (
            <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-gray-600">A carregar estabelecimentos...</p>
            </div>
          )}
          {!isLoading && estabelecimentos.length === 0 && !message && (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <BuildingStorefrontIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-3 text-lg font-semibold text-gray-700">Nenhum estabelecimento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedFilterNeighborhood ? "Tente limpar o filtro de vizinhança." : "Comece por adicionar um novo estabelecimento."}
              </p>
            </div>
          )}

          {estabelecimentos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {estabelecimentos.map(est => (
                <div key={est.idEstabelecimento} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group">
                  <div className="p-5 flex flex-col flex-grow">
                    <h3
                      className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 cursor-pointer transition-colors"
                      onClick={() => handleOpenDetailsModal(est)}
                    >
                      {est.nomeEstabelecimento}
                    </h3>
                    <div className="text-xs text-gray-500 mt-3 space-y-2 flex-grow">
                        <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/> 
                          <span>{est.Endereco ? formatAddressForDisplay(est.Endereco.idEndereco) : formatAddressForDisplay(est.EnderecoidEndereco)}</span>
                        </p>
                        <p className="flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/> 
                          <span>{est.Vizinhanca?.nomeFreguesia || getNeighborhoodName(est.VizinhancaidVizinhanca)}</span>
                        </p>
                        <p className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/> 
                          <span>{est.telefoneEstabelecimento}</span>
                        </p>
                        <p className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/> 
                          <span className="truncate">{est.emailEstabelecimento}</span>
                        </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100">
                         <button
                            onClick={() => handleOpenDetailsModal(est)} 
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-left py-1"
                        >
                            Ver Detalhes →
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="btn-secondary p-2 rounded-full disabled:opacity-50" 
                    aria-label="Página Anterior"
                >
                    <ChevronLeftIcon className="h-5 w-5"/>
                </button>
                
                {renderPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            disabled={isLoading}
                            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors
                                ${currentPage === page
                                ? 'btn-primary' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="px-1.5 py-1.5 text-sm text-gray-500">...</span>
                    )
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="btn-secondary p-2 rounded-full disabled:opacity-50" 
                    aria-label="Próxima Página"
                >
                    <ChevronRightIcon className="h-5 w-5"/>
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};