'use strict';

const express = require('express');

function createServer() {
  const app = express();
  app.use(express.json());

  let expenses = [];
  let categories = [];

  const generateId = (list) =>
    list.length
      ? (Math.max(...list.map((i) => Number(i.id))) + 1).toString()
      : '1';

  // Endpoint to get all expenses
  app.get('/expenses', (req, res) => {
    res.json(expenses);
  });

  // Endpoint to get a specific expense by id
  app.get('/expenses/:id', (req, res) => {
    const expense = expenses.find((e) => e.id === String(req.params.id));
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  });

  // Endpoint to create a new expense
  app.post('/expenses', (req, res) => {
    const { description, amount, categoryId, date } = req.body;

    // Validation for required fields
    if (
      !description ||
      typeof amount !== 'number' ||
      isNaN(amount) ||
      !categoryId ||
      !date
    ) {
      return res.status(400).json({
        message:
          'Missing or invalid required fields: description, amount, categoryId, date',
      });
    }

    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const newExpense = {
      id: generateId(expenses),
      description,
      amount,
      categoryId,
      date: parsedDate.toISOString(),
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  });

  // Endpoint to update an existing expense
  app.put('/expenses/:id', (req, res) => {
    const expense = expenses.find((e) => e.id === String(req.params.id));
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { description, amount, categoryId, date } = req.body;

    // Validation for required fields
    if (
      !description ||
      typeof amount !== 'number' ||
      isNaN(amount) ||
      !categoryId ||
      !date
    ) {
      return res.status(400).json({
        message:
          'Missing or invalid required fields: description, amount, categoryId, date',
      });
    }

    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    expense.description = description;
    expense.amount = amount;
    expense.categoryId = categoryId;
    expense.date = new Date(date).toISOString();

    res.json(expense);
  });

  // Endpoint to delete an expense
  app.delete('/expenses/:id', (req, res) => {
    const index = expenses.findIndex((e) => e.id === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    expenses.splice(index, 1);
    res.status(204).send(); // No content to return
  });

  // Endpoint to get all categories
  app.get('/categories', (req, res) => {
    res.json(categories);
  });

  // Endpoint to get a specific category by id
  app.get('/categories/:id', (req, res) => {
    const category = categories.find((c) => c.id === String(req.params.id));
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  });

  // Endpoint to create a new category
  app.post('/categories', (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    const newCategory = {
      id: generateId(categories),
      name,
    };

    categories.push(newCategory);
    res.status(201).json(newCategory);
  });

  // Endpoint to update an existing category
  app.put('/categories/:id', (req, res) => {
    const category = categories.find((c) => c.id === String(req.params.id));
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    category.name = name;
    res.json(category);
  });

  // Endpoint to delete a category
  app.delete('/categories/:id', (req, res) => {
    const index = categories.findIndex((c) => c.id === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const deleted = categories.splice(index, 1)[0];

    // Delete any expenses associated with this category
    expenses = expenses.filter((e) => e.categoryId !== deleted.id);

    res.status(204).send(); // No content to return
  });

  // Catch-all route for undefined routes
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

module.exports = {
  createServer,
};
