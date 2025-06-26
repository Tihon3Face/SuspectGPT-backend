// const fs = require('fs');


  
// function loadState() {
//     try {
//         const serializedState = fs.readFileSync('state.json', 'utf8');
//             if (serializedState === '') {
//             return undefined;
//         }
//         return JSON.parse(serializedState);
//     } catch (err) {
//         console.log(err)
//         return undefined;
//     }
// }

// function saveState(state) {
//     try {
//         const serializedState = JSON.stringify(state);
//         fs.writeFileSync('state.json', serializedState, 'utf8');
//     } catch (err) {
//         console.error('Error saving state:', err);
//     }
// }

const initialState = []

const ADD_MESSAGE = 'ADD_MESSAGE'
const DELETE_MESSAGE = 'DELETE_MESSAGE'
const COMMIT_REP = 'COMMIT_REP'

const messagesReducer = (state = initialState, action) => {
    switch (action.type) {
    case ADD_MESSAGE:
        return [...state, action.payload ];
    case DELETE_MESSAGE:
        return state.filter((item, index) => `${item.id}` !== `${action.payload.id}` || `${item.from}` !== `${action.payload.from}`);
    case COMMIT_REP:
        return state.map(item => {
            console.log(JSON.stringify(item) === JSON.stringify(action.payload.mes))
            if(JSON.stringify(item) === JSON.stringify(action.payload.mes)){
                if(action.payload.rep){
                    return action.payload.def === 'likes' ? {...item, likes: item.likes + 1} : {...item, dislikes: item.dislikes + 1}
                }else{
                    return action.payload.def === 'likes' ? {...item, likes: item.likes - 1} : {...item, dislikes: item.dislikes - 1}
                }
            }else{
                return item
            }
        })
    default:
        return state;
    }
};

module.exports = {
    messagesReducer
};