var express = require('express');
var router = express.Router();
var api_key = process.env.MAILGUN_KEY;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

router.post('/submit', function (req, res, next) {

    var data = {
        from: 'info@uniprocure.com',
        to: 'nirav.shah83@gmail.com',
        subject: 'New Contact Request: ' + req.body.name,
        text: 'New Contact Request: ' + req.body.name + ' Email Address: ' + req.body.email
    };

    mailgun.messages().send(data, function (error, body) {
        if (error) {
            console.log("MailGun Send Error: ", error);
            res.status(500).send(error);
        } else {
            console.log("MailGun Send Success: ", body);
            res.json({msg: "OK"});
        }
    });
});

module.exports = router;




