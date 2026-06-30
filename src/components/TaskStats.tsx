import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { ChartData } from 'chart.js';
import { useQuery } from '@tanstack/react-query';
import type { Task } from '@/store/taskStore';

ChartJS.register(ArcElement, Tooltip, Legend);

// API Fetcher shared with Tasks.tsx
const fetchLocalTasks = async (): Promise<Task[]> => {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const TaskStats = () => {
  // We use the same queryKey ['tasks'] to share the cached data
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchLocalTasks,
  });

  const completed = tasks.filter(t => t.status === 'Done').length;
  const pending = tasks.length - completed;

  const data: ChartData<'pie'> = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        label: 'Tasks',
        data: [completed, pending],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(244, 63, 94, 0.8)',
        ],
        borderColor: [
          'transparent',
          'transparent',
        ],
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { weight: 'bold' as const, size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center opacity-60 italic">
        <p>Awaiting task data for analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 relative mb-6">
        <Pie data={data} options={options} />
      </div>
      <div className="flex justify-around items-center pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center group">
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{completed}</div>
          <div className="text-[10px] font-bold uppercase tracking-tight opacity-50">Done</div>
        </div>
        <div className="text-center group">
          <div className="text-xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">{tasks.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-tight opacity-50">Total</div>
        </div>
        <div className="text-center group">
          <div className="text-xl font-black text-red-500 group-hover:scale-110 transition-transform">{pending}</div>
          <div className="text-[10px] font-bold uppercase tracking-tight opacity-50">Pending</div>
        </div>
      </div>
    </div>
  );
};
