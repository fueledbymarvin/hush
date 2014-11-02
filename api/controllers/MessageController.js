/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    messageReceived: function(req, res) {
        var sender = req.body('From'),
            twilioReceivingNumber = req.body('To'),
            body = req.body('Body');
        
        // Find User who sent msg 
        User.findOrCreate({phone: sender}, {phone: sender}, function (err, users) {
            if (err) {
                return cb(err);
            } else {
                user = users.isArray ? users[0] : users;
            }

            if (twilio.isMainNumber(twilioReceivingNumber)){
                // This creates a message thread
                var regex = /^@[0-9]{10} /;
		var receiver;
                if (receiver = regex.exec(body)) {
                    user.credits++;
                    user.save(function (err,user) {
                        var content = body.replace(regex, '');
                        User.findOrCreate({phone: receiver},{phone: receiver}, function(err, recipients) {
                            if (err) {
                                return twilio.sendError({
                                    from: twilio.MAIN_NUMBER,
                                    to: sender,
                                    msg: "Sorry, something went wrong"
                                });
                            } else {
                                recipient = recipients.isArray() ? recipients[0] : recipients;
                            }
                            recipient.newMessage({
                                from: user,
                                msg: content 
                            });
                        });
                    });
                } else {
                    return twilio.sendError({
                        from: twilio.MAIN_NUMBER,
                        to: sender,
                        msg: "Doesn't specify a receiving number."
                    });
                }
            } else if(twilio.RECEIVING_NUMBERS.contains(twilioReceivingNumber)) {
                // This is a response to a message thread
            }
        });

    }
};

