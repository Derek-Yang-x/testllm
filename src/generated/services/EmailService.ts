
import { Resend } from 'resend';

export class EmailService {
    private static resend: Resend | null = null;
    private static apiKey: string | null = null;

    private static getResend() {
        if (!this.resend) {
            // SMTP_PASS was used for API key in previous step, but standard env is RESEND_API_KEY
            // Let's support both or check what user has.
            // User put API key in SMTP_PASS in previous step.
            const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;

            if (apiKey && apiKey.startsWith('re_')) {
                this.apiKey = apiKey;
                this.resend = new Resend(apiKey);
            }
        }
        return this.resend;
    }

    static async sendTempPassword(to: string, tempPass: string) {
        const resend = this.getResend();

        if (!resend) {
            console.warn('[EmailService] Resend API Key not found. Simulating email send.');
            console.log(`[EmailService] To: ${to}, Temp Password: ${tempPass}`);
            return;
        }

        try {
            // "onboarding@resend.dev" is default for testing
            // User set SMTP_FROM in .env, use it if available
            const from = process.env.SMTP_FROM || 'onboarding@resend.dev';

            const data = await resend.emails.send({
                from,
                to,
                subject: 'TC Gaming 臨時密碼通知',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>TC Gaming 帳戶安全通知</h2>
                        <p>您好，我們收到了您的密碼重設請求。</p>
                        <p>您的臨時密碼如下：</p>
                        <h3 style="color: #1890ff; background: #e6f7ff; padding: 10px; display: inline-block;">${tempPass}</h3>
                        <p>此密碼將在 <strong>5 分鐘</strong> 後過期。</p>
                        <p>請使用此密碼登入後，系統將要求您設定新的密碼。</p>
                        <hr/>
                        <p style="font-size: 12px; color: #999;">若您未發送此請求，請忽略此郵件。</p>
                    </div>
                `
            });

            if (data.error) {
                console.error('[EmailService] Resend Error:', data.error);
                // Graceful degradation for dev/test
                console.warn('[EmailService] Email failed but continuing flow (Dev Mode).');
            } else {
                console.log(`[EmailService] Message sent: ${data.data?.id}`);
            }
        } catch (error: any) {
            console.error('[EmailService] Error sending email:', error.message);
            console.warn('[EmailService] Unexpected error, continuing flow.');
        }
    }
}
