const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // Create transporter
        // NOTE: Uses Gmail by default. For production, use a dedicated email service (SendGrid, AWS SES, etc.)
        // or configure SMTP settings in .env
        // Create transporter
        let transporterConfig;

        console.log('Email Service Config:', {
            service: process.env.EMAIL_SERVICE,
            user: process.env.EMAIL_USER,
            hasPass: !!process.env.EMAIL_PASS
        });

        if (process.env.EMAIL_SERVICE === 'gmail') {
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            };
        } else {
            // Generic SMTP
            if (!process.env.SMTP_HOST) {
                console.warn('SMTP_HOST not set, defaulting to localhost. This may fail if no local SMTP server is running.');
            }
            transporterConfig = {
                host: process.env.SMTP_HOST || 'localhost',
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        // Define email options
        const mailOptions = {
            from: `Butt Nha Tro <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent blocking the flow, just log it
        // In production, you might want to handle this differently
        return null;
    }
};

module.exports = sendEmail;
