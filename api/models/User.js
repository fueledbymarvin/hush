/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: 'hush',
  adapter: 'mongo',

  schema: false,
  attributes: {
    phoneNumber: {
      type: 'STRING',
      required: true,
      unique: true,
      primaryKey: true
    },
    mailbox1: {
      
    },
    unsentQueue: 'ARRAY',
    credits: 'INTEGER'
  }
};
