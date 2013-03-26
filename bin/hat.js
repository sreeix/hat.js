#!/usr/bin/env node

var app = require('commander');
var _ = require('underscore');
var hat = require('../lib/index');
var gen = require('../lib/generator');

var showTaskTips = function(){
  _.chain(hat)
   .functions()
   .filter(function filterPrivate (argument) { return argument[0] !== '_'})
   .collect(function tips (item) {return {fun: item, tip: hat[item+"_tip"]}})
   .compact()
   .each(function(item){console.log(item.fun + " : "+ item.tip )});
}

app
  .version('0.0.3')
  .option('-s, --stage [stage]', 'deploy to  a specific stage [production]', 'production')
  .option('-n, --dryrun', 'Dry run the deployment')
  .option('-t, --tasks', 'Show tasks available for execution.')
  .option('-g, --generate', 'Generate a default template for deployment')
  .option('-v, --verbose', 'show lot of logs. The default')
  .parse(process.argv);

if(app.tasks) {
  process.exit(showTaskTips());
}
var logger = require('../lib/logger')((app.verbose === true) ? "silly": 'error');
var defaultOptions = {stage: app.stage, dryrun: app.dryrun, logger: logger};
if(app.generate) {
  gen.template(app.args[0], defaultOptions, function  (err, res) {
    process.exit(0);
  });
} else {
  process.on('SIGINT',function () {
    logger.warn("Interruped, Rolling back");
    hat.rollback(function (err, res) {
      if(err) {
        logger.error("Rollback Failed "+ err);
      } else{
        logger.info("Rollback Complete");
      }
      process.exit(1);
    });
  });
  hat.exec(app.args, defaultOptions, function(err, res){
    logger.info("finished");
  });
}


