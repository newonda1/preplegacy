import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DEMO_REQUEST_TO = 'nicholasbroom@gmail.com';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const school = String(req.body?.school || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailIsValid) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return res.status(500).json({ message: 'Email service is not configured' });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSchool = school ? escapeHtml(school) : 'N/A';
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br>');

    await resend.emails.send({
      from: 'PrepLegacy <onboarding@resend.dev>',
      to: DEMO_REQUEST_TO,
      subject: 'New Demo Request - PrepLegacy',
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>School:</strong> ${safeSchool}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `
    });

    return res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error sending email' });
  }
}
