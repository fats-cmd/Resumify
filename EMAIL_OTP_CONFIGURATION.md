# Email OTP Configuration for Resumify

This document explains how to configure Supabase to send OTP codes instead of confirmation links for email verification.

## Overview

By default, Supabase sends confirmation links via email for user verification. However, you can configure it to send 6-digit OTP codes instead, which provides a better user experience for the OTP verification flow implemented in Resumify.

## Configuration Steps

### 1. Access Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### 2. Modify Email Templates

To send OTP codes instead of confirmation links, you need to modify the email templates to use `{{ .Token }}` instead of `{{ .ConfirmationURL }}`.

#### Confirm Signup Template

Replace the default template content with:

```html
<h2>Welcome to Resumify!</h2>

<p>Hello {{ .Data.full_name }}{{ if not .Data.full_name }}{{ .Email }}{{ end }},</p>

<p>Welcome to Resumify! Thank you for creating an account with us.</p>

<p>To complete your registration and start building your professional resume, please enter the following verification code:</p>

<h2 style="font-size: 24px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px;">{{ .Token }}</h2>

<p>Or click the link below to verify your email automatically:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email</a></p>

<p>If the button above doesn't work, you can also use this link: <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't create an account with Resumify, you can safely ignore this email.</p>

<br>
<p>Best regards,<br>
The Resumify Team</p>

<hr>
<p>Resumify - Build Professional Resumes Easily<br>
<a href="https://resumify.example.com">https://resumify.example.com</a></p>
```

### 3. Alternative: Using Only OTP (No Link)

If you want to send only the OTP code without a confirmation link, use this template:

```html
<h2>Welcome to Resumify!</h2>

<p>Hello {{ .Data.full_name }}{{ if not .Data.full_name }}{{ .Email }}{{ end }},</p>

<p>Welcome to Resumify! Thank you for creating an account with us.</p>

<p>To complete your registration and start building your professional resume, please enter the following 6-digit verification code in the app:</p>

<h2 style="font-size: 24px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px;">{{ .Token }}</h2>

<p>This code will expire in 24 hours. If you didn't create an account with Resumify, you can safely ignore this email.</p>

<br>
<p>Best regards,<br>
The Resumify Team</p>

<hr>
<p>Resumify - Build Professional Resumes Easily<br>
<a href="https://resumify.example.com">https://resumify.example.com</a></p>
```

### 4. CSS Styling for OTP Display

To make the OTP code stand out, you can add custom CSS:

```css
.otp-code {
  font-size: 24px;
  font-weight: bold;
  color: #8b5cf6;
  letter-spacing: 8px;
  text-align: center;
  padding: 15px;
  background-color: #f3f4f6;
  border-radius: 8px;
  margin: 20px 0;
}
```

And update the HTML to use the class:

```html
<div class="otp-code">{{ .Token }}</div>
```

## Testing the Configuration

After making these changes:

1. Create a new test account to verify the OTP email is sent
2. Check that the email contains the 6-digit code
3. Test the OTP verification flow in the app
4. Verify that the link still works (if you included it)

## Troubleshooting

If OTP codes are not being sent:

1. Ensure email confirmations are enabled in your Supabase Auth settings
2. Check that the email template includes `{{ .Token }}`
3. Verify that your Supabase project is properly configured for email sending
4. Check Supabase logs for any error messages

## Security Considerations

- OTP codes are 6 digits by default and expire after 24 hours
- The verification process requires both the email and the token
- Supabase handles rate limiting to prevent abuse
- Always use HTTPS in production to protect the OTP codes in transit

## Support

For additional help with email configuration, refer to the [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth/auth-email-templates).