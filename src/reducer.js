import { socket } from './index';

const reducer = (
  state = {
    players: [],
    question: {},
    numberOfQuestions: 10,
    questionsAsked: 0
  },
  action
) => {
  switch (action.type) {
    case 'INCREASE_SCORE':
      state = {
        ...state,
        players: state.players.map(player => {
          if (player.name === action.name) {
            return { ...player, score: player.score + 1 };
          } else return player;
        })
      };
      socket && socket.emit('UPDATE_PLAYERS', state.players);
      break;
    case 'RESET_SCORES':
      state = {
        ...state,
        players: state.players.map(player => {
          return { ...player, score: 0 };
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
    case 'PUT_NUMBER_TO_REDUCER':
      state = { ...state, numberOfQuestions: action.numberOfQuestions };
      break;
    case 'PUT_TOTAL_TO_REDUCER':
      state = { ...state, questionsAsked: action.questionsAsked };
      break;
    default:
      break;
  }

  return state;
};

export default reducer;
