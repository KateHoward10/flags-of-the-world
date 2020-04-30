import React from 'react';

function Question({ time, question, checkGuess, guess, rightAnswer }) {
  const { questionType, wording, options, rightCountry } = question;

  return (
    <>
      <div className="question">
        {time && (
          <div className="time-container">
            <div style={{ height: '5px', width: `${100 - time}%`, background: 'blue' }} />
          </div>
        )}
        {wording && <h3>{wording}</h3>}
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
    </>
  )
}

export default Question;