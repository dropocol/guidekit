export function passwordResetEmailTemplate(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Reset Your Password</h1>
        <p>You've requested to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </p>
        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all;">
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color: #007bff;">${resetUrl}</a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
      </div>
    </body>
    </html>
  `;
}
