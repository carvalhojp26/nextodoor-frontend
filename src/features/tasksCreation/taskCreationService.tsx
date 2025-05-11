  import { criacaoTarefa } from './taskCreationTypes';
  import Cookies from 'js-cookie';

  export async function fetchTasks(): Promise<criacaoTarefa[]> {
    const token = Cookies.get('jwt');

    const response = await fetch('http://localhost:3000/api/taskCreations/neighborhood/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    return data.task;
  }

  export async function updateTaskStatus(idTarefaCriada: number, novoEstado: string): Promise<criacaoTarefa> {
    const token = Cookies.get('jwt');
  
    const response = await fetch(`http://localhost:3000/api/taskRealization/edit/${idTarefaCriada}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ estado: novoEstado }),
    });
  
    if (!response.ok) {
      throw new Error('Erro ao atualizar o estado da tarefa');
    }
  
    const data = await response.json();
    return data.task as criacaoTarefa;
  }