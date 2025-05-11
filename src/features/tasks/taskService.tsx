import { Tarefa } from './types';
import Cookies from 'js-cookie';

export async function fetchTasks(): Promise<Tarefa[]> {
  const token = Cookies.get('jwt');

  const response = await fetch('http://localhost:3000/api/taskCreations/neighborhood', {
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