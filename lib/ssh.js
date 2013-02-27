module.exports = {
  deploy: function deploySSH (cb) {
    this._serial([this.setup, this.checkout, this.changeSymlinks, this.restart], cb);
  }
};
