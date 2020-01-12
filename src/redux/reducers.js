// import { combineReducers } from 'redux'
import { INCREMENT } from './action-types'

export default function counter(state = 1, action) {
  console.log('init reducer, ', state, action)
  switch (action.type) {
    case INCREMENT:
      return state + 1
    default:
      return state;
  }
}

