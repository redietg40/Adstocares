import nodemailer from "nodemailer";

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

interface SendVerificationEmailParams {
  toEmail: string;
  otp: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  toEmail,
  otp,
  verificationUrl,
}: SendVerificationEmailParams): Promise<boolean> {
  const fromEmail = process.env.SMTP_FROM || '"Ad2Care Verification" <no-reply@ad2care.com>';
  const subject = `Your Ad2Care Verification Code: ${otp}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 36px 32px; text-align: center; }
          .otp-card { background: #fff7ed; border: 2px dashed #f97316; border-radius: 12px; padding: 20px; margin: 24px 0; display: inline-block; width: 80%; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ea580c; margin: 0; }
          .btn { display: inline-block; background-color: #ea580c; color: #ffffff !important; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ad2Care</h1>
          </div>
          <div class="content">
            <h2 style="font-size: 22px; color: #111827; margin-top: 0;">Verify Your Email Address</h2>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
              Thank you for registering on Ad2Care! Please use the 6-digit code below to complete your registration and verify your email.
            </p>
            <div class="otp-card">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9a3412; margin: 0 0 8px 0; font-weight: 700;">Verification Code</p>
              <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #6b7280;">This code will expire in 15 minutes.</p>
            <div style="margin-top: 28px;">
              <p style="font-size: 14px; color: #4b5563; margin-bottom: 12px;">Or click the button below to verify instantly:</p>
              <a href="${verificationUrl}" target="_blank" class="btn">Verify Email Address</a>
            </div>
          </div>
          <div class="footer">
            If you did not request this email, please ignore it.<br>
            &copy; ${new Date().getFullYear()} Ad2Care Platform. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  console.log("\n=======================================================");
  console.log(`[EMAIL VERIFICATION] To: ${toEmail}`);
  console.log(`[EMAIL VERIFICATION] OTP Code: ${otp}`);
  console.log(`[EMAIL VERIFICATION] Direct Link: ${verificationUrl}`);
  console.log("=======================================================\n");

  const transporter = getTransporter();

  if (!transporter) {
    console.log("[EMAIL VERIFICATION] SMTP variables not fully configured. Email printed to console above.");
    return true;
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log(`[EMAIL VERIFICATION] Email successfully sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[EMAIL VERIFICATION] Failed to send email via SMTP:", error);
    return false;
  }
}
