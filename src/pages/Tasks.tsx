import { useTaskStore, type Task } from '@/store/taskStore';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskStats } from '@/components/TaskStats';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API Fetcher for internal tasks
const fetchLocalTasks = async (): Promise<Task[]> => {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

const Tasks = () => {
  const queryClient = useQueryClient();
  const { toggleTaskStatus, deleteTask } = useTaskStore();

  // 1. Fetch Local Tasks (Step 4 implementation)
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchLocalTasks,
  });

  // 2. Mutations for actions
  const toggleMutation = useMutation({
    mutationFn: toggleTaskStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <header className="mb-12">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          📊 Dashboard
        </h1>
        <p className="text-slate-500 font-medium">Manage your personal goals and productivity flow.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <AddTaskForm />
        </div>
        <div className="order-1 lg:order-2">
          <div className="glass-card p-6 h-full flex flex-col justify-center items-center">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6">Stats Overview</h3>
            <TaskStats />
          </div>
        </div>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-black">Your Tasks</h2>
          <div className="h-[2px] flex-grow bg-slate-200 dark:bg-slate-800 rounded-full" />
          <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        {isTasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-48 glass-card bg-slate-200/50" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card p-20 text-center border-dashed border-2">
            <p className="text-slate-400 font-medium italic text-lg">No personal tasks yet. Start by adding one above! 🚀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={(id) => toggleMutation.mutate(id)} 
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Tasks;
