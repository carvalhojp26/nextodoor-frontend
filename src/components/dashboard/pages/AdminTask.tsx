import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';

const token = Cookies.get('jwt');
// Tipos
interface TaskCreation {
  idTaskCreation: number;
  title: string;
  description: string;
  neighborhoodId: number;
  categoryId: number;
}

interface Neighborhood {
  idVizinhanca: number;
  nomeVizinhanca: string;
}

interface Category {
  idCategoria: number;
  nomeCategoria: string;
}

export const AdminTask = () => {
  const [tasks, setTasks] = useState<TaskCreation[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedTask, setSelectedTask] = useState<TaskCreation | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/taskCreations/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Erro ao buscar tarefas:', err);
      }
    };

    const fetchNeighborhoods = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/neighborhoods', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNeighborhoods(res.data);
      } catch (err) {
        console.error('Erro ao buscar vizinhanças:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };

    fetchTasks();
    fetchNeighborhoods();
    fetchCategories();
  }, []);

  const handleDelete = async (taskId: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/taskCreations/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task.idTaskCreation !== taskId));
    } catch (err) {
      console.error('Erro ao eliminar tarefa:', err);
    }
  };

  const handleViewMore = (task: TaskCreation) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNeighborhood = selectedNeighborhood ? task.neighborhoodId === selectedNeighborhood : true;
    const matchesCategory = selectedCategory ? task.categoryId === selectedCategory : true;
    return matchesSearch && matchesNeighborhood && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-4">Tarefas por Vizinhança</h2>

          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Procurar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded w-1/3"
            />
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(Number(e.target.value))}
              className="border p-2 rounded"
            >
              <option value="">Todas as Vizinhanças</option>
              {neighborhoods.map((n) => (
                <option key={n.idVizinhanca} value={n.idVizinhanca}>{n.nomeVizinhanca}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              className="border p-2 rounded"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.idCategoria} value={c.idCategoria}>{c.nomeCategoria}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <div key={task.idTaskCreation} className="bg-white p-4 shadow rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                <p>{task.description}</p>
                <div className="mt-2 flex gap-2">
                  <button className="bg-blue-500 text-white p-2 rounded" onClick={() => handleViewMore(task)}>Ver Mais</button>
                  <button className="bg-red-500 text-white p-2 rounded" onClick={() => handleDelete(task.idTaskCreation)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          {selectedTask && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-xl font-bold mb-4">{selectedTask.title}</h3>
                <p>{selectedTask.description}</p>
                <button className="bg-gray-500 text-white p-2 rounded mt-4 w-full" onClick={handleCloseModal}>Fechar</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
