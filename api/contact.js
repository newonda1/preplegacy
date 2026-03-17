import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, school, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await resend.emails.send({
      from: 'PrepLegacy <onboarding@resend.dev>',
      to: 'nicholasbroom@gmail.com', // 👈 your email
      subject: 'New Demo Request - PrepLegacy',
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>School:</strong> ${school || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error sending email' });
  }
}
