import React, { useState, useEffect } from 'react';
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
  const [countries, setCountries] = useState([]);
  const [playing, togglePlaying] = useState(false);
  const [time, setTime] = useState(null);
  const [guess, setGuess] = useState(null);
  const [winners, setWinners] = useState([]);
  const inCharge = players.length && players[0].name === name;
  const endpoint = 'https://restcountries.eu/rest/v2/all';
  const questionTypes = ['capital', 'name', 'alpha2Code', 'flag'];
  const { questionType, wording, options, rightCountry } = question;
  const rightAnswer = rightCountry ? rightCountry[questionType === 'flag' ? 'name' : questionType] : null;
  const score =
    players.length && players.find(player => player.name === name)
      ? players.find(player => player.name === name).score
      : 0;

  function submitName(e) {
    e.preventDefault();
    if (players.find(player => player.name === name)) {
      alert('That name is already taken, sorry');
    } else {
      sendNameToServer({ name, score: 0 });
      setJoined(true);
    }
  }

  function startGame() {
    dispatch({ type: 'RESET_SCORES' });
    generateQuestion(true);
  }

  function setNumber(e) {
    e.preventDefault();
    const numberOfQuestions = parseInt(e.target.value);
    dispatch({ type: 'PUT_NUMBER_TO_REDUCER', numberOfQuestions });
    sendNumberToServer(numberOfQuestions);
  }

  function generateQuestion(first) {
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
    const total = first ? 1 : questionsAsked + 1;
    dispatch({ type: 'PUT_TOTAL_TO_REDUCER', questionsAsked: total });
    sendTotalToServer(total);
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
      if (inCharge && countries.length) {
        generateQuestion();
      }
    },
    playing ? 10000 : null
  );

  // Count down each question
  useInterval(
    () => {
      setTime(time - 1);
    },
    question.wording && time > 1 ? 100 : null
  );

  // Reset when new game starts
  useEffect(() => {
    if (playing) {
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

  // Find winner(s) if game ended
  useEffect(() => {
    if (questionsAsked > numberOfQuestions) {
      togglePlaying(false);
      setTime(null);
      const highScore = Math.max(...players.map(player => player.score));
      setWinners(players.filter(player => player.score === highScore));
    }
  }, [questionsAsked, players, numberOfQuestions]);

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
      {(name && joined) && <div className="username">{name}</div>}
      <div className="container">
        {joined ? (
          <>
            {multiplayer && (
              <>
                <p>
                  {players.length <= 1
                    ? 'No other players yet'
                    : `Other players: ${players
                        .filter(player => player.name !== name)
                        .map(player => player.name)
                        .join(', ')}`}
                </p>
                {Boolean(!playing && winners.length) && <Result winners={winners} />}
              </>
            )}
            {Boolean(questionsAsked) && (
              <h4>
                Your score: {score} / {playing ? questionsAsked : questionsAsked - 1}
              </h4>
            )}
            {!playing && <p>You will have ten seconds to answer each question</p>}
            {Boolean(inCharge && countries.length && !playing) && (
              <Setup
                numberOfQuestions={numberOfQuestions}
                setNumber={setNumber}
                onSwitch={e => toggleMultiplayer(e.target.checked)}
                players={players}
                multiplayer={multiplayer}
                startGame={startGame}
              />
            )}
            {Boolean(players.length && !inCharge && !question.wording && multiplayer) && (
              <p>Waiting for {players[0].name} to start the game...</p>
            )}
            {playing && (
              <Question
                time={time}
                question={question}
                checkGuess={checkGuess}
                guess={guess}
                rightAnswer={rightAnswer}
              />
            )}
          </>
        ) : (
          <Welcome submitName={submitName} setName={e => setName(e.target.value)} />
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
