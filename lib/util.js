var _ = require('underscore');

var util = {
  advice: function advice (fn, opts) {
    var self = this;
    opts = opts || {}
    opts = _.extend({after: _identity, before: _identity}, opts);
    opts.before.call(this, function() {
      fn.call(self, function(err, res) {
        opts.after.call(self)
      });
    });
  }
};

var _identity = function(cb) {cb()};
module.exports = util;