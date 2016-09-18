var MomondoScrappper = require('../src/momondo-scrappper');
var Utils = require('../src/utils');
var Persistency = require('../src/persistency-module');
var Options = require('../src/options');
const debug = require('debug')('fligth-scrappper');

function flightScrappper() {

  var options;

  function persistData(flights) {
    return Persistency.insertFlights(options.database, options.collection, flights);
  }

  function init(args) {
    options = new Options(args).options;
    debug('Executing with the following options :\n' + Utils.prettifyObject(options));
    let dates = Utils.retrieveFlightDatesArray(options.targetDate, options.dateFormat, options.periods, options.interval);
    debug('Querying for the following dates:\n' + Utils.prettifyObject(dates) + '\n');
    MomondoScrappper.startBrowser(options.browser);
    return dates;
  }

  function end(args) {
    MomondoScrappper.stopBrowser();
    debug('Successfully persisted for ' + args.length + ' flights.');
    return args;
  }

  function run(args) {
    let dates = init(args);
    let persistPromises = [];
    for (let route of options.routes) {
      for (let date of dates) {
        debug('Query: from:' + route.from + ' to:' + route.to + ' date:' + date);
        let scrapPromise = MomondoScrappper.scrap(route, date, options.currency, options.directFlight);
        persistPromises.push(scrapPromise.then(persistData));
      }
    }
    return Promise.all(persistPromises).then(end);
  }


  return {
    run
  };
}

module.exports = flightScrappper();