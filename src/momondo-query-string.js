/*
Search  - true
TripType- 1 for 1 way, 2 for comeback uncluded, 3 for multiple
SegNo   - 1 no return date, 2 with return date
SO0     - From aeroport code
SD0     - Destiny aeroport code
SDP0    - Departure date
AD      - Passengers
TK      - Traveling class, usually ECO for economic
DO      - Direct flights only?true,falseNA - Nearest aeroports ? true, false
*/

const BudgetEnum = {
  ECO: 'ECO',
  ECO_PREMIUM: 'FLX',
  BUSINESS: 'BIZ',
  FIRST_CLASS: 'FST'
};

function addQueryStringAnd(string) {
  if (string.length > 0) {
    string += '&';
  }
  return string;
}

class MomondoQueryString {

  constructor(from, to, fromDate) {
    this.from = from;
    this.to = to;
    this.fromDate = fromDate;
    this.attributes = {};
    this.attributes.search = 'true';
    this.attributes.tripType = '1';
    this.attributes.segNo = '1';
    this.attributes.from = from;
    this.attributes.to = to;
    this.attributes.fromDate = fromDate;
    this.attributes.passengerNumber = '1';
    this.attributes.budget = BudgetEnum.ECO;
    this.attributes.directFlight = 'false';
    this.attributes.nearestAeroport = 'false';
    this.translations = ['Search', 'TripType', 'SegNo', 'SO0', 'SD0', 'SDP0', 'AD', 'TK', 'DO', 'NA'];
  }

  toString() {
    var result = '';
    var i = 0;
    for (let propertyName in this.attributes) {
      if ({}.hasOwnProperty.call(this.attributes, propertyName)) {
        result = addQueryStringAnd(result);
        if (this.attributes[propertyName]) {
          result += this.translations[i] + '=' + this.attributes[propertyName];
        }
        i++;
      }
    }
    return result;
  }

}

module.exports = MomondoQueryString;