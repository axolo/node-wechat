'use strict';

const axios = require('axios');
const deepmerge = require('deepmerge');
const WechatSdkError = require('./error');
const WechatSdkLogger = require('./logger');
const WechatSdkCache = require('./cache');

/**
 * **微信SDK**
 *
 * **缓存命名规则**
 *
 * mode | prefix | type        | suffix
 * -----|--------|-------------|----------
 * all  | wechat | accessToken | appId
 * all  | wechat | jsapiTicket | appId
 *
 * @class WechatSdk
 */
class WechatSdk {
  constructor(config) {
    const defaultConfig = {
      axios,
      baseUrl: 'https://api.weixin.qq.com/cgi-bin',
      authTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
      jsapiTicketUrl: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      code2sessionUrl: 'https://api.weixin.qq.com/sns/jscode2session',
      code2tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      cache: { store: 'memory', prefix: 'wechat' },
      error: { name: 'WechatSdkError' },
    };
    this.config = deepmerge(defaultConfig, config);
    this.axios = this.config.axios;
    this.cache = new WechatSdkCache(this.config.cache);
    this.logger = new WechatSdkLogger(this.config.logger);
    this.error = WechatSdkError;
  }

  /**
   * **获取当前用户会话信息**
   *
   * 小程序
   *
   * @see https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
   * @param {object} { jsCode, grantType } 请求参数
   * @return {object} 当前用户会话，如：openid（用户唯一标志）、unionid（用户在开放平台的唯一标识符）
   * @memberof WechatSdk
   */
  async code2session({ jsCode, grantType = 'authorization_code' }) {
    const { code2sessionUrl: url, appId, appSecret } = this.config;
    const params = { appid: appId, secret: appSecret, js_code: jsCode, grant_type: grantType };
    const { data: session } = await this.axios({ url, params });
    if (!session) throw new WechatSdkError('get user session failed');
    if (session.errcode) throw new WechatSdkError(JSON.stringify(session));
    return session;
  }

  /**
   * **获取当前用户授权信息**
   *
   * 公众号
   *
   * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1
   * @param {object} { code, grantType } 请求参数
   * @return {object} 当前用户会话，如：openid（用户唯一标志）、unionid（用户在开放平台的唯一标识符）
   * @memberof WechatSdk
   */
  async code2token({ code, grantType = 'authorization_code' }) {
    const { code2tokenUrl: url, appId, appSecret } = this.config;
    const params = { appid: appId, secret: appSecret, code, grant_type: grantType };
    const { data: token } = await this.axios({ url, params });
    if (!token) throw new WechatSdkError('get user token failed');
    if (token.errcode) throw new WechatSdkError(JSON.stringify(token));
    return token;
  }

  /**
   * **获取令牌**
   *
   * @see https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
   * @param {object} { appId, appSecret, grantType } 请求参数
   * @return {string} access_token，微信应用令牌
   * @memberof WechatSdk
   */
  async getTokenOa({ appId, appSecret, grantType = 'client_credential' }) {
    const { cache, authTokenUrl: url } = this.config;
    const cacheKey = [ cache.prefix, 'accessToken', appId ].join('.');
    const cacheValue = await this.cache.get(cacheKey);
    if (cacheValue) return cacheValue;
    const params = { appid: appId, secret: appSecret, grant_type: grantType };
    const { data: result } = await this.axios({ url, params });
    if (!result) throw new WechatSdkError('get accessToken failed');
    if (result.errcode) throw new WechatSdkError(JSON.stringify(result));
    const { access_token, expires_in } = result;
    await this.cache.set(cacheKey, access_token, { ttl: expires_in });
    return access_token;
  }

  /**
   * **获取令牌**
   *
   * 根据参数获取微信应用令牌，其中`appMode`：
   *
   * - h5: 微信公众号应用（默认，暂时仅支持公众号）
   * - mp: 微信小程序应用（保留，目前同微信公众号）
   * - corp: 企业微信企业自建应用（保留，暂无实现计划，预计为独立项目）
   * - isv: 企业微信第三方企业应用（保留，预计企业微信应用项目时实现）
   *
   * @param {object} options 参数
   * @return {string} 令牌
   * @memberof WechatSdk
   */
  async getToken(options) {
    const { appMode } = options;
    switch (appMode) {
      default:
      case 'mp':
      case 'oa': {
        const { appId, appSecret } = options;
        const token = await this.getTokenOa({ appId, appSecret });
        return token;
      }
    }
  }

  /**
   * **获取JSAPI票据**
   *
   * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
   * @param {object} { type = 'jsapi' } 票据类型
   * @return {string} JSAPI票据
   * @memberof WeixinSdk
   */
  async getJsapiTicket({ type = 'jsapi' } = {}) {
    const { config } = this;
    const { appId, jsapiTicketUrl: url, cache } = config;
    const cacheKey = [ cache.prefix, 'jsapiTicket', appId ].join('.');
    const cacheValue = await this.cache.get(cacheKey);
    if (cacheValue) return cacheValue;
    const access_token = await this.getToken({ ...config });
    const params = { access_token, type };
    const { data: result } = await this.axios({ url, params });
    if (!result) throw new this.error('get jsapi ticket failed');
    if (result.errcode) throw new this.error(JSON.stringify(result));
    const { ticket, expires_in } = result;
    await this.cache.set(cacheKey, ticket, { ttl: expires_in });
    return ticket;
  }

  /**
   * **请求API**
   *
   * @param {string} api API接口
   * @param {object} request 请求
   * @param {object} scope 范围及其他参数，corpId = 企业微信ISV应用企业ID
   * @return {object} 响应
   * @memberof WechatSdk
   */
  async execute(api, request = {}, scope = {}) {
    const { config } = this;
    const { baseUrl } = config;
    const access_token = await this.getTokenOa({ ...config, ...scope });
    const options = deepmerge(request, { params: { access_token } });
    const url = baseUrl + api;
    const { data } = await this.axios(url, options);
    return data;
  }

  /**
   * **处理HTTP事件回调**
   *
   * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/Message_Encryption/Message_encryption_and_decryption.html
   * @param {object} request 加密的事件数据
   * @return {object} 解密的事件数据
   * @memberof WechatSdk
   */
  async callback(request) {
    // TODO: decrypt request and encrypt response
    return request;
  }
}

module.exports = WechatSdk;
