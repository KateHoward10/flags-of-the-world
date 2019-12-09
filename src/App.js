import React, { useState, useEffect } from 'react';
import useInterval from './useInterval';
import { connect } from 'react-redux';
import { sendNameToServer, sendQuestionToServer } from './socket';
import './App.css';

function App({ dispatch, score, players, question }) {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);
  const [countries, setCountries] = useState([]);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [playing, togglePlaying] = useState(false);
  const [time, setTime] = useState(null);
  const inCharge = players.length && players[0].name === name;
  const endpoint = 'https://restcountries.eu/rest/v2/all';
  const questionTypes = ['capital', 'name', 'alpha2Code', 'flag'];
  const { questionType, wording, options, rightCountry } = question;

  function submitName(e) {
    e.preventDefault();
    dispatch({ type: 'SET_USERNAME', name });
    sendNameToServer({ name, score: 0 });
    setJoined(true);
  }

  function generateQuestion() {
    const rightCountry = countries[Math.floor(Math.random() * countries.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const wording = `${
      questionType === 'capital'
        ? `What is the capital of ${rightCountry.name}`
        : questionType === 'name'
        ? `Which country's capital is ${rightCountry.capital}`
        : questionType === 'flag'
        ? 'Which country’s flag is this'
        : `What is the flag of ${rightCountry.name}`
    }?`;
    const property = questionType === 'flag' ? 'name' : questionType;
    let optionsToSet = [rightCountry[property]];
    for (let i = 0; i < 3; i++) {
      const filteredCountries = countries.filter(country => !optionsToSet.includes(country[property]));
      optionsToSet.push(filteredCountries[Math.floor(Math.random() * filteredCountries.length)][property]);
    }
    const options = optionsToSet.sort(() => Math.random() - 0.5);
    const question = { questionType, wording, options, rightCountry };
    dispatch({ type: 'PUT_QUESTION_TO_REDUCER', question });
    sendQuestionToServer(question);
  }

  function increaseScore() {
    dispatch({ type: 'INCREASE_SCORE', name });
  }

  function checkGuess(e) {
    e.preventDefault();
    if (e.target.value === rightCountry[questionType === 'flag' ? 'name' : questionType]) increaseScore();
    setQuestionsAsked(questionsAsked + 1);
  }

  useInterval(
    () => {
      if (inCharge && countries.length) generateQuestion();
    },
    playing ? 10000 : null
  );

  useInterval(
    () => {
      setTime(time - 1);
    },
    question.wording && time > 1 ? 1000 : null
  );

  useEffect(() => {
    if (question.wording) setTime(10);
  }, [question]);

  useEffect(() => {
    if (inCharge && !countries.length) {
      fetch(endpoint)
        .then(blob => blob.json())
        .then(data =>
          setCountries([...data.filter(country => country.name.length && country.capital.length && country.alpha2Code)])
        );
    }
  }, [inCharge, countries]);

  return (
    <div>
      <div>
        {joined ? (
          <div>
            <p>Your username is {name}</p>
            <p>
              {players.length <= 1
                ? 'No other players yet'
                : `Other players: ${players.map(player => `${player.name}: ${player.score}`).join(', ')}`}
            </p>
            {Boolean(inCharge && countries.length && !playing) && (
              <button onClick={() => togglePlaying(true)}>Start the game!</button>
            )}
            {time && <p>Time remaining: {time}</p>}
            {wording && <p>{wording}</p>}
            {questionType === 'flag' && (
              <img src={`https://www.countryflags.io/${rightCountry.alpha2Code}/flat/64.png`} alt="Mystery flag" />
            )}
            <div>
              {options &&
                options.map((option, index) => (
                  <button key={index} value={option} onClick={checkGuess}>
                    {questionType === 'alpha2Code' ? (
                      <img src={`https://www.countryflags.io/${option}/flat/64.png`} alt="Mystery flag" />
                    ) : (
                      option
                    )}
                  </button>
                ))}
            </div>
            <p>
              Score: {score} / {questionsAsked}
            </p>
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
  score: state.score,
  players: state.players,
  question: state.question
});

export default connect(mapStateToProps)(App);
