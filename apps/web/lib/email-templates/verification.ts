export const verificationEmailTemplate = (verificationUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verify Your Email</h1>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
        </p>
        <p>If you didn't request this verification, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
    </div>
</body>
</html>
`;
