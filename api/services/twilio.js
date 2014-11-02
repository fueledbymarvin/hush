/**
 * TwilioService
 *
 * @description :: Server-side logic for managing twilio api 
 */

var mainNumber = '5714906806';
var receivingNumbers = ['1234567890', '5557775555', '2223334444'];

module.exports = {
    isMainNumber: function(number) {
        return number == this.MAIN_NUMBER;
    },
    sendError: function(opts) {
    },
    // CONSTANTS
    MAIN_NUMBER: '5714906806';
    RECEIVING_NUMBERS: ['1234567890', '5557775555', '2223334444'];
};
