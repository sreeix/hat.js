module.exports = npm = {
  restart: function restart (options) {
    return [npm.stop, npm.start];
  },
  start: function start (options, host, cb) {
    _run(options, ["cd "+ options.currentPath(host), "npm start"]);
  },
  stop: function stop (options, host, cb) {
    run(["cd "+ options.currentPath(host), "npm stop"]);
  }
};