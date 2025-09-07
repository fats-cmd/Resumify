# Email Customization for Resumify

This document explains how to customize the email templates for Resumify using the Supabase dashboard.

## Overview

Resumify uses Supabase for authentication, which includes built-in email services for:
- User registration confirmation
- Password reset
- Email verification

These emails can be customized with Resumify branding through the Supabase dashboard.

## Customization Steps

### 1. Access Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### 2. Customize Email Templates

#### Sign-up Confirmation Email

**Subject:** Welcome to Resumify - Verify Your Email

**Template:**
```html
<h2>Welcome to Resumify!</h2>

<p>Hello {{ .User.email }},</p>

<p>Welcome to Resumify! Thank you for creating an account with us.</p>

<p>To complete your registration and start building your professional resume, please verify your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" class="button">Verify Email</a></p>

<p>Or use this link: <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't create an account with Resumify, you can safely ignore this email.</p>

<br>
<p>Best regards,<br>
The Resumify Team</p>

<hr>
<p>Resumify - Build Professional Resumes Easily<br>
<a href="https://resumify.example.com">https://resumify.example.com</a></p>
```

#### Password Reset Email

**Subject:** Resumify - Password Reset Request

**Template:**
```html
<h2>Password Reset Request</h2>

<p>Hello {{ .User.email }},</p>

<p>We received a request to reset your Resumify password. If you made this request, click the button below to set a new password:</p>

<p><a href="{{ .ConfirmationURL }}" class="button">Reset Password</a></p>

<p>Or use this link: <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.</p>

<br>
<p>Best regards,<br>
The Resumify Team</p>

<hr>
<p>Resumify - Build Professional Resumes Easily<br>
<a href="https://resumify.example.com">https://resumify.example.com</a></p>
```

#### Email Change Confirmation

**Subject:** Resumify - Confirm Email Change

**Template:**
```html
<h2>Confirm Email Change</h2>

<p>Hello {{ .User.email }},</p>

<p>You have requested to change your email address for your Resumify account. To confirm this change, please click the button below:</p>

<p><a href="{{ .ConfirmationURL }}" class="button">Confirm Email Change</a></p>

<p>Or use this link: <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't request this change, you can safely ignore this email.</p>

<br>
<p>Best regards,<br>
The Resumify Team</p>

<hr>
<p>Resumify - Build Professional Resumes Easily<br>
<a href="https://resumify.example.com">https://resumify.example.com</a></p>
```

### 3. Branding Customization

In the Supabase email template settings, you can also customize:

- **Sender Name:** Resumify
- **Sender Email:** noreply@resumify.example.com (or your custom domain)
- **Logo:** Upload the Resumify logo
- **Company Name:** Resumify
- **Company Address:** Your company address (if required)

### 4. CSS Styling

You can add custom CSS to match Resumify's branding:

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8fafc;
  color: #334155;
  line-height: 1.6;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #8b5cf6;
  margin-bottom: 20px;
}

.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #8b5cf6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 20px 0;
}

.button:hover {
  background-color: #7c3aed;
}

hr {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #e2e8f0;
}

a {
  color: #8b5cf6;
}

a:hover {
  color: #7c3aed;
}
```

## Testing Emails

After customization:

1. Create a test account to verify sign-up emails
2. Use the "Forgot Password" feature to test password reset emails
3. Check all emails for proper branding and functionality

## Custom Email Service (Optional)

If you want to use a custom email service (like SendGrid or Mailgun):

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider settings
3. Update the email templates as needed

## Troubleshooting

If emails are not being sent:

1. Check that your Supabase project is properly configured
2. Verify that email sending is enabled in your Supabase settings
3. Check your domain's SPF and DKIM records if using custom domains
4. Review Supabase logs for any error messages

## Support

For additional help with email customization, refer to the [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth/auth-email-templates).