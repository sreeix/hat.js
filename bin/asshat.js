#!/usr/bin/env node

var app = require('commander');
var hat = require('../lib/index');
app
  .version('0.0.3')
  .option('-s, --stage [stage]', 'deploy to  a specific stage [production]', 'production')
  .option('-n, --dryrun', 'Dry run the deployment')
  .option('-r, --revisions [revisions]', 'How many revisions to go backward', parseInt)
  .option('-v, --verbose', 'show lot of logs')
  .parse(process.argv);

var logger = require('../lib/logger')((app.verbose === true) ? "silly": 'error');

hat.exec(["rollback"], {stage: app.stage, dryrun: app.dryrun, revisions: app.revisions, logger:logger}, function(err, res){
  if(err){
    logger.error("Rollback failed" + err.toString());
    process.exit(1);
  }
  logger.info("Rollback completed");
});

