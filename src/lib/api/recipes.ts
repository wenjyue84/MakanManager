import { createServer, IncomingMessage, ServerResponse } from 'http';
import { RecipeService } from '../services/recipes.service';

function sendJson(res: ServerResponse, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export const recipesApi = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.statusCode = 404;
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const idMatch = url.pathname.match(/^\/recipes\/([^/]+)(\/print)?$/);

  try {
    if (req.method === 'GET' && url.pathname === '/recipes') {
      const recipes = await RecipeService.getAllRecipes();
      return sendJson(res, recipes);
    }

    if (req.method === 'GET' && idMatch && !idMatch[2]) {
      const recipe = await RecipeService.getRecipeById(idMatch[1]);
      if (!recipe) return sendJson(res, { error: 'Not found' }, 404);
      return sendJson(res, recipe);
    }

    if (req.method === 'POST' && url.pathname === '/recipes') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        const data = JSON.parse(body || '{}');
        const created = await RecipeService.createRecipe(data);
        sendJson(res, created, 201);
      });
      return;
    }

    if (req.method === 'PUT' && idMatch && !idMatch[2]) {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        const data = JSON.parse(body || '{}');
        const updated = await RecipeService.updateRecipe(idMatch[1], data);
        if (!updated) return sendJson(res, { error: 'Not found' }, 404);
        sendJson(res, updated);
      });
      return;
    }

    if (req.method === 'DELETE' && idMatch && !idMatch[2]) {
      const success = await RecipeService.deleteRecipe(idMatch[1]);
      return sendJson(res, { success });
    }

    if (req.method === 'POST' && idMatch && idMatch[2]) {
      const pdf = await RecipeService.printRecipe(idMatch[1]);
      if (!pdf) {
        res.statusCode = 404;
        return res.end();
      }
      res.setHeader('Content-Type', 'application/pdf');
      return res.end(Buffer.from(pdf));
    }

    res.statusCode = 404;
    res.end();
  } catch (err) {
    sendJson(res, { error: 'Server error' }, 500);
  }
});
