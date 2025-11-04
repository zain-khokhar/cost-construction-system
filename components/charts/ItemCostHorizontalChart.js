'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ItemCostHorizontalChart({ data }) {
  const chartData = useMemo(() => ({
    labels: data.map((item) => item.itemName || item.name),
    datasets: [
      {
        label: 'Total Cost',
        data: data.map((item) => item.totalCost || item.cost),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Completely disable animations
    transitions: {
      active: {
        animation: {
          duration: 0
        }
      }
    },
    hover: {
      animationDuration: 0
    },
    responsiveAnimationDuration: 0,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return 'Cost: $' + context.parsed.x.toLocaleString();
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          },
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        ticks: {
          font: { size: 11, weight: 'bold' },
        },
        grid: {
          display: false,
        },
      },
    },
  }), []);

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
