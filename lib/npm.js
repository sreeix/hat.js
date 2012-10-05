module.exports = npm = {
  restart: function restart (options) {
    // return _serial(npm.stop, npm.start);
    _serial()
  },
  start: function start (options, host, cb) {
    _run(options, ["cd "+ options.currentPath(host), "npm start"]);
  },
  stop: function stop (options, host, cb) {
    run(["cd "+ options.currentPath(host), "npm stop"]);
  }
};