const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
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
  let method = ctx.method
  let path = ctx.path
  console.log("method, path: ", method, path)
  ctx.body = {
    method,
    path,
    data: {
      username: 'sanfeng',
      password: '123456'
    }
  }
})

app.listen(5000, () => {
  console.log('server start at port 5000')
})