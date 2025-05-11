import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('jwt');

interface Produto {
  idProduto: number;
  nomeProduto: string;
  precoProduto: number;
  descricaoProduto: string;
  visivel: boolean; 
  stock: number;  
}

interface Usuario {
  idUsuario: number;
  nome: string;
  pontos: number;
}

export const ProductPurchase = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:3000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuario(userRes.data);

        const productRes = await axios.get('http://localhost:3000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProdutos(productRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    fetchData();
  }, []);

  const handleComprarProduto = async () => {
    if (!usuario || !selectedProduto) return;

    if (usuario.pontos < selectedProduto.precoProduto) {
      setMessage('Você não tem pontos suficientes para comprar este produto.');
      return;
    }

    if (!selectedProduto.visivel) {
      setMessage('Este produto não está disponível para compra no momento.');
      return;
    }

    if (selectedProduto.stock <= 0) {
      setMessage('Este produto está fora de stock.');
      return;
    }

    try {

      await axios.patch('http://localhost:3000/api/users/edit', 
        { pontos: usuario.pontos - selectedProduto.precoProduto },
        { headers: { Authorization: `Bearer ${token}` } }
      );

 
      await axios.patch(`http://localhost:3000/api/products/${selectedProduto.idProduto}`, 
        { stock: selectedProduto.stock - 1 }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Compra realizada com sucesso!');
      setSelectedProduto(null); 
    } catch (error) {
      console.error('Erro ao realizar a compra:', error);
      setMessage('Erro ao realizar a compra.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Comprar Produto com Pontos</h2>

      {usuario && (
        <div className="mb-4">
          <p><strong>Usuário:</strong> {usuario.nome}</p>
          <p><strong>Pontos disponíveis:</strong> {usuario.pontos}</p>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Escolha um Produto:</h3>
      <div className="grid grid-cols-3 gap-4">
        {produtos.map(produto => (
          produto.visivel && produto.stock > 0 && (
            <div 
              key={produto.idProduto} 
              className="bg-white p-4 shadow rounded-lg cursor-pointer"
              onClick={() => setSelectedProduto(produto)}
            >
              <h4 className="text-lg font-semibold">{produto.nomeProduto}</h4>
              <p>{produto.descricaoProduto}</p>
              <p className="text-gray-500">Preço: {produto.precoProduto} pontos</p>
            </div>
          )
        ))}
      </div>

      {selectedProduto && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Você selecionou:</h3>
          <div className="bg-white p-4 shadow rounded-lg">
            <h4 className="text-lg font-semibold">{selectedProduto.nomeProduto}</h4>
            <p>{selectedProduto.descricaoProduto}</p>
            <p className="text-gray-500">Preço: {selectedProduto.precoProduto} pontos</p>
            <p className="text-gray-500">stock: {selectedProduto.stock}</p>
          </div>

          <button 
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
            onClick={handleComprarProduto}
          >
            Comprar
          </button>
        </div>
      )}

      {message && (
        <div className="mt-4 p-4 bg-gray-200 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};
