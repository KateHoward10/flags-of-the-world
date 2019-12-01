const reducer = (
  state = {
    name: null,
    players: []
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
    default:
      break;
  }

  return state;
};

export default reducer;
