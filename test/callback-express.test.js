'use strict';

// **Usage:**
// let route `GET /wechat/callback` accessable on internet.
// set wechat app callback URL point to link of route `GET /wechat/callback`.
// see https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html for more help.

const express = require('express');
const bodyParser = require('body-parser');
const WechatSdk = require('../src');

const { appId, appSecret } = process.env;
const config = { appId, appSecret };
const wechat = new WechatSdk(config);

const app = express();
app.use(bodyParser());

app.get('/', (req, res) => res.send('Hello Express.js'));

app.get('/wechat/callback', (req, res) => {
  const { query, body } = req;
  const event = { ...query, ...body };
  wechat.callback(event).catch(err => {
    res.send(err);
  }).then(result => {
    console.log(result);
    res.send(result && result.echostr);
  });
});

const { httpPort = 3000 } = process.env;
app.listen(httpPort);

console.log(`HTTP Server is running at: ${httpPort}`);
