import io from 'socket.io-client';

const socket = io('http://localhost:8000');

const configureSocket = dispatch => {
  socket.on('connect', () => {
    console.log('connected');
  });
  socket.on('SEND_NAMES_TO_CLIENTS', players => dispatch({ type: 'PUT_ALL_NAMES_TO_REDUCER', players }));
  return socket;
};

export const sendNameToServer = name => socket.emit('SEND_NAME_TO_SERVER', name);

export default configureSocket;
