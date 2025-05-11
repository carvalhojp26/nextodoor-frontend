// src/components/UserProduct.tsx

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { MagnifyingGlassIcon, TagIcon, PhotoIcon as PlaceholderPhotoIcon } from '@heroicons/react/24/outline';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import { UserHeader } from './UserHeader';
import { Footer } from '../../components/Footer'; // Ajuste o caminho conforme sua estrutura

// --- Interfaces ---
interface Produto {
  idProduto: number;
  nomeProduto: string;
  precoProduto: number; // "Pontos"
  descricaoProduto: string;
  imagemProduto?: string;
  tipoProdutoId: number; // Chave estrangeira para o tipo de produto (categoria)

  // Dados aninhados que podem vir do backend (ajuste conforme sua API)
  Estabelecimento?: {
    idEstabelecimento?: number;
    nomeEstabelecimento: string;
  };
  tipoProduto?: { // Se o backend enviar o objeto tipoProduto aninhado
    idTipoProduto?: number;
    tipoProduto: string; // Nome do atributo que contém o nome do tipo no backend
  };
  // estadoProduto não é usado diretamente nos cards aqui, mas pode ser útil
}

interface Categoria { // Para o dropdown de filtro de categorias
  idTipoProduto: number;
  nomeTipoProduto: string; // O nome da categoria que vem da API /api/product-types/
}

// Interface para a resposta esperada ao criar um código de resgate
interface RedemptionCodeData { // Os dados do código de resgate em si
    idCodigoResgate: number;
    codigo: string; // O código alfanumérico gerado
    dataCriacao: string; // ou Date
    Produto?: { // Informações do produto resgatado (se o backend incluir)
        nomeProduto: string;
        precoProduto: number;
    };
    // Adicione outros campos que seu backend retorna para um código de resgate
}

interface CreateRedemptionCodeResponse { // Resposta completa da API
  message: string;
  redemptionCode?: RedemptionCodeData; // Opcional, dependendo do que o backend retorna
  // Se o backend retornar o código string diretamente:
  // code?: string; 
}


// --- Componente UserProduct ---
export const UserProduct = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para a funcionalidade de resgate
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null); // Guarda o ID do produto sendo resgatado
  const [redeemMessage, setRedeemMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setRedeemMessage(null); // Limpa mensagens de resgate anteriores ao carregar
      const token = Cookies.get('jwt');

      if (!token) {
        setError('Usuário não autenticado. Por favor, faça login.');
        setIsLoading(false);
        if (typeof window !== 'undefined') {
            // window.location.href = '/login'; // Descomente para redirecionar
        }
        return;
      }

      try {
        console.log("UserProduct: Iniciando busca de dados...");
        const productsPromise = axios.get('http://localhost:3000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const categoriesPromise = axios.get('http://localhost:3000/api/product-types/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const [productsRes, categoriesRes] = await Promise.all([
          productsPromise,
          categoriesPromise,
        ]);

        console.log("UserProduct: Resposta da API de Produtos:", productsRes.data);
        setProdutos(productsRes.data.products || (Array.isArray(productsRes.data) ? productsRes.data : []));
        
        console.log("UserProduct: Resposta da API de Categorias:", categoriesRes.data);
        setCategorias(categoriesRes.data.productTypes || []);

      } catch (err) {
        console.error("UserProduct: Erro ao buscar dados:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            setError('Sessão inválida ou expirada. Por favor, faça login novamente.');
            Cookies.remove('jwt');
        } else {
            setError('Falha ao carregar os produtos ou categorias. Tente novamente mais tarde.');
        }
      } finally {
        setIsLoading(false);
        console.log("UserProduct: Busca de dados finalizada.");
      }
    };

    fetchData();
  }, []); // Executa uma vez ao montar

  const filteredProdutos = useMemo(() => {
    // Logs de depuração para o filtro (mantenha se ainda estiver depurando o filtro)
    // console.log("FILTER: Iniciando filtragem...");
    // console.log("FILTER: Termo:", searchTerm, "Categoria ID:", selectedCategoria);
    // console.log("FILTER: Produtos antes:", produtos.length);
    
    const produtosFiltrados = produtos.filter(produto => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearchTerm = produto.nomeProduto.toLowerCase().includes(lowerSearchTerm);
      
      let matchesCategory = true; 
      if (selectedCategoria) { 
        const selectedCategoriaId = parseInt(selectedCategoria, 10);
        matchesCategory = produto.tipoProdutoId === selectedCategoriaId;
        // if(matchesSearchTerm) { // Log para depuração do filtro de categoria
        //   console.log(`  Prod: "${produto.nomeProduto}", ProdCatID: ${produto.tipoProdutoId}, SelCatID: ${selectedCategoriaId}, MatchCat: ${matchesCategory}`);
        // }
      }
      return matchesSearchTerm && matchesCategory;
    });
    // console.log("FILTER: Produtos depois:", produtosFiltrados.length);
    return produtosFiltrados;
  }, [produtos, searchTerm, selectedCategoria]);

  const handleRedeem = async (produtoId: number, nomeProduto: string, pontosNecessarios: number) => {
    const token = Cookies.get('jwt');
    if (!token) {
      setRedeemMessage({type: 'error', text: "Sessão expirada. Por favor, faça login novamente."});
      // Idealmente, redirecionar para login
      return;
    }

    if (!window.confirm(`Tem certeza que deseja redimir "${nomeProduto}" por ${pontosNecessarios} pontos? Esta ação não pode ser desfeita (por enquanto).`)) {
      return;
    }

    setIsRedeeming(produtoId);
    setRedeemMessage(null);

    try {
      // ⭐ Verifique se 'ProdutoidProduto' é a chave que seu backend espera para o ID do produto ⭐
      const payload = { ProdutoidProduto: produtoId }; 
      console.log("UserProduct: Enviando para /api/redemption-codes/ payload:", payload);

      const response = await axios.post<CreateRedemptionCodeResponse>(
        'http://localhost:3000/api/redemption-codes/', 
        payload, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("UserProduct: Resposta da criação do código de resgate:", response.data);

      if (response.data.redemptionCode && response.data.redemptionCode.codigo) {
        setRedeemMessage({type: 'success', text: `Produto "${response.data.redemptionCode.Produto?.nomeProduto || nomeProduto}" resgatado! Seu código é: ${response.data.redemptionCode.codigo}`});
        // TODO: Considerar atualizar os pontos do usuário no UserHeader.
        // Isso pode exigir um evento/callback ou um gerenciador de estado global.
        // TODO: Considerar atualizar a lista de produtos se o estoque diminuir e o produto ficar indisponível.
        // Ex: fetchData(); // Recarrega todos os produtos
      } else if (response.data.message) {
        setRedeemMessage({type: 'success', text: response.data.message});
      } else {
        setRedeemMessage({type: 'success', text: "Produto resgatado com sucesso! (Código não retornado)"});
      }

    } catch (err: any) {
      console.error("UserProduct: Erro ao redimir produto:", err);
      let errorMessage = "Falha ao redimir o produto.";
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        // Tenta pegar a mensagem de erro específica do backend
        const errorData = err.response.data;
        errorMessage += ` Detalhes: ${errorData.error || errorData.message || JSON.stringify(errorData)}`;
      } else if (err.message) {
        errorMessage += ` Detalhes: ${err.message}`;
      }
      setRedeemMessage({type: 'error', text: errorMessage});
    } finally {
      setIsRedeeming(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-500 mt-4">A carregar produtos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col">
        <UserHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xl text-red-600 bg-red-100 p-4 rounded-md shadow">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <UserHeader />

      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Mensagem de Feedback do Resgate */}
        {redeemMessage && (
          <div 
            className={`mb-6 p-4 rounded-md text-center text-sm shadow transition-all duration-300 ease-in-out transform ${
              redeemMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
            role="alert"
          >
            {redeemMessage.text}
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="mb-8 p-5 sm:p-6 bg-white rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              className="form-input pl-10 w-full !py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px]">
            <select
              className="form-select w-full !py-2.5"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              {categorias.map((cat) => (
                <option key={cat.idTipoProduto} value={cat.idTipoProduto.toString()}>
                  {cat.nomeTipoProduto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Produtos */}
        {filteredProdutos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
            {filteredProdutos.map((produto) => (
              <div 
                key={produto.idProduto} 
                className="bg-white rounded-xl shadow-lg flex flex-col group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-t-xl overflow-hidden">
                  {produto.imagemProduto ? (
                    <img 
                      src={produto.imagemProduto} 
                      alt={produto.nomeProduto} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <PlaceholderPhotoIcon className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 
                    className="text-md font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors" 
                    title={produto.nomeProduto}
                  >
                    {produto.nomeProduto}
                  </h3>
                  {/* Exibindo dados aninhados se vierem da API */}
                  {produto.Estabelecimento && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate" title={produto.Estabelecimento.nomeEstabelecimento}>
                      <span className="font-medium">Local:</span> {produto.Estabelecimento.nomeEstabelecimento}
                    </p>
                  )}
                  {produto.tipoProduto && (
                    <p className="text-xs text-purple-600 mt-0.5 truncate" title={produto.tipoProduto.tipoProduto}>
                      <span className="font-medium">Cat:</span> {produto.tipoProduto.tipoProduto}
                    </p>
                  )}
                  <p className="text-lg font-bold text-green-600 mt-1 mb-4">
                    {produto.precoProduto} <span className="text-sm font-normal text-gray-500">Pontos</span>
                  </p>
                  <button
                    onClick={() => handleRedeem(produto.idProduto, produto.nomeProduto, produto.precoProduto)}
                    className="btn-redeem mt-auto" 
                    disabled={isRedeeming === produto.idProduto}
                  >
                    {isRedeeming === produto.idProduto ? (
                      <svg className="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <ShoppingCartIcon className="h-5 w-5 mr-1.5 inline-block" />
                    )}
                    {isRedeeming === produto.idProduto ? 'A Redimir...' : 'Redimir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && ( 
            <div className="text-center py-16 bg-white rounded-lg shadow-md mt-8">
              <TagIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum produto encontrado</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || selectedCategoria 
                  ? "Tente alterar os termos da sua pesquisa ou o filtro de categoria." 
                  : "Parece que não há produtos disponíveis na sua vizinhança no momento."}
              </p>
            </div>
          )
        )}
      </main>
      
      <Footer />
    </div>
  );
};