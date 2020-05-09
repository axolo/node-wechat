'use strict';

// **Usage:**
// let route `GET /wechat/callback` accessable on internet.
// set wechat app callback URL point to link of route `GET /wechat/callback`.
// see https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html for more help.

const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const WechatSdk = require('../src');

const { appId, appSecret } = process.env;
const config = { appId, appSecret };
const wechat = new WechatSdk(config);

router.get('/', async ctx => { ctx.body = 'Hello Koa.js'; });

router.get('/wechat/callback', async ctx => {
  const { query, body } = ctx.request;
  const event = { ...query, ...body };
  const result = await wechat.callback(event);
  console.log(result);
  ctx.body = result && result.echostr;
});

app.use(bodyParser());
app.use(router.routes(), router.allowedMethods());
const { httpPort = 3000 } = process.env;
app.listen(httpPort);

console.log(`HTTP Server is running at: ${httpPort}`);
