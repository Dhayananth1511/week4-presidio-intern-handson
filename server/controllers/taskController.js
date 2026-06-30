const tasks = require('../models/taskStore');

/**
 * Get tasks for the LOGGED IN user only
 */
exports.getTasks = (req, res) => {
  const userEmail = req.user.email;
  const userTasks = tasks.filter(t => t.userEmail === userEmail);
  res.json(userTasks);
};

/**
 * Add task for the LOGGED IN user
 */
exports.addTask = (req, res) => {
  try {
    const userEmail = req.user.email;
    const { title, description, priority } = req.body;
    
    console.log("Saving Task for:", userEmail);
    console.log("Task Data:", req.body);

    const newTask = {
      id: Date.now().toString(),
      userEmail: userEmail,
      title,
      description,
      priority: priority || 'Medium',
      status: 'To Do'
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Failed to add task" });
  }
};

/**
 * Toggle Task Status (Only if it belongs to the user)
 */
exports.toggleTask = (req, res) => {
  const userEmail = req.user.email;
  const { id } = req.params;

  const task = tasks.find(t => t.id === id && t.userEmail === userEmail);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.status = task.status === 'To Do' ? 'Done' : 'To Do';
  res.json(task);
};

/**
 * Delete Task (Only if it belongs to the user)
 */
exports.deleteTask = (req, res) => {
  const userEmail = req.user.email;
  const { id } = req.params;

  const taskIndex = tasks.findIndex(t => t.id === id && t.userEmail === userEmail);
  if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted' });
};
