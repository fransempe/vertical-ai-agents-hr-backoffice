import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to_email, subject, body } = await req.json();

    if (!to_email || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: email_to, subject, body' },
        { status: 400 }
      );
    }

    const emailSenderUrl = process.env.EMAIL_SENDER_URL;
    
    if (!emailSenderUrl) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`${emailSenderUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email,
        subject,
        body
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result,
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}