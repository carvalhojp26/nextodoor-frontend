import React from 'react';
import TaskList from '../features/tasks/taskList';

const Tasks: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Neighborhood Tasks</h1>
      <TaskList />
    </div>
  );
};

export default Tasks;