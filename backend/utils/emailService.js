const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporters = [];
    this.initializeTransporters();
  }

  initializeTransporters() {
    // Brevo (Sendinblue) - Most reliable for production
    if (process.env.BREVO_API_KEY) {
      this.transporters.push({
        name: 'Brevo',
        transporter: nodemailer.createTransport({
          host: 'smtp-relay.brevo.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.BREVO_EMAIL,
            pass: process.env.BREVO_API_KEY
          }
        })
      });
    }

    // Gmail fallback
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporters.push({
        name: 'Gmail',
        transporter: nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: { rejectUnauthorized: false }
        })
      });
    }

    // Ethereal for testing
    this.transporters.push({
      name: 'Ethereal',
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      })
    });
  }

  async sendEmail(emailOptions) {
    for (const { name, transporter } of this.transporters) {
      try {
        const result = await Promise.race([
          transporter.sendMail(emailOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);
        
        console.log(`✅ Email sent successfully via ${name}`);
        return { success: true, service: name, result };
      } catch (error) {
        console.log(`❌ ${name} failed: ${error.message}`);
        continue;
      }
    }
    
    console.log('❌ All email services failed');
    return { success: false, error: 'All email services failed' };
  }

  async sendVerificationEmail(email, code) {
    const emailOptions = {
      from: process.env.BREVO_EMAIL || process.env.EMAIL_USER || 'noreply@lifelink.com',
      to: email,
      subject: 'LifeLink Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Welcome to LifeLink!</h2>
          <p>Thank you for registering with LifeLink - Blood Donation Platform.</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #ef4444; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p><strong>This code will expire in 5 minutes.</strong></p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">LifeLink - Saving lives, one donation at a time.</p>
        </div>
      `
    };

    return await this.sendEmail(emailOptions);
  }
}

module.exports = new EmailService();