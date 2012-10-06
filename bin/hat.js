#!/usr/bin/env node

var app = require('commander');
var hat = require('../lib/index.js');
app
  .version('0.0.1')
  .option('-s, --stage [stage]', 'deploy to  a specific stage [production]', 'production')
  .option('-n, --dryrun', 'Dry run the deployment')
  .option('-v, --verbose', 'show lot of logs')
  .parse(process.argv);
  
hat.exec(app.args, {stage: app.stage, dryrun: app.dryrun}, function(err, res){
  console.log("finished");
});

