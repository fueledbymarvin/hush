/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
	phone: {
	    type: 'string',
	    unique: true
	},
	credits: {
	    type: 'integer'
	},
	receive: function(opts) {
	    if (opts.to == User.mainNumber) {
		var rexp = /^@[0-9]{10} /;
		var matches = rexp.exec(opts.msg);
		if (!matches)
		    return Twilio.send({from: User.mainNumber, to: this.phone, msg: "Doesn't specify a receiving number."});
		else {
		    this.credits += 1;
		    this.checkRelease();
		    var receiver = /[0-9]{10}/.exec(opts.msg)[0];
		    var content = opts.msg.replace(rexp, '');
		    User.find({where: {phone: receiver}, limit: 1}).exec(function (err, users) {
			if (err)
			    return Twilio.send({from: User.mainNumber, to: this.phone, msg: "Sorry, something went wrong."});
			if (users.length == 0) {
			    User.create({phone: receiver}).exec(function (err, user) {
				if (err)
				    return Twilio.send({from: User.mainNumber, to: this.phone, msg: "Sorry, something went wrong."});
				user.newMessage({from: opts.from, msg: content});
			    });
			} else {
			    users[0].newMessage({from: opts.from, msg: content});
			}
		    });
		}
	    } else if (User.receivingNumbers.contains(opts.to)) {
		// kill thread
	    }
	}
    },
    mainNumber: '5714906806',
    receivingNumbers: ['1234567890', '5557775555', '2223334444'],
    receive: function(opts, cb) {
	User.find({where: {phone: opts.from}, limit: 1}).exec(function (err, users) {
	    if (err)
		return cb(err);
	    if (users.length == 0) {
		User.create({phone: opts.from}).exec(function (err, user) {
		    if (err)
			return cb(err);
		    user.receive(opts);
		});
	    } else {
		users[0].receive(opts);
	    }
	});
    }
};

