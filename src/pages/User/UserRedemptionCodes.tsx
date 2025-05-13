// src/pages/User/UserRedemptionCodes.tsx (ou onde colocares as páginas de utilizador)
import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { UserHeader } from './UserHeader'; // Ajusta o caminho
import { Footer } from '../../components/Footer'; // Ajusta o caminho
import { TicketIcon, CalendarDaysIcon, CheckBadgeIcon, CubeIcon } from '@heroicons/react/24/outline';


interface ProdutoInfo {
  idProduto: number;
  nomeProduto: string;
  imagemProduto?: string;
  descricaoProduto?: string;
}

interface EstadoResgateInfo {
  idEstadoResgate: number;
  estadoResgate: string;
}

// O nome da propriedade para o produto aninhado deve corresponder ao que o backend envia
// Se não há 'as' na associação resgateCodigo.belongsTo(Produto), será 'Produto'
interface UserRedemptionCode {
  idResgate: number;
  codigo: string;
  dataResgate: string; // Vem como string, formatar depois
  ProdutoidProduto: number;
  UtilizadoridUtilizador: number;
  estadoResgateidEstadoResgate: number;
  
  Produto?: ProdutoInfo; // Nome do modelo se não houver alias na associação ResgateCodigo -> Produto
  estadoDoResgate?: EstadoResgateInfo; // Nome do alias 'estadoDoResgate' se definido na associação
}

interface GetRedemptionCodesResponse {
  message: string;
  redemptionCodes: UserRedemptionCode[];
  // Adicionar paginação se o backend a suportar para esta rota
}

export const UserRedemptionCodes: React.FC = () => {
  const [codes, setCodes] = useState<UserRedemptionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = Cookies.get('jwt');

    if (!token) {
      setError('Utilizador não autenticado. Por favor, faça login.');
      setIsLoading(false);
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.get<GetRedemptionCodesResponse>(`http://localhost:3000/api/redemptionCodes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCodes(response.data.redemptionCodes || []);
    } catch (err) {
      console.error("UserRedemptionCodes: Erro ao buscar códigos:", err);
      const axiosError = err as AxiosError<any>;
      const errorMsg = axiosError.response?.data?.error || 'Falha ao carregar os seus códigos de resgate.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center py-10"><div className="text-center"><p className="text-xl text-gray-500">A carregar seus códigos...</p></div></div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col">
        <UserHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><p className="text-xl text-red-600 bg-red-100 p-4 rounded-md shadow">{error}</p></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <UserHeader />
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Meus Códigos de Resgate</h1>
        {codes.length > 0 ? (
          <div className="space-y-6">
            {codes.map((code) => {
              const imageUrl = code.Produto?.imagemProduto; // Assumindo URL completo ou path que o servidor entende
              return (
                <div key={code.idResgate} className="bg-white shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    {imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? (
                      <img src={imageUrl} alt={code.Produto?.nomeProduto || 'Imagem do Produto'} className="w-full h-full object-cover" />
                    ) : (
                      <CubeIcon className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-green-600 mb-1">Código: {code.codigo}</h2>
                    {code.Produto && (
                      <p className="text-lg text-gray-700 font-medium mb-2">{code.Produto.nomeProduto}</p>
                    )}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p className="flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-400" />Data do Resgate: {formatDate(code.dataResgate)}</p>
                      {code.estadoDoResgate && ( // Usa o nome do alias se definido, senão o nome do modelo
                        <p className="flex items-center">
                          <CheckBadgeIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Estado: <span className="font-semibold ml-1">{code.estadoDoResgate.estadoResgate}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-auto">
                    <button 
                        className="btn-primary-outline text-sm px-4 py-2" // Adapta a classe do botão
                        onClick={() => navigator.clipboard.writeText(code.codigo).then(() => alert('Código copiado!'))}
                    >
                        Copiar Código
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <TicketIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum código de resgate encontrado.</h3>
            <p className="mt-2 text-gray-500">Redima produtos na loja para ver seus códigos aqui.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};