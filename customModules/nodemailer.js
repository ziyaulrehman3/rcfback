import nodemailer from 'nodemailer'

const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    auth:{
        user:process.env.MAIL_AUTH_USER,
        pass:process.env.MAIL_AUTH_PASSWORD,
    },
})

const TransporterCheck=async function (){
    try{
         let response= await transporter.verify()
         console.log(response)
    }catch(err){
        console.log(err)
    }
}

const TransporterSend=async function(name,email,mobile,msg){
    try{
        const resp=await transporter.sendMail({
            from: '"Raah to Cure" rcft044@gmail.com', // sender address
            to: "rcft044@gmail.com", // list of receivers
            subject: "New Response on Website", // Subject line
            text: `Name:  ${name} Email: ${email} Mobile: ${mobile} Message: ${msg}`, // plain text body
            html: `<b>Name:  ${name} <br/>Email: ${email} <br/>Mobile: ${mobile} <br/>Message: ${msg}</b>`, 

          })

          return true;

    }catch(err){
        return false;
        console.log(err)
    }
}

export {TransporterSend};