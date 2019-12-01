import React, { useState } from 'react';
import { connect } from 'react-redux';
import { sendNameToServer } from './socket';

function App({ names, dispatch }) {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);

  function submitName(e) {
    e.preventDefault();
    console.log(name);
    dispatch({ type: 'SET_USERNAME', name });
    sendNameToServer(name);
    setJoined(true);
  }

  return (
    <div container justify="center">
      <div style={{ textAlign: 'center' }} item xs={12}>
        {joined ? (
          <div>
            Your username is <span style={{ color: 'red' }}>{name}</span>
            <div style={{ padding: '10px' }}>
              Other members:
              {names.length <= 1 ? (
                <div style={{ color: 'red' }}>No other members yet</div>
              ) : (
                names.map(member => (
                  <div style={{ display: name === member && 'none' }} key={member}>
                    {member}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={submitName}>
            <input onChange={e => setName(e.target.value)} />
            <button type="submit">Join</button>
          </form>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  name: state.name,
  names: state.names
});

export default connect(mapStateToProps)(App);
