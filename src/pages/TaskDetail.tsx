import { useParams, Link } from "react-router-dom";
import { useTaskStore, type Task } from "@/store/taskStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API Fetcher for single task (shared query logic)
const fetchLocalTasks = async (): Promise<Task[]> => {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

function TaskDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { toggleTaskStatus } = useTaskStore();
  
  // 1. Get tasks from React Query
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchLocalTasks,
  });

  const task = tasks.find(t => t.id === id);

  // 2. Mutation for status toggle
  const mutation = useMutation({
    mutationFn: toggleTaskStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse text-2xl font-black">Loading Task Details...</div>;

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
        <div className="glass-card p-12 max-w-md w-full">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-black mb-4">Task Not Found</h1>
          <p className="text-slate-500 mb-8 font-medium">The task you are looking for doesn't exist or has been deleted.</p>
          <Link to="/tasks">
            <button className="button-primary w-full">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const isDone = task.status === 'Done';

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      <div className="glass-card p-8 md:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <Link to="/tasks" className="text-indigo-600 font-black flex items-center gap-2 hover:-translate-x-1 transition-transform">
            ← BACK TO LIST
          </Link>
          <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-full tracking-tighter ${
            isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
          }`}>
            Current Status: {task.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <h1 className="text-4xl font-black">{task.title}</h1>
          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-md tracking-widest ${
            task.priority === 'High' ? 'bg-red-500 text-white' : 
            task.priority === 'Medium' ? 'bg-amber-400 text-white' : 
            'bg-green-500 text-white'
          }`}>
            {task.priority} Priority
          </span>
        </div>

        {task.description && (
          <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-700/30">
            <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Task Description</h4>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {task.description}
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-12 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-black uppercase tracking-widest">System Reference:</span>
          <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {task.id}
          </code>
        </div>

        <div className="p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200/30 border-dashed">
          <h3 className="text-xl font-bold mb-2">Manage Status</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Has this task been completed yet?</p>
          <button 
            onClick={() => mutation.mutate(task.id)}
            disabled={mutation.isPending}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
              isDone 
              ? 'bg-slate-300 text-slate-700 hover:bg-slate-400 shadow-slate-200/50' 
              : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/30 active:scale-95'
            } ${mutation.isPending ? 'opacity-50' : ''}`}
          >
            {mutation.isPending ? 'Syncing...' : isDone ? 'Mark as Not Completed' : '✨ Mark as Completed'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
