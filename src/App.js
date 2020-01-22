import React from 'react';
import './App.css';
// import { increment } from './redux-use-case/actions'

import A from './pages/nested'
import Counter from './pages/counter'
import LifeCycleDidUpdate from './pages/propsChangeUpdate'

function App(props) {

  // const count = props.store.getState().count

  // const hanleClick = () => {
  //   props.store.dispatch(increment())
  //   console.log(props.store.getState().count)
  // }

  return (
    <div>
      <A />
      <Counter />
      <LifeCycleDidUpdate />
    </div>
  );
}

export default App;
