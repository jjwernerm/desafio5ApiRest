const express = require('express');
const app = express();
const fs = require('fs');
app.listen(3000, console.log('Server ON'));
app.use(express.json());

const { joyas, joyas_HATEOAS, filtros_joyas } = require('./consultaSQL');

app.get('/joyas', async (req, res) => {
  try {
    const queryStrings = req.query;
    const inventario = await joyas(queryStrings);
    const HATEOAS = await joyas_HATEOAS(inventario);
    res.json(HATEOAS);
  } catch (fault) {
    console.error(fault);
    res.send(fault.message);
  }
});

app.get('/joyas/filtros', async (req, res) => {
  try {
    const queryStrings = req.query;
    const inventario = await filtros_joyas(queryStrings);
    res.json(inventario);
  } catch (fault) {
    console.error(fault);
    res.send(fault.message);
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});