const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
});

// Helper to format currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price * 1000000); // Assuming price is in millions
};

// Helper to format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const sendBookingNotification = async (booking, recipients) => {
    try {
        const user = process.env.SMTP_USER || process.env.EMAIL_USER;
        if (!user || !recipients || recipients.length === 0) {
            console.log('Skipping email: SMTP_USER/EMAIL_USER not configured or no recipients');
            return;
        }

        const dashboardLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/bookings/${booking._id}`;

        // Professional HTML Template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Booking</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">✨ Yêu Cầu Đặt Phòng</h1>
                    <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Bạn vừa nhận được yêu cầu mới từ website</p>
                </div>

                <div style="padding: 32px 24px;">
                    
                    <!-- Customer Card -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 16px; letter-spacing: 0.5px;">
                            👤 Thông Tin Khách Hàng
                        </div>
                        
                        <!-- Info Row -->
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
                            <span style="font-size: 14px; color: #64748b;">Họ và tên</span>
                            <span style="font-size: 14px; color: #0f172a; font-weight: 600;">${booking.customerName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
                            <span style="font-size: 14px; color: #64748b;">Số điện thoại</span>
                            <a href="tel:${booking.phone}" style="font-size: 14px; color: #2563eb; font-weight: 600; text-decoration: none;">${booking.phone}</a>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 14px; color: #64748b;">Ngân sách / người</span>
                            <span style="font-size: 14px; color: #0f172a; font-weight: 600;">${booking.budgetMax}tr • ${booking.peopleCount} người</span>
                        </div>
                    </div>

                    <!-- Split Columns using Table for best compatibility -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                        <tr>
                            <!-- Schedule Column -->
                            <td width="48%" valign="top">
                                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; height: 100%; box-sizing: border-box;">
                                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 12px;">📅 Lịch Hẹn</div>
                                    
                                    <div style="margin-bottom: 16px;">
                                        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">XEM PHÒNG</div>
                                        <div style="font-size: 18px; color: #2563eb; font-weight: 700;">
                                            ${new Date(booking.viewTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style="font-size: 13px; color: #334155;">
                                            ${new Date(booking.viewTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <div>
                                        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">DỰ KIẾN VÀO</div>
                                        <div style="font-size: 14px; color: #0f172a; font-weight: 600;">${formatDate(booking.moveInDate)}</div>
                                    </div>
                                </div>
                            </td>
                            
                            <!-- Spacer -->
                            <td width="4%"></td>

                            <!-- Room Column -->
                            <td width="48%" valign="top">
                                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; height: 100%; box-sizing: border-box;">
                                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 12px;">🏠 Phòng</div>
                                    
                                    <div style="font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                        ${booking.roomId.title}
                                    </div>

                                    <div style="position: relative; border-radius: 8px; overflow: hidden; height: 100px; background-color: #f1f5f9;">
                                        ${booking.roomId.images && booking.roomId.images[0] ?
                `<img src="${booking.roomId.images[0].url}" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Room" />` :
                `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 12px;">No Image</div>`
            }
                                        <div style="position: absolute; bottom: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-top-left-radius: 6px; font-size: 11px; font-weight: 600;">
                                            ${booking.roomId.priceMonthly} Tr
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Note Box -->
                    ${booking.notes ? `
                    <div style="background-color: #fff1f2; border: 1px solid #fda4af; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #be123c; margin-bottom: 4px;">📝 GHI CHÚ TỪ KHÁCH</div>
                        <div style="color: #881337; font-size: 14px; font-style: italic;">"${booking.notes}"</div>
                    </div>
                    ` : ''}

                    <!-- Button -->
                    <div style="text-align: center;">
                        <a href="${dashboardLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                            Xem Chi Tiết Đặt Phòng
                        </a>
                        <div style="margin-top: 16px; font-size: 12px; color: #64748b;">
                            Hoặc truy cập <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="color: #64748b; text-decoration: underline;">Dashboard</a>
                        </div>
                    </div>

                </div>

                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        Email tự động từ hệ thống Butt Nha Tro<br>
                        © ${new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Nhà Trọ System" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: recipients, // Send to array of admins
            subject: `[MỚI] Đặt phòng từ ${booking.customerName} - ${booking.roomId.roomNumber || 'Phòng trọ'}`,
            html: htmlTemplate,
        });

        console.log(`Booking notification email sent to ${recipients.length} admins:`, recipients);
        return true;
    } catch (error) {
        console.error('Email send failed:', error);
        return false;
    }
};

module.exports = { sendBookingNotification };
