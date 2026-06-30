import type { Task } from '@/store/taskStore';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onToggle, onDelete }: TaskCardProps) => {
  const isDone = task.status === 'Done';

  return (
    <div className={`p-5 glass-card flex flex-col justify-between h-full group hover:ring-2 hover:ring-indigo-500/50 transition-all ${isDone ? 'opacity-60' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full tracking-widest ${
            task.priority === 'High' ? 'bg-red-100 text-red-600' : 
            task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 
            'bg-green-100 text-green-600'
          }`}>
            {task.priority}
          </span>
          <span className={`text-[10px] font-bold ${isDone ? 'text-green-600' : 'text-slate-400'}`}>
            {task.status}
          </span>
        </div>
        
        <h3 className={`text-lg font-bold mb-2 transition-all ${isDone ? 'line-through text-slate-500 italic' : ''}`}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <Link 
          to={`/tasks/${task.id}`} 
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
        >
          View Details ↗
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => onToggle(task.id)}
            className={`p-2 rounded-lg transition-colors ${
              isDone ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isDone ? "Mark as To Do" : "Mark as Done"}
          >
            {isDone ? '↻' : '✓'}
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
            title="Delete Task"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};
