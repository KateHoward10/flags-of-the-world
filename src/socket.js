import io from 'socket.io-client';

const socket = io();

const configureSocket = dispatch => {
  socket.on('connect', () => {
    console.log('connected');
  });
  socket.on('SEND_NAMES_TO_CLIENTS', players => dispatch({ type: 'PUT_ALL_NAMES_TO_REDUCER', players }));
  socket.on('SEND_QUESTION_TO_CLIENTS', question => dispatch({ type: 'PUT_QUESTION_TO_REDUCER', question }));
  return socket;
};

export const sendNameToServer = player => socket.emit('SEND_NAME_TO_SERVER', player);

export const sendQuestionToServer = question => socket.emit('SET_QUESTION', question);

export default configureSocket;
