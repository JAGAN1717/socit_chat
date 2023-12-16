const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:'peakyblinders1tommy@gmail.com',
        pass:'tommy12345s'
    }
})

async function SendMailer(MailData) {
    try {
        const mail = {
            from: 'peakyblinders1tommy@gmail.com',
            to:'bmjagan17@gmail.com',
            subject:'test',
            text:"test"
        }
        
        transport.sendMail(mail,(err,result)=> {
            if(err) {
                console.log('err',err.message)
            }
            if(result){
                console.log('Mail Sended Succussfull!')
            }else{
                console.log('Mail Not Sennded!')
            }
        })
    } catch (error) {
        console.log("err",error.message)
    }
}

module.exports={SendMailer}