import React, { Component } from 'react'
import { connect } from '../lib/react-redux'
import { increment } from '../redux-use-case/actions'
class Counter extends Component {

  handleClick = () => {
    this.props.increment()
  }

  render() {
    return (
      <div>
        test: {this.props.count}
        <button onClick={this.handleClick}>加1</button>
      </div>
    )
  }
}

const mapStateToProps = state => ({ count: state.count })

// 函数类型
// const mapDispatchToProps = dispatch => ({
//   increment: () => dispatch(increment())
// })

// 对象类型
const mapDispatchToProps = { increment }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter)
