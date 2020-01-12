import React from 'react';
import './App.css';

import { increment } from './redux/actions'

console.log("---------------", process.env.NODE_ENV)
console.log("---------------", process.env.env)

function App(props) {

  const count = props.store.getState()

  const hanleClick = () => {
    props.store.dispatch(increment())
    console.log(props.store.getState())
  }

  return (
    <div>
      <div>hello, {count}</div>
      <button onClick={hanleClick}>增加</button>
    </div>
  );
}

export default App;
