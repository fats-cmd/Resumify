# PDF Generation Setup Guide

This guide explains how to set up PDF generation for resume downloads using Puppeteer.

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Required for PDF generation
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# For production: NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key for server-side operations (recommended for production)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Installation

Puppeteer should already be installed in your project. If not, install it:

```bash
npm install puppeteer
# or
yarn add puppeteer
```

## How PDF Generation Works

1. **User clicks "Download PDF"** on the resume page (`/resume/[id]`)
2. **Frontend calls API** at `/api/resume/[id]/pdf`
3. **API authenticates user** using Supabase session token
4. **Puppeteer launches** headless Chrome browser
5. **Browser navigates** to the resume page with authentication
6. **PDF is generated** with print-optimized styles
7. **PDF is returned** to user for download

## API Endpoints

### GET `/api/resume/[id]/pdf`

Generates and returns a PDF of the specified resume.

**Authentication**: Required (Bearer token or cookie)
**Response**: PDF file download
**Content-Type**: `application/pdf`

## PDF Optimization Features

### Print Styles
- Removes navigation, sidebar, and UI elements
- Optimizes typography for print
- Ensures proper page breaks
- Maintains resume formatting

### Browser Configuration
- Optimized for serverless environments
- High DPI rendering for quality
- Proper viewport settings
- Security headers handled

### Error Handling
- Authentication verification
- Resume ownership validation
- Graceful fallbacks for missing content
- Detailed error messages

## Troubleshooting

### Common Issues

#### 1. "Authentication required" error
**Solution**: Make sure user is logged in and has a valid session.

#### 2. "Resume not found" error
**Solutions**:
- Verify the resume ID exists in the database
- Check if the user owns the resume
- Ensure proper authentication

#### 3. PDF generation timeout
**Solutions**:
- Increase timeout values in the API route
- Check if the resume page loads properly
- Verify network connectivity

#### 4. Empty or malformed PDF
**Solutions**:
- Check if resume content has proper selectors
- Verify CSS styles are loading
- Ensure `data-testid="resume-content"` exists

### Development Testing

Test PDF generation locally:

```bash
# Start your development server
npm run dev

# Navigate to a resume page
http://localhost:3000/resume/1

# Click "Download PDF" button
# Check browser console for errors
# Verify network requests in DevTools
```

### Production Considerations

#### Memory Management
Puppeteer can be memory-intensive. Consider:
- Setting memory limits
- Implementing request queuing
- Using serverless functions with sufficient memory

#### Performance
- Cache commonly used browser instances
- Optimize page load times
- Minimize DOM complexity

#### Security
- Validate all inputs
- Sanitize filenames
- Implement rate limiting
- Use service role keys for database access

## Browser Support

### Supported Browsers (for generation)
- Chrome/Chromium (via Puppeteer)
- Headless mode only

### Client Browser Support (for download)
- All modern browsers support PDF downloads
- Mobile browsers included

## Deployment Notes

### Vercel
Puppeteer works on Vercel with some configuration:

```json
// vercel.json
{
  "functions": {
    "app/api/resume/[id]/pdf/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Other Platforms
- Ensure platform supports Puppeteer
- Configure memory limits appropriately
- Set proper timeout values

## File Structure

```
Resumify/
├── app/
│   ├── api/
│   │   └── resume/
│   │       └── [id]/
│   │           └── pdf/
│   │               └── route.ts          # Main PDF API
│   └── resume/
│       └── [id]/
│           ├── page.tsx                  # Resume page with download
│           └── pdf/
│               └── route.ts              # Alternative PDF route
├── lib/
│   └── supabase.ts                       # Auth helper functions
└── README_PDF.md                         # This file
```

## Usage Example

```typescript
// Frontend usage
const handleDownload = async () => {
  const authToken = await getAuthToken();
  
  const response = await fetch(`/api/resume/${id}/pdf`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    // Handle download...
  }
};
```

## Monitoring and Logging

Monitor PDF generation:
- Check API response times
- Monitor memory usage
- Track success/failure rates
- Log authentication issues

For production, consider implementing:
- Request logging
- Error tracking (Sentry, LogRocket)
- Performance monitoring
- Usage analytics

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set
3. Test authentication flow
4. Check network requests in DevTools
5. Review server logs for PDF generation errors

For additional help, refer to:
- [Puppeteer Documentation](https://pptr.dev/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)