import io from 'socket.io-client';

const socket = io();

const configureSocket = dispatch => {
  socket.on('connect', () => {
    console.log('connected');
  });
  socket.on('SEND_NAMES_TO_CLIENTS', players => dispatch({ type: 'PUT_ALL_NAMES_TO_REDUCER', players }));
  socket.on('SEND_QUESTION_TO_CLIENTS', question => dispatch({ type: 'PUT_QUESTION_TO_REDUCER', question }));
  socket.on('SEND_NUMBER_TO_CLIENTS', numberOfQuestions =>
    dispatch({ type: 'PUT_NUMBER_TO_REDUCER', numberOfQuestions })
  );
  socket.on('SEND_TOTAL_TO_CLIENTS', questionsAsked => dispatch({ type: 'PUT_TOTAL_TO_REDUCER', questionsAsked }));
  return socket;
};

export const sendNameToServer = player => socket.emit('SEND_NAME_TO_SERVER', player);

export const sendQuestionToServer = question => socket.emit('SET_QUESTION', question);

export const sendNumberToServer = numberOfQuestions => socket.emit('SET_NUMBER', numberOfQuestions);

export const sendTotalToServer = questionsAsked => socket.emit('SET_TOTAL', questionsAsked);

export default configureSocket;
