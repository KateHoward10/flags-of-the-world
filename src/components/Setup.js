import React from 'react';

const Setup = ({ numberOfQuestions, setNumber, onSwitch, players, multiplayer, startGame }) => (
  <>
    <label htmlFor="questions">Number of questions in the quiz: </label>
    <input type="number" min="5" max="50" value={numberOfQuestions} id="questions" onChange={setNumber} />
    <div className="switch-container">
      <small>Single player</small>
      <label className="switch">
        <input type="checkbox" onChange={onSwitch} />
        <span className="slider"></span>
      </label>
      <small>Multiplayer</small>
    </div>
    {Boolean(players.length > 1 || !multiplayer) && <button onClick={startGame}>Start the game!</button>}
  </>
);

export default Setup;