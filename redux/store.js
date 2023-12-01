const { createStore, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;
const {messagesReducer} = require('./messagesReducer')

const store = createStore(messagesReducer, applyMiddleware(thunk));

store.subscribe(() => {
    store.getState()
});

module.exports = store;