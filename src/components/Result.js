import React from 'react';

const Result = ({ winners }) => (
  <h3>
    The winner{winners.length > 1 ? 's are' : ' is'} {winners.map(winner => winner.name).join(' and ')}!
  </h3>
);

export default Result;