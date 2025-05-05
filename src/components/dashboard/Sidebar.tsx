import React from "react";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md h-screen px-6 py-8">
      <h2 className="text-xl font-bold text-green-600 mb-6">Painel Admin</h2>

      <nav className="flex flex-col space-y-4">
        <a href="#" className="text-gray-700 hover:text-green-600">Utilizadores</a>
        <a href="#" className="text-gray-700 hover:text-green-600">Tarefas</a>
        <a href="#" className="text-gray-700 hover:text-green-600">Recompensas</a>
        <a href="#" className="text-gray-700 hover:text-green-600">Definições</a>
      </nav>
    </aside>
  );
};
