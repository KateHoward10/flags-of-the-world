import { socket } from './index';

const reducer = (
  state = {
    name: null,
    players: [],
    question: {}
  },
  action
) => {
  switch (action.type) {
    case 'SET_USERNAME':
      state = { ...state, name: action.name };
      break;
    case 'PUT_ALL_NAMES_TO_REDUCER':
      state = { ...state, players: action.players };
      break;
    case 'PUT_QUESTION_TO_REDUCER':
      state = { ...state, question: action.question };
      socket && socket.emit('SET_QUESTION', state.question);
      break;
    default:
      break;
  }

  return state;
};

export default reducer;
