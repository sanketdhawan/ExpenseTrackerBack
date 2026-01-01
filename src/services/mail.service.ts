import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const link = `https://expensetrackerbackend-q4gp.onrender.com/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Trip Expense Manager" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${link}">Verify Email</a>
    `
  });
};


export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Trip Expense Manager" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Your login OTP',
    html: `
      <h2>Login OTP</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing: 4px">${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    `
  });
};
