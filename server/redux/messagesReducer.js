const initialState = [];

const ADD_MESSAGE = 'ADD_MESSAGE'
const DELETE_MESSAGE = 'DELETE_MESSAGE'

const messagesReducer = (state = initialState, action) => {
    switch (action.type) {
    case ADD_MESSAGE:
        return [...state, action.payload ];
    case DELETE_MESSAGE:
        return state.filter((item, index) => item.from !== action.payload.from || item.id !== action.payload.id);
    default:
        return state;
    }
};

module.exports = messagesReducer;