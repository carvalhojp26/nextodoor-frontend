import React from 'react';
import TaskList from '../features/tasksCreation/taskCreationList';

const Tasks: React.FC = () => {
  return (
    <div className='bg-[#F5F7FA] absolute inset-0'>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-[#4CAF4F] font-bold mb-4">Neighborhood Tasks</h1>
      <TaskList />
    </div>
    </div>
    
  );
};

export default Tasks;