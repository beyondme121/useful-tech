import { combineReducer } from './lib/index'

import {
  INCREMENT,
  DECREMENT
} from './action-types'



function count(state = 1, action) {
  console.log('reducer count call,', state, action)
  switch (action.type) {
    case INCREMENT:
      return state + 1
    case DECREMENT:
      return state - 1
    default:
      return state
  }
}

function user(state = {}, action) {
  console.log('user(),', state, action)
  switch (action.type) {
    default:
      return state
  }
}

export default combineReducer({
  count,
  user
})