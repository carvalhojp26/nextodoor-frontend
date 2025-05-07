import React from 'react';
import { Tarefa } from './types';

const getCategoryColor = (categoria: string) => {
  switch (categoria) {
    case 'Reparações':
      return 'bg-yellow-500 text-black';
    case 'Limpeza':
      return 'bg-blue-500';
    case 'Jardinagem':
      return 'bg-green-600';
    case 'Animais':
      return 'bg-red-600';
    default:
      return 'bg-gray-500';
  }
};

const TaskCard: React.FC<{ task: Tarefa }> = ({ task: tarefa }) => {
  const categoria = tarefa.categoriaTarefa.categoriaTarefa;
  const categoriaColor = getCategoryColor(categoria);

  return (
    <div className="bg-[#F9FAFB] p-4 rounded-xl shadow-md border w-72 relative flex flex-col justify-between h-80">
      {/* Top Section: Task Name & Category */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-md font-semibold text-gray-800">{tarefa.nomeTarefa}</h2>
        <span className={`text-white text-xs px-3 py-1 rounded-full ${categoriaColor}`}>
          {categoria}
        </span>
      </div>

      {/* Points */}
      <span className="text-xs text-gray-600 mb-1">
        {tarefa.categoriaTarefa.pontosCategoria} Pontos
      </span>

      {/* Description */}
      <div className="bg-white border rounded-md p-2 text-sm text-gray-700 flex-1 mb-4 overflow-auto">
        {tarefa.descricaoTarefa}
      </div>

      {/* Action Button */}
      <button className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold w-full">
        Ver detalhes
      </button>
    </div>
  );
};

export default TaskCard;
