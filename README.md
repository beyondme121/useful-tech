### 1. axios 第二次封装

#### 1. 封装前最原始的写法

```js
// get
axios
  .get(url, {
    params: {
      searchText: ""
    }
  })
  .then(resp => {})
  .catch(err => {});

// post
axios
  .post(url, {
    username: "",
    password: ""
  })
  .then(resp => {})
  .catch(err => {});
```

#### 2. 封装 url 地址

1. 每次请求都会请求一个 url 地址, 比如 http://127.0.0.1:port/api/xxx, 没请求一个后端接口,都要写这样长的地址
2. 公司开发会区分开发环境(调用本地接口)，生产环境(真实服务器上的接口), 测试环境。我们会根据一些特殊的变量如环境变量进行区分,或者做一些处理
3. 如果服务端采用的 cors 这种方式(跨域资源共享)，一般我们要允许客户端向服务端发请求携带资源凭证，比如携带 cookie，要不然跨域怎么携带 cookie 过去，不能每次发请求都单独写一遍携带 cookie(这也是重新封装 axios 的作用,需要提前做一些处理)
4. POST 请求是通过请求主体发送给 server 的, 一般的公司的服务器都有对 post 接收 body 有一定的要求, 比如 json 格式，或者是 url-encoded
5. 如果请求出现错误，统一处理错误反馈
6. 当从服务器请求返回结果后,返回结果可能会有成功和失败的可能，失败也会有很多失败的情况
7. 发请求断网了,错误处理等问题
8. 对于接口请求的公共的处理的部分进行处理. 这才是封装的初衷

#### 3. axios域fetch的封装

1. axios 的全局配置项, 根据环境变量判断使用 axios 的配置项

```js
// 根据环境变量区分接口的默认地址
switch (process.env.NODE_ENV) {
  case "production":
    axios.defaults.baseURL = "http://api.landrich.cn:3000";
    break;
  case "test":
    axios.defaults.baseURL = "http://localhost:3000/api";
    break;
  case "development":
    axios.defaults.baseURL = "http://localhost:4000/api";
    break;
  default:
    axios.defaults.baseURL = "http://localhost:5000/api";
}
```

2. 设置超时时间和跨域是否允许携带凭证

```js
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
```

3. 约定后端服务器可以接受的数据的格式

```js
/**
 * 很多后台服务器一般接收请求数据的格式是x-www-form-urlencoded格式
 * 后端约定请求(GET,POST)数据的格式,一般GET是url-encoded,POST如果是别的格式进行转换为服务器可以识别的格式
 * 转换后的格式是: username=zhangsan&password=123
 */
// 处理GET请求数据的格式
axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";

// 处理POST请求数据的格式, data是客户端发送请求的数据 请求主体body
axios.defaults.transformRequest = data => {
  return qs.stringify(data);
};
```

4. 扩展 qs 包

```js
// 将字符串username=zhangsan&password=123转换为对象{username: xxx, password: xxx}
qs.stringify(data);
```

5. JSON 的两个方法

```js
// 将JSON对象转换为json字符串
const jsonstr = JSON.stringify(data);
// 将json格式字符串转换为json对象
const jsonObj = JSON.parse(jsonstring);
```

6. 设置请求拦截器



7. 基于axios的封装

```js
import axios from 'axios'
import qs from 'qs'

// 根据环境变量区分接口的默认地址
switch (process.env.NODE_ENV) {
  case "production":
    axios.defaults.baseURL = 'http://api.landrich.cn:3000'
    break;
  case "test":
    axios.defaults.baseURL = 'http://localhost:3000/api'
    break;
  case "development":
    axios.defaults.baseURL = 'http://localhost:4000/api'
    break;
  default:
    axios.defaults.baseURL = 'http://localhost:5000/api'
}

// 设置超时时间和跨域是否允许携带凭证
axios.defaults.timeout = 10000
axios.defaults.withCredentials = true

/**
 * 很多后台服务器一般接收请求数据的格式是x-www-form-urlencoded格式
 * 后端约定请求(GET,POST)数据的格式,一般GET是url-encoded,POST如果是别的格式进行转换为服务器可以识别的格式
 * 转换后的格式是: username=zhangsan&password=123
 */
// 处理GET请求数据的格式
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'

// 处理POST请求数据的格式, data是客户端发送请求的数据 请求主体body
axios.defaults.transformRequest = data => {
  return qs.stringify(data)
}

/**
 * 设置请求拦截器
 * 1. 一般的接口请求中, 都会进行token校验
 * TOKEN校验(JWT): 接受服务器返回的token,存储到redux/vuex/本地存储
 * 每次向服务器发请求,都要把token带上,不带上都认为是非法访问, token的记录时间要看服务器设置 30分钟
 * 可能返回401(没有token), 过期可能返回403
 */
axios.interceptors.request.use(config => {
  // 携带token
  let token = localStorage.getItem('token')
  token && (config.headers.Authorization = token)
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 影响拦截器
 * 服务端返回信息 -> [拦截的统一处理] -> 客户端JS获取到信息
 * 1. 什么情况下默认就是error呢? 默认服务端返回的状态码是2开头的,3也可以(缓存,协商缓存)
 */

// 很多公司不进行配置, 少数公司才在接口返回中设置3xx的状态码, 
// axios.defaults.validateStatus = status => {
//   // 自定义响应成功的HTTP状态码
//   return /^(2|3)\d{2}$/.test(status)
// }

// 默认情况下,状态码以2开头的才会执行第一个回调函数
// 3开头一般要么是永久重定向,要么就是临时重定向(304协商缓存),如果进行了上面的配置,那么状态码2或者3开头的都走第一个callback
// 一般是资源文件(css等静态资源文件)返回304协商缓存,一般请求接口都是2开头
axios.interceptors.response.use(response => {
  // 只返回响应主体中的信息(部分公司根据需求会进一步完善, 例如指定服务器返回的code值来指定成功还是失败)
  return response.data
}, error => {
  let { response } = error
  if (response) {
    // 服务器最起码返回了结果
    // 请求已发送 只不过状态码不是200系列，设置不同状态码的不同处理
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
  } else {
    // 服务器连结果都没有返回 1. 服务器崩了 2. 客户端断网
    if (!window.navigator.onLine) {
      // 断开网络了，可以让其跳转到断网页面(自己开发的页面)
      return
    }
    return Promise.reject(error)
  }
})

export default axios
```



8. 基于fetch的封装

```js
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
```

9. 前端api接口的基本套路模式

- 封装axios的统一模块, 处理GET的请求体，POST响应结果返回，拦截器(请求拦截, 响应拦截[状态码])
- 一个api的统一出口, 所有请求接口方法的出口, 各个业务域
- 根据不同业务域,分模块创建js文件, 请求接口方法并导出

> http.js: axios的封装
>
> api.js:统一出口
>
> personal.js: 用户域
>
> vote.js: 投票业务域
>
> ...

api.js

```js
/**
 * 这里定义数据请求的唯一入口
 */

import personal from './personal'
import vote from './vote'

export default {
  personal,
  vote
}
```

personal.js

```js
import axios from './http'

function login() {
  return axios.post('/login')
}

export default {
  login
}
```

vote.js

```js
import axios from './http'

function voteAdd() {
  return axios.post('/insertVote', {
    xxx: 'xxx'
  })
}

export default {
  voteAdd
}
```



### 2. 跨域(非同源策略请求)

#### 1. 跨域问题的产生极其价值意义

#### 2. JSONP跨域解决方案的底层原理

#### 3. CORS跨域资源共享

#### 4. 基于http proxy实现跨域请求

#### 5. 基于post message实现跨域处理

#### 6. 基于iframe的跨域解决方案

​	window.name / document.domain /location.hash

#### 7. web socket 和 nginx反向代理



- 同源策略请求 ajax/fetch
- 跨域传输

- 历史
  1. 2013年以前, 前端html/css，把开发好的静态页面发给后端,后端整合,入JSP,PHP代码
  2. 2013以后, 出现了异步无刷新操作 -> **ajax**, GMail, GMap
  3. 前后端代码部署在同一个服务器上, 同一个协议，域名，端口号
  4. 最初采用修改本地的hosts文件, 将本地的ip地址映射为生产环境的请求地址, 达到模拟同源的效果，等代码上线时，依然将代码部署到同一个服务器上

- 为什么会出现跨域策略? 为了保证整个项目的性能优化，保证服务器的负载均衡，保证服务器中每个资源真正使用的对应的内存大小，保证服务器的高负荷运作，进行服务器拆分!

  - Web服务器: 静态资源  	kbs.sports.qq.com
  - Data服务器: 业务逻辑和数据分析	api.sports.qq.com
  - 图片服务器: 视频等

- 判断跨域(三者必须一致，否则就是跨域)

  - 协议

  - 域名

  - 端口号

    如下就是端口号不一致产生了跨域请求

    web服务器地址: http://127.0.0.1:3000/index.html

    数据接口地址: http://127.0.0.1:4000/list

    一些大公司敞开的可以公共访问的api接口，也是跨域的

#### 8. 跨域的解决方案

如下标签有公共的特点：不存在跨域请求的限制

- script
- img
- link
- iframe

##### 1. JSONP

1. 客户端与服务器是基于json的数据格式传输的, server返回的也是json

2. 举个例子:我们使用cdn jquery, 直接请求的其他服务器的地址, 本地的开发的服务器是127.0.0.1,肯定是跨域了，但是是可以请求到的，这就说明了，script标签请求资源不存在跨域的限制

<script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
3. JSONP就是利用了script标签实现跨域请求

4. **实现原理**
   
   1. 向服务器发请求,同时会把本地的一个函数传递给服务器(比如百度api)
   
      ```js
      <script src="http://api.baidu.com/list?callback=func"></script>
      // 本地定义的func
      function func () {
          // ...
      }
      ```
   
   2. 服务器接收客户端的请求, 也能拿到callback传过来的func，服务器要做如下工作
   
      1. 准备数据  data = {...}
   
      2. 给客户端返回数据，使用客户端的callback函数func，将服务端返回的data对象，**转换为json格式的字符串**，再拼接func函数
   
         ```js
         // 给客户端返回的数据格式
         'func('+ JSON.stringify(data) +')'
         ```
   
      3. 返回给客户端上面的字符串，浏览器接收到发现，特别像js函数，然后把这段字符串转换为**js表达式**，然后进行执行，就执行了全局的func这个函数，函数中包含了从服务端传过来的data数据
   
      4. func这个函数必须是一个全局函数，如果func是局部函数，就浏览器就无法调用或者找不到这个函数也就无法调用func
   
      5. 如果服务器不接收客户端的callback，也没有给客户端返回的数据进行特殊处理(JSON.stringify(data)), 所以JSONP必须要有服务器端的支持
   
5. 代码实现

- 客户端 jsonp.js

```js
// jquery的ajax发起的ajax的 "同源" 异步请求, 加上dataType: 'jsonp'就是发起跨域的jsonp请求
$.ajax({
  url: 'http://127.0.0.1:8001/list',
  method: 'get',
  dataType: 'jsonp',         // 执行的是JSONP请求
  success: res => {
    console.log(res)
  }
})
```

- JSONP必须要有服务端的支持, 接收callback,返回带有data的处理过的JSON.stringify后的字符串

```js
// server.js
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  const { callback } = ctx.query
  const data = {
    code: 0,
    message: 'hello world'
  }
  ctx.body = `${callback}(${JSON.stringify(data)})`
})

app.listen(8001, () => {
  console.log('server start...')
})
```

- html文件引入 发起jsonp请求的函数

```html
<script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
<script src="./01.jsonp.js"></script>
```

- 结果

> 请求头

```
Request URL: http://127.0.0.1:8001/list?callback=jQuery34109731423264437289_1578901919009&_=1578901919010
```

以上是客户端向server 发起jsonp请求, 其中

1. jQuery34109731423264437289_1578901919009是jquery自动生成的随机的全局的函数
2. &后面的_=1578901919010是jquery为了清除GET缓存给我们加上的随机数

> 响应体 服务端返回给客户端的内容

1. 服务端携带者客户端发给服务器的函数 + resp data 给客户端
2. server端执行这个字符串，转换为表达式并执行

```js
jQuery34109731423264437289_1578901919009({"code":0,"message":"hello world"})
```

3. 控制台输出结果

   {code: 0, message: "hello world"}

- 总结

1. jquery帮我们自动创建了一个全局的callback函数(jQuery34109731423264437289_1578901919009)
2. 服务器response返回callback(JSON.stringify(data))字符串的形式
3. 浏览器接收到这个字符串并执行, 其实代码中并没有定义这个函数jQuery34109731423264437289_1578901919009，jquery发现返回了这个函数，就会执行success定义的回调函数
4. 所以, jquery帮我们做了如下事情
   1. 创建script标签
   2. 创建一个随机函数
   3. 默认执行服务端返回的函数字符串，并将数据复制给success对应的函数的参数res

- 哪些前端技术使用了JSONP原理

  React组件之间的数据交互

  1. 父子组件通过属性传值(子传父就使用了JSONP的原理)
     1. 子组件想修改父组件的数据，把父组件的一个方法，通过回调函数传递给子组件，子组件拿到父组件传递的方法，并执行

- JSONP的问题
  - 只能处理GET请求, 因为JSONP都是通过script，img等标签的src发起的请求，都是GET请求
  - 不支持POST, PUT请求
  - 不安全性
    - GET请求：通过?callback=xxx的方式, 别人就有可能劫持, 把数据拿到, 造成数据的不安全
    - 别人可能拦截响应，改了执行的函数。如果黑客服务器给你返回了一段执行木马的程序，用户的浏览器一执行

##### 2. CORS跨域资源共享

也需要服务器的支持，基于CORS后端需要在中间件里编写响应头内容

通过设置响应头

1. 允许哪个源可以向服务器进行跨域传输
2. 是否允许跨域携带cookie
3. 允许哪些请求头
4. 允许哪些请求方式methods

> 配置文件config.js

```js
module.exports = {
    PORT: 5000,
    CROS: {
        ALLOW_ORIGIN: 'http://localhost:8080',
        ALLOW_METHODS: 'PUT,POST,GET,DELETE,OPTIONS,HEAD',
        HEADERS: 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With',
        CREDENTIALS: true
    },
    SESSION: {
        secret: 'ZFPX',
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30
        }
    }
}
```



```js
// 基于Express
app.use((req, res, next) => {
    const {
        ALLOW_ORIGIN,
        CREDENTIALS,
        HEADERS,
        ALLOW_METHODS
    } = CONFIG.CROS
    res.header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
    res.header("Access-Control-Allow-Credentials", CREDENTIALS)
    res.header("Access-Control-Allow-Headers", HEADERS)
    res.header("Access-Control-Allow-Methods", ALLOW_METHODS)
    // 每次跨域请求之前都会有一步试探请求OPTIONS请求方式
    req.method === 'OPTIONS' ? res.send('Current Services support cross domain Request')
})
```

- 需要做哪些事
  - 客户端发送ajax/fetch请求
  - 服务端设置相关的响应头信息(需要处理options试探性请求)

- 举例1

> 客户端: 做一些默认的配置

```js
axios.defaults.baseURL = 'http://localhost:5000'		// 后端请求地址
axios.defaults.withCredentials = true
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'

axios.defaults.transformRequest = data => {
    if (!data) return data
    let result = ``
    for (let attr in data) {
        if (!data.hasOwnProperty(attr)) break
        result += `&${attr}=${data[attr]}`
    }
    return result.substring(1)
}

axios.interceptors.response.use(function onFulfilled(response) {
    return response.data
}, function onRejected(reason) {
    return Promise.reject(reason)
})

axios.defaults.validateStatus = function (status) {
    return /^(2|3)\d{2}$/.test(status)
}
```



> 客户端的实际请求
>
> 使用http-server起一个http服务, 直接访问http://localhost:8080/axios.html

```html
<script src="https://cdn.bootcss.com/axios/0.19.0-beta.1/axios.min.js"></script>
<script>
    axios.get('http://localhost:5000/api/list').then(res => {
      console.log(res.data)
    })
</script>
```



> 服务端: 设置headers

express写法

```js
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000")
    res.header("Access-Control-Allow-Credentials", true)
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,HEAD,OPTIONS")
    // 每次跨域请求之前都会有一步试探请求OPTIONS请求方式
    req.method === 'OPTIONS' ? res.send('Current Services support cross domain Request')
})
```

koa写法

```js
const Koa = require('koa')
const app = new Koa()
app.use(async (ctx, next) => {
  // 只允许http://localhost:8080这个域访问后端接口
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  ctx.set("Access-Control-Allow-Credentials", true)
  ctx.set("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With")
  ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,HEAD,OPTIONS")
  // 每次跨域请求之前都会有一步试探请求OPTIONS请求方式
  if (ctx.method === 'OPTIONS') {
    console.log('Current Services support cross domain Request')
    ctx.body = 'Current Services support cross domain Request'
  }
  await next()
})
app.use(async ctx => {
  ctx.body = {
    data: {
      username: 'sanfeng',
      password: '123456'
    }
  }
})
// 后端启动的是5000端口,没有跨域的配置, 前后端的端口号不一致(前端8080,后端5000)就会跨域
app.listen(5000, () => {
  console.log('server start at port 5000')
})
```



- CORS的不好的地方

  - Access-Control-Allow-Origin的值可以有两种写法
    - res.header("Access-Control-Allow-Origin", "*")
    - res.header("Access-Control-Allow-Origin", "一个具体的地址,只能是一个")

  - *的弊端
    -  **所有的源都可以访问server, 不安全**
    - 就不能再允许携带cookie了(在允许多源请求的时候不安全，因为浏览器为了保证安全, 做的限制)

##### 3. HTTP Proxy

> 一般是配合webpack 和 webpack-dev-server来实现的

- webpack.config.js

```json
// 关键代码
devServer: {
    port: 3000,		// 前端访问端口
    progress: true,	// 是否显示内存中webpack打包进度
    contentBase: './build', // 打包之后的目录
    // http proxy代理
    proxy: {
        '/': {
            target: 'http://localhost:5000', // 后端地址
            changeOrigin: true
        }
    }
}
```

> 关键解释:
>
> 1. 当前端访问的地址包含了"/", node开发的代理中间件会将请求的地址"/" 转发到http://localhost:5000
>
> 2. 允许切换源,即允许跨域请求
>
> 3. vue代码中的webpack配置就是这样
>
> 4. 现代的项目都是基于vue react开发的，两个框架都是基于webpack的
>
> 5. 对于前后端都方便,后端也没有做处理,前端也没有做额外的处理,只是在webpack中配置代理即可
>
> 6. 除了在后端设置黑名单，哪些域名+端口不能访问, 其他都可以实现跨域访问
>
> 7. 可以实现多个域，而CORS也可以但是必须制定*，却不安全
>
> 8. 如果在生产环境, 使用node写一个中间层实现代理参考
>
>    https://www.cnblogs.com/shaohsiung/p/9609343.html, 
>
>    https://blog.csdn.net/lihefei_coder/article/details/100034646

基于node实现的反向代理中间件

node原生的使用这个模块http-proxy

koa使用 koa2-proxy-middleware

```js
const Koa = require('koa');
const app = new Koa();

/* 代理配置 start */
const proxy = require('koa2-proxy-middleware'); //引入代理模块
const proxyOptions = {
    target: 'http://127.0.0.1:9999', //后端服务器地址
    changeOrigin: true //处理跨域
};
const exampleProxy = proxy('/api/*', proxyOptions); //api前缀的请求都走代理
app.use(exampleProxy); //注册
/* 代理配置 end */

app.use(async ctx => {
    ctx.type = 'html';
    ctx.body = 
    `<!DOCTYPE html>
	<html lang="en">
	    <head>
	        <meta charset="UTF-8" />
	        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
	        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
	        <title>Document</title>
	    </head>
	    <body>
	        <button id="btn1">请求服务器接口1</button>
	        <button id="btn2">请求服务器接口2</button>
	        <script src="https://cdn.bootcss.com/axios/0.19.0/axios.min.js"></script>
	        <script>
	            document.getElementById('btn1').addEventListener(
	                'click',
	                () => {
	                    axios.get('/api/hello', {
	                        params: {
	                            key: 'hello'
	                        }
	                    });
	                },
	                false
	            );
	
	            document.getElementById('btn2').addEventListener(
	                'click',
	                () => {
	                    axios.get('/api/word', {
	                        params: {
	                            key: 'word'
	                        }
	                    });
	                },
	                false
	            );
	        </script>
	    </body>
	</html>`;
});
const hostName = '127.0.0.1'; //本地IP
const port = 8888; //端口
app.listen(port, hostName, () => {
    console.log(`服务运行在http://${hostName}:${port}`);
});
console.log('服务启动成功');
```



##### 4. nginx反向代理

从这个源www.zhufengpeixun.cn(前端) 向这个源请求 www.zhufengpeixun.com(后端)

```json
// nginx服务器配置, nginx.config的配置
server {
    listen: 80;
    server_name: www.zhufengpeixun.com;	#后端请求地址
    location / {
    	proxy_pass	www.zhufengpeixun.cn;	#反向代理 前端地址
    	proxy_cookie_demo www.zhufengpeixun.cn www.zhufengpeixun.com;
    	# 以下就就类似CORS的原理配置, 后端增加影响头
    	add_header 	Access-Control-Allow-Origin	www.zhufengpeixun.cn;
    	add_header	Access-Control-Allow-Credentials	true;
	}
}
```

优点: 不需要前端做任何事,只需要nginx配置即可, 后端代码也不需要像CORS写响应头



##### 5. postMessage

window.postMessage,实现两个页面的通信, 两个页面分别部署在不同的域下

基于HTML5的API

比如3000和4000端口, 基于iframe.onload=function(){...}



##### 6. socket.io实现跨域

实时通讯，客户端与服务器端是基于websocket完成的通信

> 客户端

```js
<script src="./socket.io.js"></script>
<script>
    let socket = io('http://127.0.0.1:5000')	// 向服务器端发请求的地址
    // 连接成功
    socket.on('connect', function () {
        // 监听服务器端消息
        socket.on('message', function (msg) {
            console.log('data from server: ', msg) // msg就是hello world$$$$
        })
        // 监听服务端关闭
        socket.on('disconnect', () => {
            console.log('server socket has closed')
        })
    })
    // 发送消息给服务端
    socket.send('hello world')
</script>
```

> 服务器端处理

```js
// 监听socket连接 server是服务器创建的服务
socket.listen(server).on('connection', client => {
    // 接收消息
    client.on('message', msg => {
        // msg是客户端传递的消息
        client.send(msg + '$$$$')
    })
    // 断开处理
    client.on('disconnect', () => {
        console.log('client socket has closed!')
    })
})
```



### 3. 自定义Redux库

#### 3.1. 语法功能分析

- redux库向外暴露下面几个函数

```
createStore(): 接收的参数是reducer函数, 返回的是store对象，对象包含了几个函数类型的属性
combineReducer():接收包含n个reducer方法的对象,返回一个新的reducer函数
applyMiddleware(): 可扩展的中间件,异步请求
```

- store对象的内部结构

```
getState(): 返回值为内部保存的state数据
dispatch(): 参数为action对象,执行触发reducer的调用,就会产生新的状态,就会通知所有已经订阅好的监听
subscribe(): 参数为监听内部state更新的回调函数, 可以调用多次，可以绑定多个监听，监听是函数
```



#### 3.2 createStore实现

> redux的核心: 暴露三个函数, 生成一个store对象

- 核心功能

> 接收一个reducer函数, 返回一个store对象, store对象包含了三个方法,分别用于
>
> 1. 获取状态getState()
> 2. 派发事件实现reducer的调用,进而更新state
> 3. state更新的监听订阅容器

- 参数分析

reducer: 通常项目都是很多个reducer的组合, 是个函数

- 返回值分析

返回一个store对象 {}, 包含了几个方法

- 思路

1. 初始化store, 并初始化state状态
2. 保存因为状态更新需要调用的监听函数
3. dispatch函数触发reducer的执行, 保存新的状态, 调用监听函数容器

```js
// lib/index.js

export function createStore (reducer) {
    
    let state = reducer(undefined, {type: '@@redux/init'})
    let listeners = []
    
    function getState () {
        return state
    }
    
    // 执行reducer,更新状态,保存状态,调用监听容器的回调函数
    function dispatch (action) {
        let newState = reducer(state, action)
        state = newState
        listeners.forEach(listener => listener())
    }
    
    function subscribe (listener) {
        listeners.push(listener)
    }
    
	return {
        getState,
        dispatch,
        describe
    }    
}



```

- 再写一遍

```js

// 接收reducer组合(多个reducer),返回store对象
export function createStore(reducer) {

  // 执行createStore就会初始化state数据
  // 用来存储内部状态数据的变量, 初始值为调用reducer函数返回的结果(外部指定的默认值)
  let state = reducer(undefined, { type: '@@redux/init' })

  // 用来存储监听state更新的回调函数的数组容器
  const listeners = []

  function getState() {
    return state
  }

  function dispatch(action) {
    let newState = reducer(state, action)
    state = newState
    listeners.forEach(listener => listener())
  }

  // 参数为监听内部state更新的回调函数, 可以调用多次，可以绑定多个监听，监听是函数
  function subscribe(listener) {
    // 保存到缓存listener容器数组中
    listeners.push(listener)
  }

  return {
    getState,
    dispatch,
    subscribe
  }
}
```



#### 3.3 combineReducer实现

- 核心功能

> **接收一个对象,包含多个reducer函数,返回一个新的reducer函数, 调用新的reducer函数返回的是总的state状态数据**



- 参数结构分析

params: reducers, 由多个reducer函数组成的key-value

```
reducers的结构:
{
    count: (state = 2, action) => newState,
    user: (state = {}, action) => {}
}
```

- 返回值结构分析

1. 返回一个新的reducer函数

```js
// 1. 返回新的reducer函数(作用:根据老的state以及action操作指令, 生成并返回新的state)
return (state, action) => {
    return newState = ...
}
```

2. 新的reducer函数返回总的状态state数据

```
// 总的状态数据, 通过执行相对应的reducer函数返回的state赋值给reducer名作为属性
{
	count: count(state.count, action),
	user: user(state.user, action)
}
```



- 编码思路
  1. 接收所有reducer组合成的对象
  2. 返回新的reducer函数, 接收初始的state和action
  3. 新的reducer函数中, 要返回总的状态state数据, 就必须调用每一个reducer函数, 得到一个新的子状态(每个reducer函数生成的), 并添加到一个对象容器



- forEach版本

```js
function combineReducer(reducers) {
  return (state = {}, action) => {
    let totalState = {}
    Object.keys(reducers).forEach(key => {
      totalState[key] = reducers[key](state[key], action)
    })
    return totalState
  }
}
```



- reducer版本

```js
export function combineReducer(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((totalState, key) => {
      totalState[key] = reducers[key](state[key], action)
      return totalState
    }, {})
  }
}
```



### 4. 自定义react-redux

#### 4.1 react-redux向外暴露了2个API

1. Provider组件
2. connect函数

#### 4.2 Provider组件

接收store属性

让所有容器组件都可以看到store, 从而通过store读取/更新状态



#### 4.3 connect函数

接收2个参数: mapStateToProps 和 mapDispatchToProps

**mapStateToProps:** 

1. 是一个函数, 返回包含n个一般属性的对象, 用来指定向UI组件传递哪些一般属性
2. 容器组件中调用该函数后得到对象后, 初始化为容器组件的初始状态, 并指定UI组件标签的一般属性

**mapDispatchToProps:** 

一个函数或对象, 用来指定向UI组件传递哪些函数属性

connect()执行的返回值是一个**高阶组件**: 这个高阶组件用来**包装UI组件**, 返回一个新的**容器组件**。容器组件会向UI组件**传入**前面指定的**一般属性 或 函数类型的属性**

1. 如果是函数,调用得到包含n个dispatch方法的对象
2. 如果是对象, 遍历封装成n个dispatch方法的对象
3. 将包含n个dispatch方法的对象分别作为函数属性传入UI组件
4. 通过store绑定state变化的监听，在回调函数中根据store中最新的state数据更新容器组件状态，从而更新UI组件



#### 4.4 使用了context来共享store

1. context的理解

相对于props, context可以非常方便的直接将数据传递给任何后代组件中, 而不用像props那样逐层传递，相当于提供了一个全局数据

在应用开发中不太建议使用context, 但是react-redux使用它来共享store. 一般库的开发，数据共享使用context



2. 父组件负责向后代组件提供数据，后代组件有能力获取数据，但是只有子组件进行声明才可以看到祖先组件中的state数据。子组件就是类似声明接收祖先组件传递过来的值。说白了，子组件如果想要父组件的数据，声明了就可以拿到。声明的方式其实就是对组件数据的保护, 不能父组件有state数据，所有子组件都可以访问，这样就违背了react数据传递的原则



3. 代码实现

- 代码结构: 暴露的2个方法 Provide和connect, 根据定义实现(legacy API,需要使用最新的API)

```js
import React from 'react'
import PropTypes from 'prop-types'
// PropTypes 提供一系列验证器，可用于确保组件接收到的数据类型是有效的
// 出于性能方面的考虑，propTypes 仅在开发模式下进行检查

// 用来向所有容器组件提供store的组件类
export class Provider extends React.Component {
  // 组件接收props的数据类型检查
  static propTypes = {
    store: PropTypes.object.isRequired
  }

  render() {
    return (
      <div>xxx</div>
    )
  }
}

/**
 * connect高阶函数:接收mapStateToProps和mapDispatchToProps, 返回一个高阶组件函数
 * 高阶组件: 接收UI组件,返回容器组件
 */
export function connect(mapStateToProps, mapDispatchToProps) {
  // 返回高阶组件函数
  return (UIComponent) => {
    // 返回容器组件
    return class ContainerComponent extends React.Component {
      render() {
        // 想办法想UI组件传递特定的标签属性(一般属性还是函数属性)
        // 容器组件的内部要返回容器组件的标签，并制定特定属性
        return <UIComponent />
      }
    }
  }
}
```

- 基于最新的React API实现的context

```js
import React from 'react'
import store from '../../redux-use-case/store'
// 创建上下文对象并初始化
const Context = React.createContext(store)

export class Provider extends React.Component {
  render() {
    return (
      <Context.Provider value={store}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

// 
export function connect(mapStateToProps, mapDispatchToProps) {
  return (UIComponent) => {

    return class ContainerComponent extends React.Component {

      static contextType = Context

      render() {
        console.log("this.context:", this.context)
        return (
          <UIComponent />
        )
      }
    }
  }
}
```



- 要给UIComponent传递制定属性, 就要给它传递store对象. 需要store对象是因为
  - 需要调用store的getState获取状态，才能传递一般属性。
  - 需要传递函数属性, 函数属性的函数必然要调用dispatch方法,分发action,调用reducer进而更新状态
  - subscribe: store中的状态更新默认是不重新渲染的,必须绑定监听, 在监听回调中重新渲染组件，组件才能更新

- 要弄明白如何将一般属性以及函数属性传递给UI组件, 需要知道是react-redux是怎么用的

> 精简版本

```js
import { increment, decrement } from './store/actions'
export default connect(
	// 接收state, 传递给Counter的props是count, 从state中来
    state => ({ count: state.count }),	
    // 两个action creator
    {increment, decrement}
)(Counter)
```

> 原始版本
>
> connect()函数接收两个参数,第一个参数是函数, 第二个有可能是函数,有可能是对象

```js
// 指定向Couter传入哪些一般属性(属性值的来源就是store中的state)
// 此时state是合并之后的所以返回state.count,如果返回user, 返回state.user
const mapStateToProps = state => ({ count: state.count }) 

// 指定向Counter传入哪些函数属性
// 如果是函数,会自动调用得到对象,将对象中的方法作为函数属性传入UI组件
const mapDispatchToProps = dispatch => ({
    increment: number => dispatch(increment(number)),
    decrement: number => dispatch(decrement(number))
})

connect(
	mapStateToProps,
    mapDispatchToProps
)(Couter)

```



> 如果第二个参数是个函数

```js
export function connect(mapStateToProps, mapDispatchToProps) {

  return (UIComponent) => {

    return class ContainerComponent extends React.Component {
      static contextType = Context

      constructor(props) {
        super(props)
        this.state = {
          stateProps: {},
          dispatchProps: {}
        }
      }

      componentDidMount() {
        const store = this.context
        // 得到包含所有一般属性的对象
        const stateProps = mapStateToProps(store.getState())

        // 得到包含所有函数属性的对象
        const dispatchProps = mapDispatchToProps(store.dispatch)
        // 保存在组件上, 因为函数的定义是不会变的, 而状态stateProps是会更新的, 所以要保存到组件状态数据上
        this.dispatchProps = dispatchProps

        this.setState({
          stateProps      // 将所有一般属性作为容器组件中的状态数据, 更新状态
        })
        // 绑定store的state变化的监听
        store.subscribe(() => {   //  store内部的state状态数据发生了变化
          // 更新容器组件(重新渲染组件[调用setState]),进而就更新了UI组件
          this.setState({
            stateProps: mapStateToProps(store.getState())     // 将所有一般属性作为容器组件中的状态数据, 更新状态
          })
        })
      }

      render() {
        console.log("this.context:", this.context)
        return (
          <UIComponent {...this.state.stateProps} {...this.dispatchProps} />
        )
      }
    }
  }
}
```

> 解析:
>
> 1. store的获取在DidMount中可以获取到, constructor中获取不到
> 2. 调用mapStateToProps(store.getState())就可以获取到一般属性
> 3. 调用mapDispatchToProps(store.dispatch)可以获取到函数属性
> 4. 第一次渲染界面需要调用setState将获取的store的状态数据设置到容器组件上
> 5. 监听store中的状态数据的更新, 当state变化了, 再次调用setState, 更新容器组件进而更新UI组件



> 如果是对象

```js
componentDidMount() {
        const store = this.context
        // 得到包含所有一般属性的对象
        const stateProps = mapStateToProps(store.getState())

        // 得到包含所有函数属性的对象
        let dispatchProps
        // 判断mapDispatchToProps这个参数是函数还是对象
        if (typeof mapDispatchToProps === 'function') {
          dispatchProps = mapDispatchToProps(store.dispatch)
        } else {
          // 如果传递的是对象,类似{increment, decrement}
          dispatchProps = Object.keys(mapDispatchToProps).reduce((pre, key) => {
            const actionCreator = mapDispatchToProps[key] // increment
            // 调用actionCreator返回一个action: { type: 'xxx', payload: data }
            pre[key] = (...args) => store.dispatch(actionCreator(...args))
            return pre
          }, {})
          // 最终返回的dispatchProps是什么? {increment: (...arge) => {函数内部调用dispatch(action)}} 触发reducer的状态更新
          // 也就是遍历actionCreator,调用store.dispatch(action),返回一个这样的对象,包含了调用dispatch(action)的函数
        }
        // 保存在组件上, 因为函数的定义是不会变的, 而状态stateProps是会更新的, 所以要保存到组件状态数据上
        this.dispatchProps = dispatchProps

        this.setState({
          stateProps      // 将所有一般属性作为容器组件中的状态数据, 更新状态
        })
        // 绑定store的state变化的监听
        store.subscribe(() => {   //  store内部的state状态数据发生了变化
          // 更新容器组件(重新渲染组件[调用setState]),进而就更新了UI组件
          this.setState({
            stateProps: mapStateToProps(store.getState())     // 将所有一般属性作为容器组件中的状态数据, 更新状态
          })
        })
      }
```



### 5. 手写react-router-dom

