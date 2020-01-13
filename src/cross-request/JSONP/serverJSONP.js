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