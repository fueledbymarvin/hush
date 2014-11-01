/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    content : {
      type: 'string',
      required: true
    },

    from : {
      type: 'string',
      required: true
    },

    to : {
      model: 'User',
      required: true
    },

    messagingAgent : {
      type: 'string'
    }
  }
};

