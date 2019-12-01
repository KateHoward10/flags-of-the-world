import React, { useState } from 'react';
import { connect } from 'react-redux';
import { sendNameToServer } from './socket';

function App({ players, dispatch }) {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);
  const inCharge = players.length && players[0].name === name;

  function submitName(e) {
    e.preventDefault();
    dispatch({ type: 'SET_USERNAME', name });
    sendNameToServer({ name });
    setJoined(true);
  }

  return (
    <div>
      <div>
        {joined ? (
          <div>
            Your username is <span>{name}</span>
            <div>
              Other members:
              {players.length <= 1 ? (
                <div>No other members yet</div>
              ) : (
                players.map((member, index) => <div key={index}>{member.name}</div>)
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
  players: state.players
});

export default connect(mapStateToProps)(App);
