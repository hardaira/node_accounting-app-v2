'use strict';

const express = require('express');

function createServer() {
  const app = express();
  app.use(express.json());

  let expenses = [];
  let categories = [];

  const generateId = (list) =>
    list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;

  app.get('/expenses', (req, res) => {
    res.json(expenses);
  });

  app.get('/expenses/:id', (req, res) => {
    const expense = expenses.find((e) => e.id === Number(req.params.id));
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  });

  app.post('/expenses', (req, res) => {
    const { description, amount, categoryId, date } = req.body;
    if (!description || amount === undefined || !categoryId || !date) {
      return res.status(400).json({
        message:
          'Missing required fields: description, amount, categoryId, date',
      });
    }

    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const newExpense = {
      id: generateId(expenses),
      description,
      amount,
      categoryId,
      date: new Date(date).toISOString(),
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  });

  app.put('/expenses/:id', (req, res) => {
    const expense = expenses.find((e) => e.id === Number(req.params.id));
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { description, amount, categoryId } = req.body;
    if (!description || amount === undefined || !categoryId) {
      return res.status(400).json({
        message: 'Missing required fields: description, amount, categoryId',
      });
    }

    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    expense.description = description;
    expense.amount = amount;
    expense.categoryId = categoryId;

    res.json(expense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const index = expenses.findIndex((e) => e.id === Number(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    const deleted = expenses.splice(index, 1)[0];
    res.status(200).json(deleted);
  });

  app.get('/categories', (req, res) => {
    res.json(categories);
  });

  app.get('/categories/:id', (req, res) => {
    const category = categories.find((c) => c.id === Number(req.params.id));
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  });

  app.post('/categories', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    const newCategory = {
      id: generateId(categories),
      name,
      description: description || '',
    };

    categories.push(newCategory);
    res.status(201).json(newCategory);
  });

  app.put('/categories/:id', (req, res) => {
    const category = categories.find((c) => c.id === Number(req.params.id));
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    category.name = name;
    category.description = description || '';

    res.json(category);
  });

  app.delete('/categories/:id', (req, res) => {
    const index = categories.findIndex((c) => c.id === Number(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const deleted = categories.splice(index, 1)[0];

    expenses = expenses.filter((e) => e.categoryId !== deleted.id);

    res.status(200).json(deleted);
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

module.exports = {
  createServer,
};
