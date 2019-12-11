import React, { useState, useEffect } from 'react';
import useInterval from './useInterval';
import { connect } from 'react-redux';
import { sendNameToServer, sendQuestionToServer } from './socket';
import './App.css';

function App({ dispatch, score, players, question }) {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);
  const [countries, setCountries] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [playing, togglePlaying] = useState(false);
  const [time, setTime] = useState(null);
  const [guess, setGuess] = useState(null);
  const [winners, setWinners] = useState([]);
  const inCharge = players.length && players[0].name === name;
  const endpoint = 'https://restcountries.eu/rest/v2/all';
  const questionTypes = ['capital', 'name', 'alpha2Code', 'flag'];
  const { questionType, wording, options, rightCountry } = question;
  const rightAnswer = rightCountry ? rightCountry[questionType === 'flag' ? 'name' : questionType] : null;

  function submitName(e) {
    e.preventDefault();
    if (players.find(player => player.name === name)) {
      alert('That name is already taken, sorry');
    } else {
      sendNameToServer({ name, score: 0 });
      setJoined(true);
    }
  }

  function setNumber(e) {
    e.preventDefault();
    setNumberOfQuestions(parseInt(e.target.value));
  }

  function startGame() {
    generateQuestion();
    togglePlaying(true);
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

  function checkGuess(e) {
    if (!guess) {
      setGuess(e.target.value);
      if (e.target.value === rightAnswer) {
        dispatch({ type: 'INCREASE_SCORE', name });
        e.target.classList.add('correct-answer');
      } else {
        e.target.classList.add('wrong-answer');
      }
    }
  }

  // Set new question every ten seconds during game
  useInterval(
    () => {
      if (inCharge && countries.length && questionsAsked < numberOfQuestions) {
        generateQuestion();
      }
    },
    playing ? numberOfQuestions * 1000 : null
  );

  // Count down each question
  useInterval(
    () => {
      setTime(time - 1);
    },
    question.wording && time > 1 ? 1000 : null
  );

  // Update stuff when new question is set
  useEffect(() => {
    if (question.wording) {
      setTime(10);
      setGuess(null);
      setQuestionsAsked(q => q + 1);
      if (!playing) togglePlaying(true);
    }
  }, [question, playing]);

  // Find winner(s) if game ended
  useEffect(() => {
    if (questionsAsked >= numberOfQuestions) {
      togglePlaying(false);
      const highScore = Math.max(...players.map(player => player.score));
      setWinners(players.filter(player => player.score === highScore));
    }
  }, [questionsAsked, players]);

  // If first player, get country data
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
                : `Other players: ${players
                    .filter(player => player.name !== name)
                    .map(player => player.name)
                    .join(', ')}`}
            </p>
            {Boolean(!playing && winners.length) && (
              <h3>
                The winner{winners.length > 1 ? 's are' : ' is'} {winners.map(winner => winner.name).join(' and ')}!
              </h3>
            )}
            {Boolean(inCharge && countries.length && !playing) && (
              <React.Fragment>
                <div className="quiz-setup">
                  <label for="questions">Number of questions in the quiz: {numberOfQuestions}</label>
                  <input type="range" min="5" max="50" value={numberOfQuestions} id="questions" onChange={setNumber} />
                </div>
                <button onClick={startGame}>Start the game!</button>
              </React.Fragment>
            )}
            {Boolean(players.length && !inCharge && !question.wording) && (
              <p>Waiting for {players[0].name} to start the game...</p>
            )}
            {playing && (
              <div>
                {time && (
                  <div className="time-container">
                    <div style={{ height: '5px', width: `${time * 10}%`, background: 'blue' }} />
                  </div>
                )}
                {wording && <p>{wording}</p>}
                {questionType === 'flag' && (
                  <img src={`https://www.countryflags.io/${rightCountry.alpha2Code}/flat/64.png`} alt="Mystery flag" />
                )}
                <div>
                  {options &&
                    options.map((option, index) => (
                      <button
                        key={index}
                        value={option}
                        onClick={checkGuess}
                        className={
                          guess && option === rightAnswer ? 'correct-answer' : guess === option ? 'wrong-answer' : ''
                        }
                      >
                        {questionType === 'alpha2Code' ? (
                          <img src={`https://www.countryflags.io/${option}/flat/64.png`} alt="Mystery flag" />
                        ) : (
                          option
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}
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
