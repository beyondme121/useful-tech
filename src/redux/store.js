import { createStore } from "../lib/redux/index";

// 引入combine之后的reducers
import reducers from './reducers'

export default createStore(reducers)

