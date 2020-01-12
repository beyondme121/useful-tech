import qs from 'qs'

let baseURL = ''
let baseUrlArr = [
  {
    type: 'development',
    url: 'http://localhost:3000/api'
  },
  {
    type: 'test',
    url: 'http://localhost:4000/api'
  }
]
baseUrlArr.forEach(item => {
  if (process.env.NODE_ENV === item.type) {
    baseURL = item.url
  }
})

export default function request(url, options = {}) {
  url = baseURL + url
  /**
   * GET系列请求的处理
   */
  // 如果配置参数没有请求方式(method),默认给GET请求方式, 如果有options.method,就给null,表示什么也不错, 就使用options中的method
  !options.method ? options.method = 'GET' : null

  // 处理请求配置对象中有params参数的(如GET请求)希望通过以?拼接参数的形式传递给server
  if (options.hasOwnProperty('params')) {
    if (/^(GET|DELETE|HEAD|OPTIONS)$/i.test(options.method)) {
      // 如果url中包含?,即GET请求包含了问号传参的形式, 定义一个变量设置为&
      const ask = url.includes('?') ? '&' : '?'
      url += `${ask}${qs.stringify(params)}`
    }
    // params不是fetch天生自带的有效参数,需要移除, fetch不支持params参数,前端请求自定义要加上params,使用完要删除
    delete options.params
  }

  // 合并配置项
  options = Object.assign({
    // 允许跨域携带资源凭证 same-origin同源可以 omit都拒绝
    credentials: 'include', // 同源跨域都可以
    // 设置请求头
    headers: {}
  }, options)
  options.headers.Accept = 'application/json'  // 不加也可以

  // token的校验
  const token = localStorage.getItem('token')
  token && (options.headers.Authorization = token)

  // POST请求的处理
  if (/^(POST|PUT)$/i.test(options.method)) {
    !options.type ? options.type = 'urlencoded' : null
    if (options.type === 'urlencoded') {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.body = qs.stringify(options.body)
    }
    if (options.type === 'json') {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(options.body)
    }
  }
  // fetch:只要返回了,都认为是成功
  return fetch(url, options).then(response => {
    // 返回的结果可能是 非200的状态码, 不符合2,3开头的
    if (!/^(2|3)\d{2}$/.test(response.status)) {
      switch (response.status) {
        case 401: // 当前请求需要用户验证(一般是未登录)
          // 此处可以跳转路由,弹出蒙层Modal提示未登录
          break;
        case 403: // 服务器应景理解请求 但是拒绝执行它(一般是TOKEN过期，session过期等)
          localStorage.removeItem('token')
          // 跳转到登录页
          break
        case 404:
          break;
        default:
          break;
      }
    }
    return response.json()
  }).catch(err => {
    if (!window.navigator.onLine) {
      return
    }
    return Promise.reject(err)
  })

}