import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, LabelList } from "recharts";
import Cookies from 'js-cookie';


interface VizinhançaData {
  nome: string;
  total: number;
}

const COLORS = ["#10B981", "#3B82F6", "#F97316", "#EF4444", "#8B5CF6", "#EC4899", "#22D3EE", "#FBBF24", "#4B5563"];

export const GraphNeighborhood = () => {
  const [data, setData] = useState<VizinhançaData[]>([]);
  const token = Cookies.get('jwt');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/establishments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const establishments = res.data;
        if (!establishments) return;

        const neighborhoodCount: Record<string, number> = {};
        establishments.forEach((establishment: any) => {
          establishment.vizinhanças.forEach((neighborhood: string) => {
            neighborhoodCount[neighborhood] = (neighborhoodCount[neighborhood] || 0) + 1;
          });
        });

        const formattedData = Object.keys(neighborhoodCount).map((neighborhood) => ({
          nome: neighborhood,
          total: neighborhoodCount[neighborhood],
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Erro ao buscar dados de vizinhanças:", err);
      }
    };

    fetchData();
  }, [token]);

  
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-700">Distribuição por Vizinhança</h3>

      <div className="flex-1 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="nome" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="total" fill="#3B82F6">
          <LabelList dataKey="total" position="top" style={{ fontSize: 12, fill: "#333" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
      </div>
    </div>
  );
};
