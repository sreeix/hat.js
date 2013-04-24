var _ = require('underscore'),
    util = require('util');

module.exports = loggingAspect = {
  aspect: function () {
    return {
      before: function(name, args, cb) {
        this.logger.info("starting :" + name || "unnamed");
        return cb();
      },
      after: function(name, args, cb) {
        this.logger.info("Finished :" + name || "unnamed");
        return cb();
      }
    };
  },
  results: function () {
    return JSON.stringify(timingAspect.root);
  }
};