import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { sendNameToServer, sendQuestionToServer } from './socket';

function App({ players, dispatch, question }) {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);
  const [countries, setCountries] = useState([]);
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const inCharge = players.length && players[0].name === name;
  const endpoint = 'https://restcountries.eu/rest/v2/all';
  const questionTypes = ['capital', 'name', 'alpha2Code', 'flag'];
  const { wording, options, rightAnswer } = question;

  function submitName(e) {
    e.preventDefault();
    dispatch({ type: 'SET_USERNAME', name });
    sendNameToServer({ name });
    setJoined(true);
  }

  function generateQuestion() {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const wording = `${
      questionType === 'capital'
        ? `What is the capital of ${randomCountry.name}`
        : questionType === 'name'
        ? `Which country's capital is ${randomCountry.capital}`
        : questionType === 'flag'
        ? 'Which country’s flag is this'
        : `What is the flag of ${randomCountry.name}`
    }?`;
    const property = questionType === 'flag' ? 'name' : questionType;
    const rightAnswer = randomCountry[property];
    let optionsToSet = [randomCountry[property]];
    for (let i = 0; i < 3; i++) {
      const filteredCountries = countries.filter(country => !optionsToSet.includes(country[property]));
      optionsToSet.push(filteredCountries[Math.floor(Math.random() * filteredCountries.length)][property]);
    }
    const options = optionsToSet.sort(() => Math.random() - 0.5);
    const question = { wording, options, rightAnswer };
    dispatch({ type: 'PUT_QUESTION_TO_REDUCER', question });
    sendQuestionToServer(question);
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
              Other players:
              {players.length <= 1 ? (
                <div>No other players yet</div>
              ) : (
                players.map((player, index) => <div key={index}>{player.name}</div>)
              )}
            </div>
            {wording && <p>{wording}</p>}
            <div>
              {options &&
                options.map((option, index) => (
                  <button key={index} value={option} onClick={checkGuess}>
                    {option}
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
  name: state.name,
  players: state.players,
  question: state.question
});

export default connect(mapStateToProps)(App);
