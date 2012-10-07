#!/usr/bin/env node

var app = require('commander');
var hat = require('../lib/index.js');
app
  .version('0.0.1')
  .option('-s, --stage [stage]', 'deploy to  a specific stage [production]', 'production')
  .option('-n, --dryrun', 'Dry run the deployment')
  .option('-r, --revisions [revisions]', 'How many revisions to go backward', parseInt)
  .option('-v, --verbose', 'show lot of logs')
  .parse(process.argv);
  
hat.exec(["rollback"], {stage: app.stage, dryrun: app.dryrun, revisions: app.revisions}, function(err, res){
  if(err){
    console.log(err);
  }
  console.log("finished");
});

