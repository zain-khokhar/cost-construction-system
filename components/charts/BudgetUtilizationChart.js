'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetUtilizationChart({ data }) {
  const { chartData, totalBudget, totalSpent } = useMemo(() => {
    // Calculate overall budget utilization
    const totalBudget = data.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = data.reduce((sum, p) => sum + (p.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;

    const chartData = {
      labels: ['Spent', 'Remaining', 'Over Budget'],
      datasets: [
        {
          data: [
            totalSpent <= totalBudget ? totalSpent : totalBudget,
            totalRemaining > 0 ? totalRemaining : 0,
            totalSpent > totalBudget ? totalSpent - totalBudget : 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: ['rgb(34, 197, 94)', 'rgb(59, 130, 246)', 'rgb(239, 68, 68)'],
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };

    return { chartData, totalBudget, totalSpent };
  }, [data]);

  const options = useMemo(() => ({
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
        position: 'right',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / totalBudget) * 100).toFixed(1);
            return label + ': $' + value.toLocaleString() + ' (' + percentage + '%)';
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  }), [totalBudget]);

  return (
    <div className="h-80 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Doughnut data={chartData} options={options} />
        <div className="text-center mt-4">
          <p className="text-2xl font-bold text-gray-800">
            {((totalSpent / totalBudget) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Overall Utilization</p>
        </div>
      </div>
    </div>
  );
}
