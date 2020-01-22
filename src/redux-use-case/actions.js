import { INCREMENT, DECREMENT } from './action-types'
// action-creators

export const increment = (num) => ({ type: INCREMENT, data: num })
export const decrement = (num) => ({ type: DECREMENT, data: num })