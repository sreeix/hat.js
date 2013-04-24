var winston = require('winston');

module.exports = function logger (level) {
  return new (winston.Logger)({transports: [new (winston.transports.Console)({ level: level, colorize: 'true' })]});
};
