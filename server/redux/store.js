const { createStore, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;
const messagesReducer = require('./messagesReducer')

const store = createStore(messagesReducer, applyMiddleware(thunk));

module.exports = store;