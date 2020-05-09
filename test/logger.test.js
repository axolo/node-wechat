'use strict';

const WechatSdkLogger = require('../src/logger');

const logger = new WechatSdkLogger();

logger.error(Date.now());
