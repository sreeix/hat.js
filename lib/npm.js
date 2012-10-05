module.exports = npm = {
  restart: function restart (options) {
    npm.stop(options);
    npm.start(options);
  },
  start: function start (options, host) {
    _run(options, ["cd "+ options.currentPath(host), "npm start"]);
  },
  stop: function stop (options, host) {
    run(["cd "+ options.currentPath(host), "npm stop"]);
  }
};