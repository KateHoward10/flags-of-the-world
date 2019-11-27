const app = require('express')(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  bodyParser = require('body-parser'),
  cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/create_user', (req, res) => {
  const sessionKey = generateId(24);
  sessions[sessionKey] = new Session(req.body.name);
  res.json({ success: true, sessionKey });
});

const sessions = {};

setInterval(() => {
  for (sessionKey in sessions) {
    const session = sessions[sessionKey];
    session.decrementTimer();
    if (session.getTimer() === 0) {
      delete sessions[sessionKey];
    }
  }
}, 1000);

class Session {
  constructor(name) {
    this._name = name;
    this._timer = 10;
  }
  getName() {
    return this._name;
  }
  resetTimer() {
    this._timer = 10;
  }
  decrementTimer() {
    this._timer -= 1;
  }
  getTimer() {
    return this._timer;
  }
}

function generateId(len) {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

io.on('connection', socket => {
  setInterval(() => {
    const sessionKeys = Object.keys(sessions);
    const cursorPositions = [];
    for (let i = 0, n = sessionKeys.length; i < n; i++) {
      const key = sessionKeys[i];
      const session = sessions[key];
      cursorPositions.push({
        name: session.getName(),
        key: session.getName()
      });
    }

    socket.emit('cursor', cursorPositions);
  }, Math.round(1000 / 30));
});

http.listen(8080, () => {
  console.log('Listening to port 8080');
});
