import React, { useState } from 'react'; 
import TaskList from '../features/tasksCreation/taskCreationList';

import { Header } from '../components/mainHeader'; 

const Tasks: React.FC = () => {
  // Se você quiser forçar o TaskList a recarregar quando uma tarefa for criada
  // através do botão no Header desta página.
  const [taskListKey, setTaskListKey] = useState(0);

  const handleTaskCreatedInPage = () => {
    console.log("Task created signal received in Tasks page.");
    setTaskListKey(prevKey => prevKey + 1);
  };

  return (
    // Estrutura de layout principal da página
    <div className="flex flex-col min-h-screen">
      <Header onTaskCreated={handleTaskCreatedInPage} />

      {/* Conteúdo principal da página */}
      {/* flex-grow faz este <main> ocupar o espaço restante entre Header e Footer */}
      {/* bg-[#F5F7FA] aplicado aqui para o fundo do conteúdo */}
      <main className="flex-grow bg-[#F5F7FA]">
        {/* pt-8 (padding-top) para não colar no header, px-4 para padding horizontal */}
        <div className="container mx-auto px-4 pt-8 pb-8"> {/* Adicionado pb-8 para espaço antes do footer */}
          <h1 className="text-2xl text-[#3568ff] font-bold mb-6">Neighborhood Tasks</h1>
          <TaskList key={taskListKey} /> {/* Adicionada a key */}
        </div>
      </main>
    </div>
  );
};

export default Tasks;