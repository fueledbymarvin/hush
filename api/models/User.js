/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: 'hush',
  adapter: 'someMongodbServer',

  schema: false,
  attributes: {
    phoneNumber: {
      type: 'STRING',
      required: true,
      unique: true,
      primaryKey: true
    },

    receivedMessage1: {
      model: 'Message'
    },

    receivedMessage2: {
      model: 'Message'
    },

    receivedMessage3: {
      model: 'Message'
    },

    unsentQueue: {
      collection: 'Message',
      via: 'to'
    },
    credits: 'INTEGER'
  }
};
