'use strict';

const express = require('express');

function createServer() {
  const app = express();
  app.use(express.json());

  let expenses = [];
  let users = [];

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
    const { userId, spentAt, title, amount, category } = req.body;

    // Validation for required fields
    if (
      !userId ||
      !spentAt ||
      !title ||
      typeof amount !== 'number' ||
      isNaN(amount) ||
      !category
    ) {
      return res.status(400).json({
        message:
          'Missing or invalid required fields: userId, spentAt, title, amount, category',
      });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const parsedSpentAt = new Date(spentAt);
    if (isNaN(parsedSpentAt)) {
      return res
        .status(400)
        .json({ message: 'Invalid date format for spentAt' });
    }

    const newExpense = {
      id: generateId(expenses),
      userId,
      spentAt: parsedSpentAt.toISOString(),
      title,
      amount,
      category,
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

    const { userId, spentAt, title, amount, category } = req.body;

    // Validation for required fields
    if (
      !userId ||
      !spentAt ||
      !title ||
      typeof amount !== 'number' ||
      isNaN(amount) ||
      !category
    ) {
      return res.status(400).json({
        message:
          'Missing or invalid required fields: userId, spentAt, title, amount, category',
      });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    expense.userId = userId;
    expense.spentAt = new Date(spentAt).toISOString();
    expense.title = title;
    expense.amount = amount;
    expense.category = category;

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

  // Endpoint to get all users
  app.get('/users', (req, res) => {
    res.json(users);
  });

  // Endpoint to get a specific user by id
  app.get('/users/:id', (req, res) => {
    const user = users.find((u) => u.id === String(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  // Endpoint to create a new user
  app.post('/users', (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    const newUser = {
      id: generateId(users),
      name,
    };

    users.push(newUser);
    res.status(201).json(newUser);
  });

  // Endpoint to update an existing user
  app.put('/users/:id', (req, res) => {
    const user = users.find((u) => u.id === String(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    user.name = name;
    res.json(user);
  });

  // Endpoint to delete a user
  app.delete('/users/:id', (req, res) => {
    const index = users.findIndex((u) => u.id === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    const deletedUser = users.splice(index, 1)[0];

    // Delete any expenses associated with this user
    expenses = expenses.filter((e) => e.userId !== deletedUser.id);

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
