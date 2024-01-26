import React from 'react';

function Question({ time, question, checkGuess, guess }) {
  const { questionType, wording, options, rightCountry, rightAnswer } = question;

  return (
    <>
      <div className="question">
        {time && (
          <div className="time-container">
            <div style={{ height: '10px', width: `${100 - time}%`, background: 'blue' }} />
          </div>
        )}
        {wording && <h3>{wording}</h3>}
        {questionType === 'flag' && (
          <img src={`https://flagsapi.com/${rightCountry.cca2}/flat/64.png`} alt="Mystery flag" />
        )}
        <div>
          {options &&
            options.map((option, index) => (
              <button
                key={index}
                value={option}
                onClick={checkGuess}
                className={`${
                  guess && option === rightAnswer ? 'correct-answer' : guess === option ? 'wrong-answer' : ''
                } option-button`}
              >
                {questionType === 'cca2' ? (
                  <img src={`https://flagsapi.com/${option}/flat/64.png`} alt="Mystery flag" />
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
