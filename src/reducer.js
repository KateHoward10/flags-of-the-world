import { socket } from './index';

const reducer = (
  state = {
    score: 0,
    players: [],
    question: {}
  },
  action
) => {
  switch (action.type) {
    case 'INCREASE_SCORE':
      state = {
        ...state,
        score: state.score + 1,
        players: state.players.map(player => {
          if (player.name === action.name) {
            return { ...player, score: player.score + 1 };
          } else return player;
        })
      };
      socket && socket.emit('UPDATE_PLAYERS', state.players);
      break;
    case 'PUT_ALL_NAMES_TO_REDUCER':
      state = { ...state, players: action.players };
      break;
    case 'PUT_QUESTION_TO_REDUCER':
      state = { ...state, question: action.question };
      break;
    default:
      break;
  }

  return state;
};

export default reducer;
