#!/usr/bin/env node

var app = require('commander');
var _ = require('underscore');
var hat = require('../lib/index.js');
var gen = require('../lib/generator.js');

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
var defaultOptions = {stage: app.stage, dryrun: app.dryrun, verbose: (app.verbose === true)};
if(app.generate) {
  gen(app.args[0], defaultOptions, function  (err, res) {
    process.exit(0);
  });
} else {
  hat.exec(app.args, defaultOptions, function(err, res){
    console.log("finished");
  });
}


