var chromedriver = require('chromedriver');
var MomondoQueryString = require('../src/momondo-query-string');
var Flight = require('../src/flight');
var Config = require('../config');
var Webdriver = require('selenium-webdriver');
var By = Webdriver.By;
var driver;

function momondoScrapper() {
    function startBrowser() {
        driver = new Webdriver.Builder()
            .forBrowser(Config.BROWSER)
            .build();
        chromedriver.start();
    }

    function stopBrowser() {
        driver.quit();
        chromedriver.stop();
    }

    function retrieveFlightData(fromAeroport, toAeroport, targetDate) {
        return new Promise(function(resolve, reject) {
            var momondo = new MomondoQueryString(fromAeroport, toAeroport, targetDate);
            var fullUrl = 'http://www.momondo.co.uk/flightsearch/?' + momondo.toString();
            driver.get(fullUrl);
            driver.wait(function() {
                return driver.findElement(By.id('searchProgressText')).getText().then(function(text) {
                    return text === 'Search complete';
                });
            }, Config.TIMEOUT);
            var resultsBoardElement = driver.findElement(By.id('results-tickets'));
            resultsBoardElement.findElements(By.css('div.result-box')).then(function(elements) {
                if (elements.length > 0) {
                    var resultBoxData = [];
                    elements.forEach(function(val, idx) {
                        resultBoxData.push(elements[idx].findElement(By.css('div.names')).getText());
                        resultBoxData.push(elements[idx].findElement(By.css('div.price-pax .price span.value')).getText());
                        resultBoxData.push(elements[idx].findElement(By.css('.travel-time')).getText());
                    });
                    Promise.all(resultBoxData).then(function(args) {
                        let result = [];
                        for (let i = 0; i + 2 < args.length; i = i + 3) {
                            result.push(new Flight(args[i], targetDate, args[i + 1], args[i + 2]));
                        }
                        resolve(result);
                    });
                } else {
                    reject(new Error('No results!'));
                }
            });
        });
    }

    function scrap(from, to, dates) {
        return new Promise(function(resolve, reject) {
            startBrowser();
            var dataPromises = [];
            for (let targetDate of dates) {
                dataPromises.push(retrieveFlightData(from, to, targetDate));
            }
            Promise.all(dataPromises).then(function(args) {
                resolve(args);
            }, (err) => reject(err));
            stopBrowser();
        });
    }

    return {
        scrap
    };
}

module.exports = momondoScrapper();