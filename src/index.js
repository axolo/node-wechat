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
 *
 * @class WechatSdk
 */
class WechatSdk {
  constructor(config) {
    const defaultConfig = {
      axios,
      baseUrl: 'https://api.weixin.qq.com/cgi-bin',
      authTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
      cache: { store: 'memory', prefix: 'wechat' },
      error: { name: 'WechatSdkError' },
    };
    this.config = deepmerge(defaultConfig, config);
    this.axios = this.config.axios;
    this.cache = new WechatSdkCache(this.config.cache);
    this.logger = new WechatSdkLogger(this.config.logger);
  }

  /**
   * **获取令牌**
   *
   * @see https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
   * @param {object} { appId, appSecret, grantType } 请求参数
   * @return {string} access_token，微信应用令牌
   * @memberof WechatSdk
   */
  async getTokenH5({ appId, appSecret, grantType = 'client_credential' }) {
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
      case 'h5': {
        const { appId, appSecret } = options;
        const token = await this.getTokenH5({ appId, appSecret });
        return token;
      }
    }
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
    const access_token = await this.getTokenH5({ ...config, ...scope });
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
