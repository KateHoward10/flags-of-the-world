import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const serverAddress = 'http://localhost:8080';

function App() {
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const socket = io(serverAddress);
    setInterval(() => {
      if (loaded) {
        socket.emit('cursor', {
          name: name,
          sessionKey: window.localStorage.getItem('sessionKey')
        });
      }
    }, 3000);
  });

  function joinGame(e) {
    fetch(serverAddress + '/create_user', {
      body: JSON.stringify({
        name: name
      }),
      method: 'post',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          localStorage.sessionKey = json.sessionKey;
          setLoaded(true);
        }
      });
  }

  return (
    <React.Fragment>
      {loaded ? (
        <div>Here is the game</div>
      ) : (
        <div>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your username" />
          <button onClick={joinGame}>Join</button>
        </div>
      )}
    </React.Fragment>
  );
}

export default App;
