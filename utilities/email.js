const axios = require('axios');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.fromName = 'Ayomide Oyewale';
    this.fromEmail = process.env.EMAIL_FROM;
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    if (process.env.NODE_ENV === 'production') {
      // Send via Brevo's HTTPS API (bypasses blocked SMTP ports)
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email: this.to }],
          subject,
          htmlContent: html,
          textContent: convert(html, { wordwrap: 130 }),
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Email sent, message ID:', response.data.messageId);
    } else {
      // Keep SMTP for local dev (Mailtrap, unaffected by Render's restriction)
      const nodemailer = require('nodemailer');
      const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      await transport.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: this.to,
        subject,
        html,
        text: convert(html, { wordwrap: 130 }),
      });
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};
