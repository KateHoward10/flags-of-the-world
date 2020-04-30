import React from 'react';

const Setup = ({ numberOfQuestions, setNumber, players, startGame }) => (
  <>
    <label htmlFor="questions">Number of questions in the quiz: </label>
    <input type="number" min="5" max="50" value={numberOfQuestions} id="questions" onChange={setNumber} />
    {Boolean(players.length > 1) && <button onClick={startGame}>Start the game!</button>}
  </>
);

export default Setup;