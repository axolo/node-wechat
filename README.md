# node-wechat

[Wechat OpenAPI] Node.js SDK.

## Install

```bash
yarn add @axolo/node-wechat
```

## API

please see `src` and `test` for more api usage.

### constructor(config)

> params

|    config    |                     description                     |
| ------------ | --------------------------------------------------- |
| appMode      | mp = MiniProgram, oa = OfficialAccount              |
| appId        | Wechat appId                                        |
| appSecret    | Wechat AppSecret                                    |
| eventToken   | [http event callback] token                         |
| eventAesKey  | [http event callback] encode aes key                |
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

## How to config jsapi

1. Get jsapiTicket (back-end)

```js
const WechatSdk = require('@axolo/node-wechat');
const config = { appId: 'APP_ID', appSecret: 'APP_SECRET' };
const wechat = new WechatSdk(config);
wechat.getJsapiTicket().catch(err => {
  console.log(err);
}).then(jsapiTicket => {
  // output jsapiTicket to front-end
  console.log(jsapiTicket);
});
```

2. Config jsapi (front-end)

```js
import crypto from 'crypto'
import querystring from 'query-string'
import shortid from 'shortid'

const wechatJsapiSign = ({ appId, jsapiTicket, jsApiList, debug = false }) => {
  const nonceStr = shortid.generate()
  const timestamp = parseInt(Date.now() / 1000)
  const { href } = location
  const url = href.substring(0, href.indexOf('#')) // spa hash mode
  const params = { jsapi_ticket: jsapiTicket, noncestr: nonceStr, timestamp, url }
  const plain = querystring.stringify(params, { encode: false })
  const signature = crypto.createHash('sha1').update(plain, 'utf8').digest('hex')
  const config = { appId, timestamp, nonceStr, signature, jsApiList, debug }
  return config
}

// get and cache jsapiTicket from step 1
const config = wechatJsapiSign({ appId: 'APP_ID', jsapiTicket, jsApiList: [] })
wx.config(config)
```

## Test

```bash
yarn test ./test/execute.test.js      # test execute
yarn test ./test/callback-koa.test.js # test callback
```

**TIP**: Please create `.env` and `.env.test` in project root before test.

### .env

```ini
appMode = mp
appId = APP_ID
appSecret = APP_SECRET
```

### .env.test

```ini
## http server for http event callback
httpPort = 7001
```

## TODO

- mode: support `work wechat`.
- test: Assertion Testing with Mocha or Jest.
- cache: support `memory`, `redis`, `mysql`, etc.

> Yueming Fang

[axios]: https://github.com/axios/axios
[cache-manager]: https://github.com/BryanDonovan/node-cache-manager
[log4js]: https://log4js-node.github.io/log4js-node
[Wechat OpenAPI]: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html
[http event callback]: https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html
[return code]: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Global_Return_Code.html
