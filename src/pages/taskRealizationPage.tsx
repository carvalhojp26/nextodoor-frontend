// src/pages/taskRealizationPage.tsx
import React, { useState } from 'react';
import TaskRealizationList from '../features/taskRealization/taskRealizationList';
import { Header } from '../components/mainHeader';

const TaskRealizationPage: React.FC = () => {
  const [listKey, setListKey] = useState(0);

  const handleTaskRealized = () => {
    console.log("Signal de realização de tarefa recebido.");
    setListKey(prevKey => prevKey + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onTaskCreated={handleTaskRealized} />

      <main className="flex-grow bg-[#F5F7FA]">
        <div className="container mx-auto px-4 pt-8 pb-8">
          <h1 className="text-2xl text-[#3568ff] font-bold mb-6">Tasks in execution</h1>
          <TaskRealizationList key={listKey} />
        </div>
      </main>
    </div>
  );
};

export default TaskRealizationPage;
