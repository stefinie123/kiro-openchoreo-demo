const express = require('express');
const { initDB } = require('./db');
const ordersRouter = require('./routes/orders');

const app = express();

app.use(express.json());
app.use('/', ordersRouter);

const PORT = process.env.PORT ?? 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Orders service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
