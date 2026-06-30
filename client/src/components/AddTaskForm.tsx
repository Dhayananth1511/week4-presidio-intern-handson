import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTaskStore } from '@/store/taskStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const taskSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title is too long"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .or(z.literal('')),
  priority: z.enum(['Low', 'Medium', 'High'])
});

type TaskFormData = z.infer<typeof taskSchema>;

export const AddTaskForm = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  const mutation = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
    },
  });
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'Medium',
      description: ''
    }
  });

  const onSubmit = (data: TaskFormData) => {
    mutation.mutate({
      title: data.title,
      description: data.description || '',
      priority: data.priority,
    });
  };

  return (
    <div className="glass-card p-8 mb-12 border-l-4 border-l-indigo-600 animate-fade-in">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
        ✨ Create New Task
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Task Title</label>
            <input
              {...register("title")}
              placeholder="What needs to be done?"
              className={`input-base ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.title.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Priority Level</label>
            <select
              {...register("priority")}
              className="input-base"
            >
              <option value="Low">🟢 Low Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="High">🔴 High Priority</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Notes / Description (Optional)</label>
          <textarea
            {...register("description")}
            placeholder="Add some more context..."
            className={`input-base min-h-[100px] resize-none ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.description.message}</span>}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className={`button-primary w-full md:w-auto ${mutation.isPending ? 'opacity-50' : ''}`}
          >
            {mutation.isPending ? '🚀 Adding...' : '🚀 Add Task to List'}
          </button>
        </div>
      </form>
    </div>
  );
};
