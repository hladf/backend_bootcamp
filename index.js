const express = require('express');

const server = express();

server.use(express.json());

// query params = ?teste=1
// route params = /users/1

const users = ['hugo', 'robson', 'victor'];

// middleware global
server.use((req, res, next) => {
  console.time('request');
  console.log('Passou pelo midw global!');

  next();

  console.timeEnd('request');
});

// middleware local, que é aplicado diretamente na rota
function checkUserExists(req, res, next) {
  if (!req.body.name) {
    return res.status(400).json({ error: 'User name is required' });
  }

  return next();
}

function checkUserInArray(req, res, next) {
  const user = users[req.params.index];

  if (!user) {
    return res.status(400).json({ error: 'User does not exists' });
  }

  // 'injetando' o usuario no request para que as rotas que
  // utilizam esse middleware tenham acesso a essa nova variavel do red
  req.user = user;

  return next();
}

server.get('/users', (req, res) => {
  res.json(users);
});

server.get('/users/:index', checkUserInArray, (req, res) => {
  return res.json(req.user);
});

server.post('/users', checkUserExists, (req, res) => {
  const { name } = req.body;

  users.push(name);

  return res.json(users);
});

server.put('/users/:index', checkUserInArray, checkUserExists, (req, res) => {
  const { index } = req.params;
  const { name } = req.body;

  users[index] = name;

  return res.json(users);
});

server.delete('/users/:index', checkUserInArray, (req, res) => {
  const { index } = req.params;

  users.splice(index, 1);

  return res.send();
});

server.listen(3000);
