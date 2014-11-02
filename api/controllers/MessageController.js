/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    messageReceived: function(req, res) {
        var sender = req.param('From'),
            twilioReceivingNumber = req.param('To'),
            body = req.param('Body');
        console.log(sender, twilioReceivingNumber, body);
        
        // Find User who sent msg 
        User.findOrCreateByPhone({phoneNumber: sender}, function (err, users) {
            if (err) {
                res.send(err);
            } else {
                user = users.isArray ? users[0] : users;
                console.log(user);
            }

            if (twilio.isMainNumber(twilioReceivingNumber)){
                // This creates a message thread
                var regex = /^[0-9]{10}/;
                var receiver = regex.exec(body);
                console.log(receiver);
                if (receiver[0]) {
                    var message = body.replace(regex, '');
                    User.findOrCreateByPhone({phoneNumber: receiver}, function(err, recipients) {
                        console.log("HELLO");
                        if (err) {
                            console.log(err);
                            res.send(err);
                            return twilio.sendError({
                                from: twilio.MAIN_NUMBER,
                                to: sender,
                                msg: "Sorry, something went wrong"
                            });
                        } else {
                            recipient = recipients.isArray ? recipients[0] : recipients;
                            console.log(recipient);
                        }
                        console.log("HELLO");
                        Message.create({
                            from: user,
                            content: message,
                            to: recipient
                        }, function(err,m){
                            recipient.addToQueue(m);
                            user.addSendCredit();
                            res.send("Probably worked");
                        });
                    });
                } else {
                    return twilio.sendError({
                        from: twilio.MAIN_NUMBER,
                        to: sender,
                        msg: "Doesn't specify a receiving number."
                    });
                }
            } else if(twilio.RECEIVING_NUMBERS.indexOf(twilioReceivingNumber) != -1) {
                // This is a response to a message thread
            }
        });

    }
};

