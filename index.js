const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

async function fetchPokemonFromApi(endpoint) {
  const response = await fetch(`${POKEAPI_BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Pokemon no encontrado: ${response.status}`);
  }

  return response.json();
}

app.get('/pokemon', async (req, res) => {
  try {
    const data = await fetchPokemonFromApi('/pokemon?limit=20&offset=0');
    res.json(data.results);
  } catch (error) {
    fs.readFile('pokemon.json', 'utf8', (err, fileData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'No se pudo consultar la API ni leer los datos locales.' });
      }

      const pokemonData = JSON.parse(fileData);
      res.json(pokemonData);
    });
  }
});

app.get('/pokemon/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pokemon = await fetchPokemonFromApi(`/pokemon/${id}`);
    res.json(pokemon);
  } catch (error) {
    res.status(404).json({
      error: `No se encontró un Pokémon con el id ${id}`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Express listo en puerto ${PORT}`);
});
