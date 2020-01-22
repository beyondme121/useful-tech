import { combineReducer } from './lib/index'

import {
  INCREMENT,
  DECREMENT
} from './action-types'



function count(state = 1, action) {
  switch (action.type) {
    case INCREMENT:
      return state + action.data;
      break;
    case DECREMENT:
      return state - action.data
      break;
    default:
      return state
  }
}

function user(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

export default combineReducer({
  count,
  user
})