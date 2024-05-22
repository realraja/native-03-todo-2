import {createTransport} from 'nodemailer';


export const sendMail = async (email,subject,text)=>{

    const transport = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth:{
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })


    const mailOption = {
        from: 'realllraja@gmail.com',
        to: email,
        subject: subject,
        html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Mr Todo</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Thank you for choosing Mr Todo. Use the following OTP to complete your Sign Up procedures. OTP is valid for life time!</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${text}</h2>
          <p style="font-size:0.9em;">Regards,<br />Mr Todo</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Mr Todo Inc</p>
            <p>1600 Amphitheatre Parkway</p>
            <p>California</p>
          </div>
        </div>
      </div>
    `
    }

    await transport.sendMail(mailOption);
    
}