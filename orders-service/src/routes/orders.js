'use strict';

const { Router } = require('express');
const { query } = require('../db');

const router = Router();

/**
 * Map a raw DB row to the public order object shape.
 * Converts snake_case columns to camelCase.
 */
function toOrderDTO(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    item: row.item,
    quantity: row.quantity,
    createdAt: row.created_at,
  };
}

/**
 * POST /orders
 * Validates body, inserts a new order, returns 201 + created record.
 */
router.post('/orders', async (req, res) => {
  try {
    const { customerName, item, quantity } = req.body ?? {};

    // Validate customerName
    if (typeof customerName !== 'string' || customerName.trim() === '') {
      return res.status(400).json({ error: 'customerName is required and must be a non-empty string' });
    }

    // Validate item
    if (typeof item !== 'string' || item.trim() === '') {
      return res.status(400).json({ error: 'item is required and must be a non-empty string' });
    }

    // Validate quantity — must be a positive integer
    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({ error: 'quantity is required and must be a positive integer' });
    }

    const result = await query(
      `INSERT INTO orders (customer_name, item, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [customerName.trim(), item.trim(), quantity]
    );

    return res.status(201).json(toOrderDTO(result.rows[0]));
  } catch (err) {
    console.error('POST /orders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /orders/:id
 * Returns the order with the given id, or 404 if not found.
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const result = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(toOrderDTO(result.rows[0]));
  } catch (err) {
    console.error('GET /orders/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
