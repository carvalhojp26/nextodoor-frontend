import React, { useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';

const token = Cookies.get('jwt');
interface Category {
  id: number;
  nome: string;
  pontosNecessarios: number;
}

export const AdminCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState<Partial<Category>>({});

  // Função para buscar categorias
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/taskcreations/category/:categoryId', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  // Função para criar categoria
  const handleCreateCategory = async () => {
    try {
      const categoryData = {
        nome: newCategory.nome,
        pontosNecessarios: newCategory.pontosNecessarios,
      };
      const res = await axios.post('http://localhost:3000/api/categories/create', categoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories([...categories, res.data]);
      setNewCategory({});
      alert('Categoria criada com sucesso!');
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      alert('Erro ao criar categoria. Tente novamente!');
    }
  };

  // Função para editar categoria
  const handleEditCategory = async () => {
    try {
      const categoryData = {
        nome: editCategory.nome,
        pontosNecessarios: editCategory.pontosNecessarios,
      };
      const res = await axios.put(`http://localhost:3000/api/categories/edit/${editCategory.id}`, categoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.map(cat => (cat.id === editCategory.id ? res.data : cat)));
      setEditCategory({});
      setIsEditing(false);
      alert('Categoria atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao editar categoria:', err);
      alert('Erro ao editar categoria. Tente novamente!');
    }
  };

  // Função para remover categoria
  const handleRemoveCategory = async (categoryId: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/categories/delete/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter(cat => cat.id !== categoryId));
      alert('Categoria removida com sucesso!');
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      alert('Erro ao remover categoria. Tente novamente!');
    }
  };

  // Função de mudança para edição
  const handleEditClick = (category: Category) => {
    setIsEditing(true);
    setEditCategory({ id: category.id, nome: category.nome, pontosNecessarios: category.pontosNecessarios });
  };

  // Função de cancelar edição
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCategory({});
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Gestão de Categorias</h2>

          <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
            <h3 className="font-bold mb-4 text-lg">Criar Nova Categoria</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome da Categoria"
                value={newCategory.nome || ''}
                onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })}
                className="border p-2 rounded-md"
                
              />
               <input
                type="number"
                placeholder="Pontos Necessários"
                value={newCategory.pontosNecessarios || 0}
                onChange={(e) => setNewCategory({ ...newCategory, pontosNecessarios: +e.target.value })}
                className="border p-2 rounded-md"
              /> 
              
            </div>
            <button onClick={handleCreateCategory} className="bg-blue-500 text-white p-2 mt-4 rounded-md">
              Criar
            </button>
          </div>

          {/* Tabela de Categorias */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Pontos Necessários</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b">
                    <td className="px-4 py-2">{category.nome}</td>
                    <td className="px-4 py-2">{category.pontosNecessarios}</td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-yellow-500 text-white p-1 mr-2 rounded-md"
                        onClick={() => handleEditClick(category)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-500 text-white p-1 rounded-md"
                        onClick={() => handleRemoveCategory(category.id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edição de Categoria */}
          {isEditing && (
            <div className="mt-8 p-6 bg-white shadow-md rounded-lg">
              <h3 className="font-bold mb-4 text-lg">Editar Categoria</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Categoria"
                  value={editCategory.nome || ''}
                  onChange={(e) => setEditCategory({ ...editCategory, nome: e.target.value })}
                  className="border p-2 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Pontos Necessários"
                  value={editCategory.pontosNecessarios || 0}
                  onChange={(e) => setEditCategory({ ...editCategory, pontosNecessarios: +e.target.value })}
                  className="border p-2 rounded-md"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={handleEditCategory}
                  className="bg-blue-500 text-white p-2 rounded-md"
                >
                  Atualizar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white p-2 rounded-md ml-4"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
