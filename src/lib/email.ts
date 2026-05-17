import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.qq.com",
  port: Number(process.env.SMTP_PORT) ?? 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(
  to: string,
  code: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "CivilPomo 登录验证码",
      html: `<p>你的 CivilPomo 登录验证码是：<b style="font-size:24px;letter-spacing:4px">${code}</b></p><p>5 分钟内有效。</p>`,
    });
    return true;
  } catch {
    return false;
  }
}
