import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SupplierData {
  nome: string;
  total: number;
}

interface GraphSuppliersProps {
  data: SupplierData[];
}

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F97316",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#22D3EE",
  "#FBBF24",
  "#4B5563",
  "#3B82F6",
  "#10B981",
  "#F43F5E",
  "#818CF8",
];

export const GraphSuppliers: React.FC<GraphSuppliersProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full sm:w-1/2 lg:w-1/3 h-80">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-700">Distribuição por Fornecedor</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="nome"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ backgroundColor: "rgba(0, 0, 0, 0.75)", padding: "10px", borderRadius: "5px" }}
            labelStyle={{ color: "#fff", fontSize: "14px" }}
            contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
