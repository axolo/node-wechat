# node-wechat

[Wechat OpenAPI] Node.js SDK.

## Install

```bash
yarn add @axolo/node-wechat
```

## API

### constructor(config)

> params

|    config    |                     description                     |
| ------------ | --------------------------------------------------- |
| baseUrl      | base url of [Wechat OpenAPI]                        |
| authTokenUrl | url of get wechat access token                      |
| error        | throw error settings                                |
| axios        | HTTP Client, use [axios]                            |
| cache        | cache settings, `cache.manager` use [cache-manager] |
| logger       | logger settings, use [log4js]                       |

> return

A instance of `Wechat` OpenAPI Node.js SDK.

### execute(api, request = {}, scope = {})

more request options see [axios].

> params

|     parmas     |              description               |
| -------------- | -------------------------------------- |
| api            | querystring, Wechat OpenAPI            |
| request.method | HTTP Method                            |
| request.params | HTTP querystring as Object by GET      |
| request.body   | HTTP body as Object by POST/PATCH/PUT  |
| scope          | scope or other options of api          |

> return

Get data with [return code] from [Wechat OpenAPI].

### callback({ signature, timestamp, nonce, echostr })

See [http event callback] for help.
This method use as middleware usualy.

> params

|  params   |   description    |
| --------- | ---------------- |
| signature | signature string |
| timestamp | timestamp string |
| nonce     | random number    |
| echostr   | random string    |

> return

event decrypted of callback. response `echostr` if callback success.

## Example

```js
const WechatSdk = require('@axolo/node-wechat');
const config = { appId: 'APP_ID', appSecret: 'APP_SECRET' };
const wechat = new WechatSdk(config);

wechat.execute('/user/info', {
  params: { openid: 'openid' }
}).catch(err => {
  console.log(err);
}).then(res => {
  console.log(res);
});
```

## Test

```bash
yarn test ./test/execute.test.js      # test execute
yarn test ./test/callback-koa.test.js # test callback
```

**TIP**: Please create `.env` and `.env.test` in project root before test.

### .env

```ini
appId = APP_ID
appSecret = APP_SECRET
```

### .env.test

```ini
## http server for http event callback
httpPort = 7001
```

## TODO

- mode: support `miniprogram`, `work wechat`, etc.
- test: Assertion Testing with Mocha or Jest.
- cache: support `memory`, `redis`, `mysql`, etc.

> Yueming Fang

[axios]: https://github.com/axios/axios
[cache-manager]: https://github.com/BryanDonovan/node-cache-manager
[log4js]: https://log4js-node.github.io/log4js-node
[Wechat OpenAPI]: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html
[http event callback]: https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html
[return code]: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Global_Return_Code.html
