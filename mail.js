const nodemailer = require('nodemailer');

// configure mail and send it 
async function sendMail(){
    // create an email transporter
    // SMTP (Simple Mail transfer protocol)
   const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth:{
            user: '@gmail.com',
            pass:''
        }
    })

    //2 configure email content.
    const mailoptions = {
        form: 'willyzonkaop@gmail.com',
        to:'ajit.sabat1715@gmail.com',
        subject: 'welcome to Ajit playboy ',
        text:'how are you bro this mail is from ',
    }
    // send email.
    try {
        const result = await transporter.sendMail(mailoptions);
        console.log('Email send successfully')
    } catch (error) {
        console.log('Email send failed with error',error)
    }
}
 
sendMail()