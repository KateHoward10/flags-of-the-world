import React, { useState, useEffect, useCallback } from 'react';
import useInterval from './useInterval';
import { connect } from 'react-redux';
import { sendNameToServer, sendQuestionToServer, sendNumberToServer, sendTotalToServer } from './socket';
import Welcome from './components/Welcome';
import Setup from './components/Setup';
import Question from './components/Question';
import Result from './components/Result';
import './App.css';

function App({ dispatch, players, question, numberOfQuestions, questionsAsked }) {
  const [multiplayer, toggleMultiplayer] = useState(false);
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState(null);
  const [score, setScore] = useState(0);
  const [countries, setCountries] = useState([]);
  const [playing, togglePlaying] = useState(false);
  const [time, setTime] = useState(null);
  const [guess, setGuess] = useState(null);
  const [winners, setWinners] = useState([]);
  const inCharge = !multiplayer || (players.length && players[0].name === name);
  const endpoint = 'https://restcountries.com/v3.1/all';
  const questionTypes = ['capital', 'name', 'cca2', 'flag'];

  function submitName(e) {
    e.preventDefault();
    if (multiplayer) {
      if (players.find(player => player.name === name)) {
        return alert('That name is already taken, sorry');
      } else {
        sendNameToServer({ name, score: 0 });
      }
    }
    setJoined(true);
    setScore(0);
  }

  function startGame() {
    if (multiplayer) dispatch({ type: 'RESET_SCORES' });
    generateQuestion(true);
  }

  function setNumber(e) {
    e.preventDefault();
    const numberOfQuestions = parseInt(e.target.value);
    dispatch({ type: 'PUT_NUMBER_TO_REDUCER', numberOfQuestions });
    sendNumberToServer(numberOfQuestions);
  }

  function getAnswer(details, type) {
    switch(type) {
      case "capital":
        return details.capital[0];
      case "name":
      case "flag":
        return details.name.common;
      default:
        return details[type];
    }
  }

  function generateQuestion(first) {
    const rightCountry = countries[Math.floor(Math.random() * countries.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const wording = `${
      questionType === 'capital'
        ? `What is the capital of ${rightCountry.name.common}`
        : questionType === 'name'
        ? `Which country's capital is ${rightCountry.capital[0]}`
        : questionType === 'flag'
        ? 'Which country’s flag is this'
        : `What is the flag of ${rightCountry.name.common}`
    }?`;
    const rightAnswer = getAnswer(rightCountry, questionType);
    let optionsToSet = [rightAnswer];
    for (let i = 0; i < 3; i++) {
      const filteredCountries = countries.filter(country => !optionsToSet.includes(getAnswer(country, questionType)));
      const filteredCountry = filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
      optionsToSet.push(getAnswer(filteredCountry, questionType));
    }
    const options = optionsToSet.sort(() => Math.random() - 0.5);
    const question = { questionType, wording, options, rightCountry, rightAnswer };
    dispatch({ type: 'PUT_QUESTION_TO_REDUCER', question });
    const total = first ? 1 : questionsAsked + 1;
    dispatch({ type: 'PUT_TOTAL_TO_REDUCER', questionsAsked: total });
    if (multiplayer) {
      sendQuestionToServer(question);
      sendTotalToServer(total);
    }
  }

  function checkGuess(e) {
    if (!guess) {
      setGuess(e.target.value);
      if (e.target.value === question.rightAnswer) {
        if (multiplayer) {
          dispatch({ type: 'INCREASE_SCORE', name });
        }
        setScore(s => s + 1);
        e.target.classList.add('correct-answer');
      } else {
        e.target.classList.add('wrong-answer');
      }
    }
  }

  // Find winner(s) if game ended
  const checkForEnd = useCallback((questionsAsked, numberOfQuestions) => {
    if (questionsAsked > numberOfQuestions) {
      togglePlaying(false);
      setTime(null);
      const highScore = Math.max(...players.map(player => player.score));
      setWinners(multiplayer ? players.filter(player => player.score === highScore) : [{name, score}]);
    }
  }, [players, multiplayer, name, score]);

  function reset() {
    setWinners([]);
    dispatch({ type: 'PUT_QUESTION_TO_REDUCER', question: {} });
    if (multiplayer) sendQuestionToServer({});
  }

  // Set new question every ten seconds during game
  useInterval(() => {
    if (inCharge && countries.length) generateQuestion();
  }, playing ? 10000 : null);

  // Count down each question
  useInterval(
    () => setTime(time - 1),
    question.wording && time > 1 ? 100 : null
  );

  // Reset when new game starts
  useEffect(() => {
    if (playing) {
      setScore(0);
      setGuess(null);
      setWinners([]);
    }
  }, [playing]);

  // Update stuff when new question is set
  useEffect(() => {
    if (question.wording) {
      setTime(100);
      setGuess(null);
      togglePlaying(true);
    }
  }, [question]);

  useEffect(() => checkForEnd(questionsAsked, numberOfQuestions), [questionsAsked, numberOfQuestions, checkForEnd]);

  // If first player, get country data
  useEffect(() => {
    if (inCharge && !countries.length) {
      fetch(endpoint)
        .then(blob => blob.json())
        .then(data => {
          setCountries([...data.filter(country => country.name.common && country.capital && country.cca2)])
        });
    }
  }, [inCharge, countries]);

  return (
    <div>
      {(name && joined) && <div className="username">{name}</div>}
      <div className="container">
        {joined ? (
          <>
            {multiplayer && (
              <p>
                {players.length <= 1
                  ? 'No other players yet'
                  : `Other players: ${players
                      .filter(player => player.name !== name)
                      .map(player => player.name)
                      .join(', ')}`}
              </p>
            )}
            {playing ? (
              <>
                <Question
                  time={time}
                  question={question}
                  checkGuess={checkGuess}
                  guess={guess}
                />
                {Boolean(questionsAsked) && (
                  <p className="score-container">
                    Your score: {score} / {playing ? questionsAsked : questionsAsked - 1}
                  </p>
                )}
              </>
            ) : (
              <>
                {Boolean(winners.length) && <Result winners={winners} name={name} reset={reset} inCharge={inCharge} multiplayer={multiplayer} questionsAsked={questionsAsked - 1} />}
                {Boolean((players.length || !multiplayer) && !question.wording) && (
                  <>
                    <p>You will have ten seconds to answer each question</p>
                    {!inCharge && <p>Waiting for {players[0].name} to start the game...</p>}
                  </>
                )}
                {Boolean(inCharge && countries.length && !winners.length) && (
                  <Setup
                    numberOfQuestions={numberOfQuestions}
                    setNumber={setNumber}
                    multiplayer={multiplayer}
                    players={players}
                    startGame={startGame}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <Welcome
            onSwitch={e => toggleMultiplayer(e.target.checked)}
            submitName={submitName}
            setName={e => setName(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  players: state.players,
  question: state.question,
  numberOfQuestions: state.numberOfQuestions,
  questionsAsked: state.questionsAsked
});

export default connect(mapStateToProps)(App);
