import React from 'react';

const Result = ({ winners, name, reset, inCharge, multiplayer, questionsAsked }) => (
  <>
    {winners.map(winner => winner.name).includes(name) && <h2>Well done!</h2>}
    <h3>
      {`${multiplayer ? `The winner${winners.length > 1 ? 's are' : ' is'} ${winners.map(winner => winner.name === name ? "you" : winner.name).join(' and ')}, with ${winners[0].score}!` : `You scored ${winners[0].score}`}/${questionsAsked}`}
    </h3>
    {inCharge && <button onClick={reset}>New Game</button>}
  </>
);

export default Result;