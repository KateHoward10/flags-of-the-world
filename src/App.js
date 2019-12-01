import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { sendNameToServer } from './socket';

function App({ players, dispatch }) {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);
  const [countries, setCountries] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [rightAnswer, setRightAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const inCharge = players.length && players[0].name === name;
  const endpoint = 'https://restcountries.eu/rest/v2/all';
  const questionTypes = ['capital', 'name', 'alpha2Code', 'flag'];

  function submitName(e) {
    e.preventDefault();
    dispatch({ type: 'SET_USERNAME', name });
    sendNameToServer({ name });
    setJoined(true);
  }

  function generateQuestion() {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    setQuestion(
      `${
        questionType === 'capital'
          ? `What is the capital of ${randomCountry.name}`
          : questionType === 'name'
          ? `Which country's capital is ${randomCountry.capital}`
          : questionType === 'flag'
          ? 'Which country’s flag is this'
          : `What is the flag of ${randomCountry.name}`
      }?`
    );
    const property = questionType === 'flag' ? 'name' : questionType;
    setRightAnswer(randomCountry[property]);
    let optionsToSet = [randomCountry[property]];
    for (let i = 0; i < 3; i++) {
      const filteredCountries = countries.filter(country => !options.includes(country[property]));
      optionsToSet.push(filteredCountries[Math.floor(Math.random() * filteredCountries.length)][property]);
    }
    setOptions(optionsToSet.sort(() => Math.random() - 0.5));
  }

  function checkGuess(e) {
    if (e.target.value === rightAnswer) {
      setScore(score + 1);
    }
    setQuestionsAsked(questionsAsked + 1);
  }

  useEffect(() => {
    if (inCharge && !countries.length) {
      fetch(endpoint)
        .then(blob => blob.json())
        .then(data =>
          setCountries([...data.filter(country => country.name.length && country.capital.length && country.alpha2Code)])
        );
    }
    if (countries.length) generateQuestion();
  }, [inCharge, countries]);

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
      <p>{question}</p>
      <div>
        {options.map((option, index) => (
          <button key={index} value={option} onClick={checkGuess}>
            {option}
          </button>
        ))}
      </div>
      <p>
        Score: {score} / {questionsAsked}
      </p>
    </div>
  );
}

const mapStateToProps = state => ({
  name: state.name,
  players: state.players
});

export default connect(mapStateToProps)(App);
