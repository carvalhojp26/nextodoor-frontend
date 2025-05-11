import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../Sidebar'; // Certifique-se que o caminho está correto
import { DashboardHeader } from '../DashboardHeader'; // Certifique-se que o caminho está correto
import Cookies from 'js-cookie';
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, PhotoIcon, TagIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const token = Cookies.get('jwt');

// --- Interfaces ---
interface Produto {
  idProduto: number;
  nomeProduto: string;
  precoProduto: number;
  descricaoProduto: string;
  estadoProdutoidEstadoProduto: number;
  tipoProdutoId: number;
  estabelecimentoId: number;
  imagemProduto?: string;

  // Dados incluídos pelo backend
  Estabelecimento?: { idEstabelecimento?: number; nomeEstabelecimento: string };
  tipoProduto?: { idTipoProduto?: number; tipoProduto: string }; // Atributo 'tipoProduto' para o nome
  estadoProduto?: { idEstadoProduto?: number; estadoProduto: string }; // Atributo 'estadoProduto' para o nome
}

interface NewProductFormState {
  nomeProduto?: string;
  precoProduto?: number;
  descricaoProduto?: string;
  estadoProdutoidEstadoProduto?: number;
  tipoProdutoId?: number;
  estabelecimentoId?: number;
  imagemProduto?: string;
}

// Interfaces para as listas de dropdown nos formulários
interface TipoProdutoLista {
  idTipoProduto: number;
  nomeTipoProduto: string;
}

interface EstadoProdutoLista {
  idEstadoProduto: number;
  nomeEstado: string;
}

interface EstabelecimentoLista {
  idEstabelecimento: number;
  nomeEstabelecimento: string;
}

// --- Componente AdminProduct ---
export const AdminProduct = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tiposProdutoLista, setTiposProdutoLista] = useState<TipoProdutoLista[]>([]);
  const [estadosProdutoLista, setEstadosProdutoLista] = useState<EstadoProdutoLista[]>([]);
  const [estabelecimentosLista, setEstabelecimentosLista] = useState<EstabelecimentoLista[]>([]);

  const [currentProduct, setCurrentProduct] = useState<NewProductFormState>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const productsPromise = axios.get('http://localhost:3000/api/products/all', { headers: { Authorization: `Bearer ${token}` } });
        const typesPromise = axios.get('http://localhost:3000/api/product-types/', { headers: { Authorization: `Bearer ${token}` } });
        const statesPromise = axios.get('http://localhost:3000/api/product-status/', { headers: { Authorization: `Bearer ${token}` } });
        const establishmentsPromise = axios.get('http://localhost:3000/api/establishments/all', { headers: { Authorization: `Bearer ${token}` } });

        const [productsRes, typesRes, statesRes, establishmentsRes] = await Promise.all([
          productsPromise, typesPromise, statesPromise, establishmentsPromise,
        ]);

        setProdutos(productsRes.data.products || []);
        setTiposProdutoLista(typesRes.data.productTypes || []);
        setEstadosProdutoLista(statesRes.data.productStatus || []);
        setEstabelecimentosLista(establishmentsRes.data.establishments || []);

      } catch (err) {
        handleApiError(err, 'Erro fatal ao carregar dados iniciais.');
        setProdutos([]); setTiposProdutoLista([]); setEstadosProdutoLista([]); setEstabelecimentosLista([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement; // Cast para acesso ao 'checked'
    const isNumericField = name === 'precoProduto' || name === 'estadoProdutoidEstadoProduto' || name === 'tipoProdutoId' || name === 'estabelecimentoId';

    setCurrentProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : (type === 'number' || (isNumericField && value !== '')) ? Number(value) : value
    }));
  };

  const handleOpenAddForm = () => {
    setIsEditing(false); setEditingProductId(null); setCurrentProduct({});
    setShowFormModal(true); setMessage(null);
  };

  const handleOpenEditForm = (produto: Produto) => {
    setIsEditing(true); setEditingProductId(produto.idProduto);
    setCurrentProduct({
      nomeProduto: produto.nomeProduto,
      precoProduto: produto.precoProduto,
      descricaoProduto: produto.descricaoProduto,
      estadoProdutoidEstadoProduto: produto.estadoProdutoidEstadoProduto,
      tipoProdutoId: produto.tipoProdutoId,
      estabelecimentoId: produto.estabelecimentoId,
      imagemProduto: produto.imagemProduto || '',
    });
    setShowFormModal(true); setMessage(null);
  };

  const handleApiError = (err: any, defaultMessage: string) => {
    console.error(defaultMessage, err);
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      const errorData = err.response.data;
      errorMessage += ` Detalhes: ${typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error || errorData)}`;
    }
    setMessage(errorMessage);
  };

  const handleFormSubmit = async () => {
    const { nomeProduto, precoProduto, descricaoProduto, estadoProdutoidEstadoProduto, tipoProdutoId, estabelecimentoId } = currentProduct;
    if (!nomeProduto || precoProduto === undefined || precoProduto < 0 || !descricaoProduto || !estadoProdutoidEstadoProduto || !tipoProdutoId || !estabelecimentoId) {
      setMessage('Nome, Preço (válido), Descrição, Estado, Tipo e Estabelecimento são obrigatórios.');
      return;
    }
    setIsSubmitting(true); setMessage(null);
    const payload = { ...currentProduct, imagemProduto: currentProduct.imagemProduto || null };

    try {
      if (isEditing && editingProductId) {
        await axios.patch(`http://localhost:3000/api/products/${editingProductId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setMessage('Produto atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:3000/api/products', payload, { headers: { Authorization: `Bearer ${token}` } });
        setMessage('Produto adicionado com sucesso!');
      }
      setShowFormModal(false); setCurrentProduct({}); setIsEditing(false); setEditingProductId(null);
      // Recarregar dados para garantir que a lista reflita as mudanças, incluindo dados aninhados
      const fetchData = async () => { // Definindo fetchData localmente ou mova para fora do useEffect se for usar em mais lugares
        setIsLoading(true);
        // ... (código de fetchData, pode ser refatorado para uma função separada)
        try {
            const productsRes = await axios.get('http://localhost:3000/api/products/all', { headers: { Authorization: `Bearer ${token}` }});
            setProdutos(productsRes.data.products || []);
        } catch(err) {
            handleApiError(err, 'Erro ao recarregar produtos.');
        } finally {
            setIsLoading(false);
        }
      };
      fetchData();
    } catch (err) {
      handleApiError(err, `Erro ao ${isEditing ? 'atualizar' : 'adicionar'} produto.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduto = async (idProduto: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) return;
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/products/${idProduto}`, { headers: { Authorization: `Bearer ${token}` } });
      setProdutos(produtos.filter(p => p.idProduto !== idProduto));
      setMessage('Produto excluído com sucesso.');
    } catch (err) {
      handleApiError(err, 'Erro ao excluir produto.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEstabelecimentoNomeFallback = (id: number | undefined): string => {
    if (id === undefined) return 'N/A';
    return estabelecimentosLista.find(e => e.idEstabelecimento === id)?.nomeEstabelecimento || 'Desconhecido';
  };

  const getTipoProdutoNomeFallback = (id: number | undefined): string => {
    if (id === undefined) return 'N/A';
    return tiposProdutoLista.find(t => t.idTipoProduto === id)?.nomeTipoProduto || 'Desconhecido';
  };

  const getEstadoProdutoNomeFallback = (id: number | undefined): string => {
    if (id === undefined) return 'N/A';
    return estadosProdutoLista.find(e => e.idEstadoProduto === id)?.nomeEstado || 'Desconhecido';
  };

  if (isLoading && !produtos.length && !message) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-gray-500">A carregar dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestão de Produtos</h2>
            <button
              className="btn-primary px-5 py-2.5 text-sm" // Use sua classe .btn-primary
              onClick={handleOpenAddForm}
            >
              <span className="mr-2">+</span>Adicionar Produto
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-center text-sm shadow-sm ${message.toLowerCase().includes('erro') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              {message}
            </div>
          )}

          {showFormModal && (
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
              onClick={() => setShowFormModal(false)}
            >
              <div
                className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInScale"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
                  </h3>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Fechar modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label htmlFor="nomeProduto" className="form-label">Nome do Produto <span className="text-red-500">*</span></label>
                      <input id="nomeProduto" type="text" name="nomeProduto" className="form-input" value={currentProduct.nomeProduto || ''} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <label htmlFor="precoProduto" className="form-label">Preço (€) <span className="text-red-500">*</span></label>
                      <input id="precoProduto" type="number" name="precoProduto" step="0.01" min="0" className="form-input" value={currentProduct.precoProduto === undefined ? '' : currentProduct.precoProduto} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="descricaoProduto" className="form-label">Descrição <span className="text-red-500">*</span></label>
                    <textarea id="descricaoProduto" name="descricaoProduto" rows={3} className="form-input min-h-[80px]" value={currentProduct.descricaoProduto || ''} onChange={handleInputChange} required></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                    <div>
                      <label htmlFor="estabelecimentoId" className="form-label">Estabelecimento <span className="text-red-500">*</span></label>
                      <select id="estabelecimentoId" name="estabelecimentoId" className="form-select" value={currentProduct.estabelecimentoId || ""} onChange={handleInputChange} required>
                        <option value="" disabled>-- Selecione --</option>
                        {estabelecimentosLista.map(est => <option key={est.idEstabelecimento} value={est.idEstabelecimento}>{est.nomeEstabelecimento}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tipoProdutoId" className="form-label">Tipo de Produto <span className="text-red-500">*</span></label>
                      <select id="tipoProdutoId" name="tipoProdutoId" className="form-select" value={currentProduct.tipoProdutoId || ""} onChange={handleInputChange} required>
                        <option value="" disabled>-- Selecione --</option>
                        {tiposProdutoLista.map(tipo => <option key={tipo.idTipoProduto} value={tipo.idTipoProduto}>{tipo.nomeTipoProduto}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="estadoProdutoidEstadoProduto" className="form-label">Estado <span className="text-red-500">*</span></label>
                      <select id="estadoProdutoidEstadoProduto" name="estadoProdutoidEstadoProduto" className="form-select" value={currentProduct.estadoProdutoidEstadoProduto || ""} onChange={handleInputChange} required>
                        <option value="" disabled>-- Selecione --</option>
                        {estadosProdutoLista.map(estado => <option key={estado.idEstadoProduto} value={estado.idEstadoProduto}>{estado.nomeEstado}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="imagemProduto" className="form-label">URL da Imagem (Opcional)</label>
                    <input id="imagemProduto" type="text" name="imagemProduto" placeholder="https://exemplo.com/imagem.jpg" className="form-input" value={currentProduct.imagemProduto || ''} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                  <button
                    type="button"
                    className="btn-secondary w-full sm:w-auto" // Use sua classe .btn-secondary
                    onClick={() => setShowFormModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-primary w-full sm:w-auto" // Use sua classe .btn-primary
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        A processar...
                      </span>
                    ) : (isEditing ? 'Salvar Alterações' : 'Adicionar Produto')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && produtos.length === 0 && !message && (
            <div className="py-10 text-center text-gray-500">A carregar dados...</div>
          )}
          {!isLoading && produtos.length === 0 && !message && (
            <div className="py-10 text-center bg-white border rounded-lg shadow-sm">
              <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Comece por adicionar um novo produto.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {produtos.map(produto => {
              const estadoDoProdutoVisivel = produto.estadoProdutoidEstadoProduto === 1;
              const nomeDoEstado = produto.estadoProduto?.estadoProduto || getEstadoProdutoNomeFallback(produto.estadoProdutoidEstadoProduto);
              const cardOpacity = estadoDoProdutoVisivel ? 'opacity-100' : 'opacity-60';

              return (
                <div key={produto.idProduto} className={`bg-white rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl group ${cardOpacity}`}>
                  <div className="relative">
                    {produto.imagemProduto ? (
                      <img src={produto.imagemProduto} alt={produto.nomeProduto} className="w-full h-44 object-cover rounded-t-xl" />
                    ) : (
                      <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-xl">
                        <PhotoIcon className="h-16 w-16" />
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full text-white ${estadoDoProdutoVisivel ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {estadoDoProdutoVisivel ? <EyeIcon className="h-4 w-4 inline mr-1" /> : <EyeSlashIcon className="h-4 w-4 inline mr-1" />}
                      {nomeDoEstado}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors truncate" title={produto.nomeProduto}>{produto.nomeProduto}</h3>
                    <p className="text-sm text-gray-700 mb-2 font-bold">€{Number(produto.precoProduto).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mb-3 h-9 overflow-hidden leading-tight">{produto.descricaoProduto.substring(0, 70)}{produto.descricaoProduto.length > 70 ? '...' : ''}</p>
                    
                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex items-center text-gray-600" title={produto.Estabelecimento?.nomeEstabelecimento || getEstabelecimentoNomeFallback(produto.estabelecimentoId)}>
                        <BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{produto.Estabelecimento?.nomeEstabelecimento || getEstabelecimentoNomeFallback(produto.estabelecimentoId)}</span>
                      </div>
                      <div className="flex items-center text-gray-600" title={produto.tipoProduto?.tipoProduto || getTipoProdutoNomeFallback(produto.tipoProdutoId)}>
                        <TagIcon className="h-4 w-4 mr-1.5 text-purple-500 flex-shrink-0" />
                        <span className="truncate">{produto.tipoProduto?.tipoProduto || getTipoProdutoNomeFallback(produto.tipoProdutoId)}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <button className="btn-edit-small" onClick={() => handleOpenEditForm(produto)}><PencilSquareIcon className="h-4 w-4 mr-1.5"/>Editar</button>
                      <button className="btn-danger-small" onClick={() => handleDeleteProduto(produto.idProduto)}><TrashIcon className="h-4 w-4 mr-1.5"/>Excluir</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};