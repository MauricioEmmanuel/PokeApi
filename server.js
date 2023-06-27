const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
const pokemonDataRouter = require('./endpoint/pokemonApi');
app.use('/pokemon', pokemonDataRouter);
app.listen(PORT, ()=> console.log("Express escuchando en el puerto: " + PORT));