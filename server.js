const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, 'build')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendfile(path.join((__dirname = 'build/index.html')));
  });
}
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + 'public/index.html'));
});

server.listen(port, () => console.log(`connected to port ${port}!`));

let names = [];
let serverNames = [];
io.on('connection', socket => {
  socket.on('SEND_NAME_TO_SERVER', name => {
    serverNames = [...serverNames, { socketId: socket.id, name }];
    names = [...names, name];
    socket.broadcast.emit('SEND_NAMES_TO_CLIENTS', names);
    socket.emit('SEND_NAMES_TO_CLIENTS', names);
  });

  socket.on('SET_QUESTION', question => {
    socket.broadcast.emit('SEND_QUESTION_TO_CLIENTS', question);
  });

  socket.on('SET_NUMBER', numberOfQuestions => {
    socket.broadcast.emit('SEND_NUMBER_TO_CLIENTS', numberOfQuestions);
  });

  socket.on('SET_TOTAL', questionsAsked => {
    socket.broadcast.emit('SEND_TOTAL_TO_CLIENTS', questionsAsked);
  });

  socket.on('UPDATE_PLAYERS', players => {
    socket.broadcast.emit('SEND_NAMES_TO_CLIENTS', players);
    socket.emit('SEND_NAMES_TO_CLIENTS', players);
  });

  socket.on('disconnect', () => {
    serverNames = serverNames.filter(data => data.socketId !== socket.id);
    names = serverNames.map(data => data.name);
    socket.broadcast.emit('SEND_NAMES_TO_CLIENTS', names);
    socket.emit('SEND_NAMES_TO_CLIENTS', names);
  });
});
