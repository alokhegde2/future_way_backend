const nodemailer = require("nodemailer");
const logger = require("./logger");

const sendMail = async (toEmail, name, href, mailType, subject) => {
  var mailTemplates = {
    "account-created": `<!DOCTYPE html>
        <html lang="en">
           <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <link href="https://fonts.googleapis.com/css?family=Karla:400,700&display=swap" rel="stylesheet">
          <title>Account Created</title>
          <style type="text/css">
            body {
              margin: 0;
              padding: 0;
              font-family: 'Karla', sans-serif;
            }
           table,
            td,
            tr {
              vertical-align: top;
              border-collapse: collapse;
              
            }
           * {
              line-height: inherit;
              margin: 0;
              padding: 0;
            }
        
        
        
           h1 {
              width: 100%;
            }
        
        
        
           p {
              font-weight: 500;
              width: 100%;
            }
        
        
        
           span {
              color: #7A869A;
            }
        
        
        
           r-pd {
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
        
        
        
           @media only screen and (min-width:620px) {
              .main-content {
                width: 90% !important;
              }
        
        
        
             .big-graph {
                width: 150px !important;
                height: 150px !important;
                margin-left: 50px !important;
              }
        
        
        
             p {
                line-height: 28px;
              }
        
        
        
             r-pd {
                padding-left: 2rem !important;
                padding-right: 2rem !important;
              }
            }
        
        
        
           @media only screen and (min-width:760px) {
              .main-content {
                width: 740px !important;
              }
            }
        
        
        
           a {
              color: #0081C2;
              text-decoration: none
            }
          </style>
        </head>
        
        
        
        <body style="background: #F1F2F0; padding: 3rem 0;">
          <section class="main-content" style="margin: 0 auto; width: 95%;">
            <table class="bord" style="background: #41424E; width: 100%; height: 5px; border-radius: 0 0 5px 5px;"></table>
            <div style="width: 100%; padding-top: 3rem;background-color: #ffffff; box-sizing: border-box;">
              <table>
                <tbody style="width: 100%;">
                  <tr>
                    <td>
                      <div class="r-pd" style="padding: 1rem 2rem; padding-bottom: 0; width: 100%; box-sizing: border-box;">
                        <h1 style="font-size: 30px; color: #222D23 ; font-family:  'Karla', sans-serif; margin-bottom: 1rem; text-align: center;">
                          You're account got created !
                        </h1>
                        <p style="padding: 1rem 0; width: 100%; font-family: 'Karla', sans-serif; font-size: 16px; color:  #7A869A; font-weight: 400; padding-bottom: 3rem; line-height: 28px">
                          Hello,
                          <br>
                          You're Future Way account created successfully. Please click on the below link to verify your email id and to activate the account
             </p>
             <center>
                <a href="${href}">Click Here</a>  
             </center>
               
             <br/> 
             <br/> 
        <p style="padding: 1rem 0; width: 100%; font-family: 'Karla', sans-serif; font-size: 16px; color:  #7A869A; font-weight: 400; border-top: 1px solid #F2F4F6; padding-bottom: 3rem; line-height: 28px; text-align: center;">
                           If you did not request this setup, please ignore this email.</p>
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="background-color: #41424E; width: 100%;">
              <table style="width: 100%;">
                <tr>
                  <td>
                    <div style="padding: 3rem; color: #FFFFFF">
                      <p style="font-size: 14px; display: inline;">
                        <span style="color: #FFFFFF">Mailing Address:</span>
                        <br>
                        <span style="color: #ffffff;">Future Way
                            
                            </span>
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; text-align: left">80, 5th cross, BEML layout, Basveshwarnagar,</p>
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; text-align: left">near veerbhadra theatre , Bangalore Karnataka 560079</p>
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; text-align: left"><a href="">info@futureway.org.in</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="">+91 960 631 1775</a>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </section>
        </body>`,

    "forgot-password": `<!DOCTYPE html>
        <html lang="en">
           <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <link href="https://fonts.googleapis.com/css?family=Karla:400,700&display=swap" rel="stylesheet">
          <title>Account Created</title>
          <style type="text/css">
            body {
              margin: 0;
              padding: 0;
              font-family: 'Karla', sans-serif;
            }
           table,
            td,
            tr {
              vertical-align: top;
              border-collapse: collapse;
              
            }
           * {
              line-height: inherit;
              margin: 0;
              padding: 0;
            }
        
        
        
           h1 {
              width: 100%;
            }
        
        
        
           p {
              font-weight: 500;
              width: 100%;
            }
        
        
        
           span {
              color: #7A869A;
            }
        
        
        
           r-pd {
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
        
        
        
           @media only screen and (min-width:620px) {
              .main-content {
                width: 90% !important;
              }
        
        
        
             .big-graph {
                width: 150px !important;
                height: 150px !important;
                margin-left: 50px !important;
              }
        
        
        
             p {
                line-height: 28px;
              }
        
        
        
             r-pd {
                padding-left: 2rem !important;
                padding-right: 2rem !important;
              }
            }
        
        
        
           @media only screen and (min-width:760px) {
              .main-content {
                width: 740px !important;
              }
            }
        
        
        
           a {
              color: #0081C2;
              text-decoration: none
            }
          </style>
        </head>
        
        
        
        <body style="background: #F1F2F0; padding: 3rem 0;">
          <section class="main-content" style="margin: 0 auto; width: 95%;">
            <table class="bord" style="background: #41424E; width: 100%; height: 5px; border-radius: 0 0 5px 5px;"></table>
            <div style="width: 100%; padding-top: 3rem;background-color: #ffffff; box-sizing: border-box;">
              <table>
                <tbody style="width: 100%;">
                  <tr>
                    <td>
                      <div class="r-pd" style="padding: 1rem 2rem; padding-bottom: 0; width: 100%; box-sizing: border-box;">
                        <h1 style="font-size: 30px; color: #222D23 ; font-family:  'Karla', sans-serif; margin-bottom: 1rem; text-align: center;">
                          Did you forgot you're password?? Reset Here!
                        </h1>
                        <p style="padding: 1rem 0; width: 100%; font-family: 'Karla', sans-serif; font-size: 16px; color:  #7A869A; font-weight: 400; padding-bottom: 3rem; line-height: 28px">
                          Hello,
                          <br>
                          Click on the below link to reset your password. This will expire in 7 days.
             </p>
             <center>
                <a href="${href}">Click Here</a>  
             </center>
               
             <br/> 
             <br/> 
        <p style="padding: 1rem 0; width: 100%; font-family: 'Karla', sans-serif; font-size: 16px; color:  #7A869A; font-weight: 400; border-top: 1px solid #F2F4F6; padding-bottom: 3rem; line-height: 28px; text-align: center;">
                           If you did not request this setup, please ignore this email.</p>
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="background-color: #41424E; width: 100%;">
              <table style="width: 100%;">
                <tr>
                  <td>
                    <div style="padding: 3rem; color: #FFFFFF">
                      <p style="font-size: 14px; display: inline;">
                        <span style="color: #FFFFFF">Mailing Address:</span>
                        <br>
                        <span style="color: #ffffff;">Future Way
                            
                            </span>
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; text-align: left">80, 5th cross, BEML layout, Basveshwarnagar,</p>
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; text-align: left">near veerbhadra theatre , Bangalore Karnataka 560079</p>
                      <p style="margin: 0; font-size: 14px; color: #FFFFFF; text-align: left"><a href="">info@futureway.org.in</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="">+91 960 631 1775</a>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </section>
        </body>`,
  };

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "support@futurewaylearning.com", // your domain email address
      pass: "giwgi5-hehjez-wectAb", // your password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Future Way" <support@futurewaylearning.com>', // sender address
    to: `${toEmail}`, // list of receivers
    bcc: "alokhegde2@gmail.com", //TODO: Remove while production
    subject: "Hurray!!! Your Account Created Successfully 🎉", // Subject line
    html: mailTemplates[`${mailType}`], // html body
  });

  logger.log({
    level: "info",
    message: `Message sent: ${info.messageId}, To Email: ${toEmail}, Subject: ${subject}, Mail Type: ${mailType}`,
  });
};

module.exports = sendMail;
