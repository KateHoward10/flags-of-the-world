const reducer = (
  state = {
    name: null,
    names: []
  },
  action
) => {
  switch (action.type) {
    case 'SET_USERNAME':
      state = { ...state, name: action.name };
      break;
    case 'PUT_ALL_NAMES_TO_REDUCER':
      state = { ...state, names: action.names };
      break;
    default:
      break;
  }

  return state;
};

export default reducer;
