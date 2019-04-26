const nodemailer = require('nodemailer');


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // secure:true for port 465, secure:false for port 587
	auth: {
			user: 'udatamapper@gmail.com',
			pass: 'Test@123'
	}
});

function send(to, subject, text, isHtml) {
	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Universal Data Mapper" <udatamapper@gmail.com>', // sender address
		to: to,
		subject: subject,
		text: (!isHtml ? text : ''),
		html: (isHtml ? text : '')
	};

	// send mail with defined transport object
	return transporter.sendMail(mailOptions)
		.then((info, error) => {
				return({info, error});
		});
}

exports.sendMail = function(user, subject, body, purpose) {
  return send(user.email, subject, body, purpose, true)
		.then(result => {
      if (result.error) {
        // console.log('[SYSTEM] Failed to send ' + purpose + ' mail  to ' + user.email + ' with error ' + result.error);
        return {
          status: false,
          message: 'Failed to send password reset mail  to ' + user.email
        }
      } else {
        // console.log('[SYSTEM] Email for ' + purpose + ' successfully sent to ' + user.email + '(' + result.info.messageId + ':' + result.info.response + ')');
        return {
          status: true,
          message: 'Email for ' + purpose + ' successfully sent to ' + user.email
        }
      }
    })
    .catch(error => {
      console.log("SENDMAIL ERROR", error);
      return {
        status: false,
        message: error.toString()
      }
    })
}