import React from 'react';

const Welcome =({ onSwitch, submitName, setName }) => (
  <>
    <h1>Welcome to Flags of the World</h1>
    <img src="https://www.countryflags.io/mz/flat/64.png" alt="Flag of Mozambique" />
    <img src="https://www.countryflags.io/np/flat/64.png" alt="Flag of Nepal" />
    <img src="https://www.countryflags.io/va/flat/64.png" alt="Flag of Vatican City" />
    <img src="https://www.countryflags.io/sc/flat/64.png" alt="Flag of Seychelles" />
    <p><small>Be warned, there are questions about capitals too.</small></p>
    <div className="switch-container">
      <small>Single player</small>
      <label className="switch">
        <input type="checkbox" onChange={onSwitch} />
        <span className="slider"></span>
      </label>
      <small>Multiplayer</small>
    </div>
    <p>Please enter a username to begin</p>
    <form onSubmit={submitName}>
      <input onChange={setName} placeholder="Username" type="text" autoFocus />
      <button type="submit">Join</button>
    </form>
  </>
);

export default Welcome;