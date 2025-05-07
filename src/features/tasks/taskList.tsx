import React, { useEffect, useState } from 'react';
import { fetchTasks } from './taskService';
import { Tarefa } from './types';
import TaskCard from './taskCard';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks');
        console.error(err);
      }
    };

    loadTasks();
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {tasks.map((task, index) => (
        <TaskCard key={index} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
