import express from 'express';
import { tasksService } from './lib/services/tasks.service';
import { RecipeService } from './lib/services/recipes.service';

const app = express();
app.use(express.json());

app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await tasksService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await tasksService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await tasksService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await tasksService.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const success = await tasksService.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Recipe endpoints
app.get('/api/recipes', async (_req, res) => {
  try {
    const recipes = await RecipeService.getAllRecipes();
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await RecipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { user, ...data } = req.body;
    const created = await RecipeService.createRecipe(
      data,
      user || { id: 'system', name: 'System' }
    );
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { user, ...data } = req.body;
    const updated = await RecipeService.updateRecipe(
      req.params.id,
      data,
      user || { id: 'system', name: 'System' }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const success = await RecipeService.deleteRecipe(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

app.post('/api/recipes/:id/print', async (req, res) => {
  try {
    const pdf = await RecipeService.printRecipe(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate recipe card' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
