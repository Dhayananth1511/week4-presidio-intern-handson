import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'Done';
}

interface TaskStore {
  // Real API Actions (Mutations)
  // We keep the logic here but remove the set() calls for 'tasks' array
  addTask: (data: Omit<Task, 'id' | 'status'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>(() => ({
  addTask: async (data) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add task");
  },

  deleteTask: async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Failed to delete task");
  },

  toggleTaskStatus: async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH' });
    if (!res.ok) throw new Error("Failed to toggle task");
  },
}));
