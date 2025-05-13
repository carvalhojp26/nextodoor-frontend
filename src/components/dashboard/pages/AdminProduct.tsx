// AdminProduct.tsx (Versão final completa com todas as correções discutidas)
import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Sidebar } from '../Sidebar'; // Ajuste o caminho se necessário
import { DashboardHeader } from '../DashboardHeader'; // Ajuste o caminho se necessário
import Cookies from 'js-cookie';
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, PhotoIcon, TagIcon, BuildingStorefrontIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const token = Cookies.get('jwt');

// --- Interfaces ---

interface EstabelecimentoInfo {
  idEstabelecimento?: number;
  nomeEstabelecimento: string;
}

interface TipoProdutoInfo {
  idTipoProduto?: number;
  tipoProduto: string;
}

interface EstadoProdutoInfo {
  idEstadoProduto?: number;
  estadoProduto: string;
}

// Produto como vem da API (com FKs e objetos aninhados)
interface ProdutoAPI {
  idProduto: number;
  nomeProduto: string;
  precoProduto: number;
  descricaoProduto: string;
  imagemProduto?: string;
  stockProduto: number;
  // FKs com nomes da BD/Backend
  tipoProdutoidTipoProduto: number;
  estadoProdutoidEstadoProduto: number;
  EstabelecimentoidEstabelecimento: number;

  // Objetos aninhados (para exibição nos cards)
  Estabelecimento?: EstabelecimentoInfo;
  tipoProduto?: TipoProdutoInfo;
  estadoProduto?: EstadoProdutoInfo;
}

// Estado do formulário (com nomes dos inputs)
interface ProductFormState {
  nomeProduto?: string;
  precoProduto?: number;
  descricaoProduto?: string;
  imagemProduto?: string; // URL
  stockProduto?: number;
  // Nomes usados nos inputs do formulário
  tipoProdutoId?: number; 
  estadoProdutoidEstadoProduto?: number; // Se o input for nomeado assim
  estabelecimentoId?: number;
}

// Listas para dropdowns
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

export const AdminProduct = () => {
  const [produtos, setProdutos] = useState<ProdutoAPI[]>([]);
  const [tiposProdutoLista, setTiposProdutoLista] = useState<TipoProdutoLista[]>([]);
  const [estadosProdutoLista, setEstadosProdutoLista] = useState<EstadoProdutoLista[]>([]);
  const [estabelecimentosLista, setEstabelecimentosLista] = useState<EstabelecimentoLista[]>([]);

  const [currentProduct, setCurrentProduct] = useState<ProductFormState>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApiError = useCallback((err: any, defaultMessage: string) => {
    console.error(defaultMessage, err);
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<any>;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data;
        const details = errorData.details ? ` Detalhes: ${Array.isArray(errorData.details) ? errorData.details.map((d:any) => d.message || d).join(', ') : JSON.stringify(errorData.details)}` : '';
        errorMessage = `${errorData.error || defaultMessage}${details}`;
      } else if (axiosError.request) {
        errorMessage = "Erro de rede ou servidor não respondeu.";
      }
    }
    setMessage({ type: 'error', text: errorMessage });
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const productsPromise = axios.get(`http://localhost:3000/api/products/all`, config);
      const typesPromise = axios.get(`http://localhost:3000/api/product-types/`, config);
      const statesPromise = axios.get(`http://localhost:3000/api/product-status/`, config);
      const establishmentsPromise = axios.get(`http://localhost:3000/api/establishments/all`, config);

      const [productsRes, typesRes, statesRes, establishmentsRes] = await Promise.all([
        productsPromise, typesPromise, statesPromise, establishmentsPromise,
      ]);

      setProdutos(productsRes.data.products || []);
      setTiposProdutoLista(typesRes.data.productTypes || []); 
      setEstadosProdutoLista(statesRes.data.productStatus || []);
      setEstabelecimentosLista(establishmentsRes.data.establishments || []);

    } catch (err) {
      handleApiError(err, 'Erro fatal ao carregar dados das listas.');
      setProdutos([]); setTiposProdutoLista([]); setEstadosProdutoLista([]); setEstabelecimentosLista([]);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumericOrIdField = [
        'precoProduto', 'stockProduto', 
        'tipoProdutoId', 'estadoProdutoidEstadoProduto', 'estabelecimentoId' // Nomes dos inputs do form
    ].includes(name);

    setCurrentProduct(prev => ({
      ...prev,
      [name]: (type === 'number' || (isNumericOrIdField && value !== '')) ? Number(value) : value
    }));
  };

  const handleOpenAddForm = () => {
    setIsEditing(false); setEditingProductId(null); setCurrentProduct({});
    setShowFormModal(true); setMessage(null);
  };

  const handleOpenEditForm = (produto: ProdutoAPI) => {
    setIsEditing(true); setEditingProductId(produto.idProduto);
    setCurrentProduct({ // Popula ProductFormState
      nomeProduto: produto.nomeProduto,
      precoProduto: produto.precoProduto,
      descricaoProduto: produto.descricaoProduto,
      stockProduto: produto.stockProduto,
      // Mapear da API para os nomes do formulário
      tipoProdutoId: produto.tipoProdutoidTipoProduto,
      estadoProdutoidEstadoProduto: produto.estadoProdutoidEstadoProduto,
      estabelecimentoId: produto.EstabelecimentoidEstabelecimento,
      imagemProduto: produto.imagemProduto || '',
    });
    setShowFormModal(true); setMessage(null);
  };

  const handleFormSubmit = async () => {
    // Desestrutura usando os nomes de ProductFormState
    const { nomeProduto, precoProduto, descricaoProduto, stockProduto, tipoProdutoId, estadoProdutoidEstadoProduto, estabelecimentoId, imagemProduto } = currentProduct;
    
    if (!nomeProduto || nomeProduto.trim() === '' ||
        precoProduto === undefined || precoProduto < 0 ||
        !descricaoProduto || descricaoProduto.trim() === '' ||
        stockProduto === undefined || stockProduto < 0 || !Number.isInteger(stockProduto) ||
        !tipoProdutoId || !estadoProdutoidEstadoProduto || !estabelecimentoId) {
      setMessage({ type: 'error', text: 'Todos os campos marcados com * e Stock (inteiro >= 0) são obrigatórios.' });
      return;
    }
    if (imagemProduto && imagemProduto.trim() !== '' && !(imagemProduto.startsWith('http://') || imagemProduto.startsWith('https://'))) {
        setMessage({ type: 'error', text: 'O URL da imagem parece inválido. Deve começar com http:// ou https://.' });
        return;
    }

    setIsSubmitting(true); setMessage(null);

    // Mapear para os nomes que o backend espera no payload
    const payload = {
      nomeProduto: nomeProduto.trim(),
      precoProduto,
      descricaoProduto: descricaoProduto.trim(),
      stockProduto,
      tipoProdutoidTipoProduto: tipoProdutoId, 
      estadoProdutoidEstadoProduto: estadoProdutoidEstadoProduto,
      EstabelecimentoidEstabelecimento: estabelecimentoId,
      imagemProduto: imagemProduto && imagemProduto.trim() !== '' ? imagemProduto.trim() : null,
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      if (isEditing && editingProductId) {
        await axios.patch(`http://localhost:3000/api/products/${editingProductId}`, payload, config);
        setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
      } else {
        await axios.post(`http://localhost:3000/api/products`, payload, config);
        setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' });
      }
      setShowFormModal(false); setCurrentProduct({});
      setIsEditing(false); setEditingProductId(null);
      fetchData();
    } catch (err) {
      handleApiError(err, `Erro ao ${isEditing ? 'atualizar' : 'adicionar'} produto.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduto = async (idProduto: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`http://localhost:3000/api/products/${idProduto}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ type: 'success', text: 'Produto excluído com sucesso.' });
      setProdutos(prevProdutos => prevProdutos.filter(p => p.idProduto !== idProduto));
    } catch (err) {
      handleApiError(err, 'Erro ao excluir produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallbacks usam os IDs como vêm da ProdutoAPI (para os cards)
  const getEstabelecimentoNomeFallback = (idApi: number | undefined): string => {
    if (idApi === undefined || estabelecimentosLista.length === 0) return 'N/A';
    return estabelecimentosLista.find(e => e.idEstabelecimento === idApi)?.nomeEstabelecimento || 'Desconhecido';
  };
  const getTipoProdutoNomeFallback = (idApi: number | undefined): string => {
    if (idApi === undefined || tiposProdutoLista.length === 0) return 'N/A';
    return tiposProdutoLista.find(t => t.idTipoProduto === idApi)?.nomeTipoProduto || 'Desconhecido';
  };
  const getEstadoProdutoNomeFallback = (idApi: number | undefined): string => {
    if (idApi === undefined || estadosProdutoLista.length === 0) return 'N/A';
    return estadosProdutoLista.find(e => e.idEstadoProduto === idApi)?.nomeEstado || 'Desconhecido';
  };

  if (isLoading && !produtos.length && !tiposProdutoLista.length && !estadosProdutoLista.length && !estabelecimentosLista.length) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-gray-500">A carregar dados iniciais...</p>
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
            <button className="btn-primary px-5 py-2.5 text-sm" onClick={handleOpenAddForm}>
              <span className="mr-2">+</span>Adicionar Produto
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-center text-sm shadow-sm ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              {message.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 inline mr-2 align-text-bottom" />}
              {message.text}
            </div>
          )}

          {showFormModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fadeIn">
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 mb-6 border-b">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
                    </h3>
                    <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label htmlFor="nomeProduto" className="form-label">Nome <span className="text-red-500">*</span></label>
                      <input id="nomeProduto" type="text" name="nomeProduto" className="form-input" value={currentProduct.nomeProduto || ''} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <label htmlFor="precoProduto" className="form-label">Preço (€) <span className="text-red-500">*</span></label>
                      <input id="precoProduto" type="number" name="precoProduto" step="0.01" min="0" className="form-input" value={currentProduct.precoProduto === undefined ? '' : currentProduct.precoProduto} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="stockProduto" className="form-label">Stock <span className="text-red-500">*</span></label>
                    <input id="stockProduto" type="number" name="stockProduto" min="0" step="1" className="form-input" value={currentProduct.stockProduto === undefined ? '' : currentProduct.stockProduto} onChange={handleInputChange} required />
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
                      <label htmlFor="tipoProdutoId" className="form-label">Tipo <span className="text-red-500">*</span></label>
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
                    <label htmlFor="imagemProduto" className="form-label">URL da Imagem do Produto (Opcional)</label>
                    <input id="imagemProduto" type="url" name="imagemProduto" placeholder="https://exemplo.com/imagem.jpg" className="form-input" value={currentProduct.imagemProduto || ''} onChange={handleInputChange} />
                    {currentProduct.imagemProduto && (currentProduct.imagemProduto.startsWith('http://') || currentProduct.imagemProduto.startsWith('https://')) && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-600">Preview:</p>
                            <img src={currentProduct.imagemProduto} alt="Preview" className="h-20 w-auto rounded border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    )}
                  </div>
                  <div className="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 space-y-reverse">
                    <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          A processar...
                        </span>) 
                        : (isEditing ? 'Salvar Alterações' : 'Adicionar Produto')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading && produtos.length > 0 && <div className="py-4 text-center text-gray-500">A atualizar lista de produtos...</div>}
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
              const imageUrl = produto.imagemProduto; // Assumindo que é um URL completo

              return (
                <div key={produto.idProduto} className={`bg-white rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl group ${cardOpacity}`}>
                  <div className="relative h-44 bg-gray-100 rounded-t-xl">
                    {imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? (
                      <img src={imageUrl} alt={produto.nomeProduto} className="w-full h-full object-cover rounded-t-xl" 
                           onError={(e) => { 
                               const imgTarget = e.target as HTMLImageElement;
                               imgTarget.style.display = 'none';
                               const fallbackIconContainer = imgTarget.nextElementSibling as HTMLElement;
                               if (fallbackIconContainer) {
                                   fallbackIconContainer.classList.remove('hidden');
                               }
                           }}/>
                    ) : null }
                    <div className={`w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-xl ${imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? 'hidden' : ''}`}>
                        <PhotoIcon className="h-16 w-16" />
                    </div>
                     <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full text-white ${estadoDoProdutoVisivel ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {estadoDoProdutoVisivel ? <EyeIcon className="h-4 w-4 inline mr-1" /> : <EyeSlashIcon className="h-4 w-4 inline mr-1" />}
                      {nomeDoEstado}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors truncate" title={produto.nomeProduto}>{produto.nomeProduto}</h3>
                    <p className="text-sm text-gray-700 mb-1 font-bold">€{Number(produto.precoProduto).toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mb-2">Stock: {produto.stockProduto}</p>
                    <p className="text-xs text-gray-500 mb-3 h-10 overflow-hidden leading-tight line-clamp-2">{produto.descricaoProduto}</p>
                    
                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex items-center text-gray-600" title={produto.Estabelecimento?.nomeEstabelecimento || getEstabelecimentoNomeFallback(produto.EstabelecimentoidEstabelecimento)}>
                        <BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{produto.Estabelecimento?.nomeEstabelecimento || getEstabelecimentoNomeFallback(produto.EstabelecimentoidEstabelecimento)}</span>
                      </div>
                      <div className="flex items-center text-gray-600" title={produto.tipoProduto?.tipoProduto || getTipoProdutoNomeFallback(produto.tipoProdutoidTipoProduto)}>
                        <TagIcon className="h-4 w-4 mr-1.5 text-purple-500 flex-shrink-0" />
                        <span className="truncate">{produto.tipoProduto?.tipoProduto || getTipoProdutoNomeFallback(produto.tipoProdutoidTipoProduto)}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <button className="btn-edit-small" onClick={() => handleOpenEditForm(produto)}><PencilSquareIcon className="h-4 w-4 mr-1.5"/>Editar</button>
                      <button className="btn-danger-small" onClick={() => handleDeleteProduto(produto.idProduto)} disabled={isSubmitting}><TrashIcon className="h-4 w-4 mr-1.5"/>Excluir</button>
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