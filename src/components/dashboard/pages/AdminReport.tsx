import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';

const token = Cookies.get('jwt');
interface Report {
  idDenuncia: number;
  comentario: string;
  dataDenuncia: string;
  UtilizadoridUtilziador: number;
  status: 'pendente' | 'resolvido';
}

export const AdminReport = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pendente' | 'resolvido' | 'todos'>('todos');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        console.error('Erro ao buscar denúncias:', err);
      }
    };

    fetchReports();
  }, []);

  // Filtra as denúncias conforme o filtro selecionado
  const filteredReports = reports.filter(report => {
    if (statusFilter === 'todos') return true;
    return report.status === statusFilter;
  });

  // Marcar denúncia como resolvida
  const handleMarkResolved = async (reportId: number) => {
    try {
      await axios.put(`http://localhost:3000/api/reports/resolve/${reportId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.map(report => 
        report.idDenuncia === reportId ? { ...report, status: 'resolvido' } : report
      ));
    } catch (err) {
      console.error('Erro ao resolver denúncia:', err);
    }
  };

  // Excluir denúncia
  const handleDeleteReport = async (reportId: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/reports/delete/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.filter(report => report.idDenuncia !== reportId));
    } catch (err) {
      console.error('Erro ao excluir denúncia:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Gestão de Denúncias</h2>

          <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
            <h3 className="font-bold mb-4 text-lg">Filtros</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`p-2 rounded-md ${statusFilter === 'todos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('pendente')}
                className={`p-2 rounded-md ${statusFilter === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setStatusFilter('resolvido')}
                className={`p-2 rounded-md ${statusFilter === 'resolvido' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                Resolvidas
              </button>
            </div>
          </div>

          {/* Lista de Denúncias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.idDenuncia}
                className={`p-4 bg-white shadow-md rounded-lg border-l-4 ${
                  report.status === 'pendente' ? 'border-yellow-500' : 'border-green-500'
                }`}
              >
                <h4 className="font-bold text-lg">{`Denúncia #${report.idDenuncia}`}</h4>
                <p className="mt-2">{report.comentario}</p>
                <p className="text-sm text-gray-500 mt-2">{`Data: ${report.dataDenuncia}`}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleMarkResolved(report.idDenuncia)}
                    className="bg-green-500 text-white p-2 rounded-md"
                  >
                    Marcar como Resolvida
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.idDenuncia)}
                    className="bg-red-500 text-white p-2 rounded-md"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detalhes da Denúncia */}
          {selectedReport && (
            <div className="mt-8 p-6 bg-white shadow-md rounded-lg">
              <h3 className="font-bold mb-4 text-lg">Detalhes da Denúncia</h3>
              <p><strong>ID:</strong> {selectedReport.idDenuncia}</p>
              <p><strong>Comentário:</strong> {selectedReport.comentario}</p>
              <p><strong>Data da Denúncia:</strong> {selectedReport.dataDenuncia}</p>
              <p><strong>Utilizador ID:</strong> {selectedReport.UtilizadoridUtilziador}</p>
              <div className="mt-4">
                <button
                  onClick={() => handleMarkResolved(selectedReport.idDenuncia)}
                  className="bg-green-500 text-white p-2 rounded-md"
                >
                  Marcar como Resolvida
                </button>
                <button
                  onClick={() => handleDeleteReport(selectedReport.idDenuncia)}
                  className="bg-red-500 text-white p-2 rounded-md ml-4"
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
