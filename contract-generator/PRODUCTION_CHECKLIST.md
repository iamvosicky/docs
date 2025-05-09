# Production Deployment Checklist

Use this checklist to ensure your Contract Generator application is ready for production deployment on Cloudflare.

## Frontend (Next.js Application)

### Code and Build
- [ ] All features are complete and working as expected
- [ ] Dark mode is functioning correctly
- [ ] Form validation is working properly
- [ ] All pages are responsive and mobile-friendly
- [ ] No console errors or warnings in the browser
- [ ] Build completes successfully with `npm run build`
- [ ] All environment variables are properly set in `.env.production`

### Performance
- [ ] Images are optimized
- [ ] Bundle size is reasonable (check with `npm run analyze`)
- [ ] No unnecessary dependencies
- [ ] Proper code splitting is implemented
- [ ] Lighthouse score is acceptable (Performance, Accessibility, SEO)

### Security
- [ ] No sensitive information in client-side code
- [ ] Authentication is working correctly
- [ ] Authorization checks are in place
- [ ] CSRF protection is implemented
- [ ] Content Security Policy is configured

## Backend (Cloudflare Worker)

### Configuration
- [ ] Database ID is correctly set in `wrangler.toml`
- [ ] R2 bucket is properly configured
- [ ] Queue for PDF processing is set up
- [ ] Environment variables are set in Cloudflare dashboard
- [ ] CORS is properly configured for production domains

### Database
- [ ] Database schema is finalized
- [ ] Migrations are tested and ready
- [ ] Indexes are created for performance
- [ ] Backup strategy is in place

### API
- [ ] All endpoints are tested and working
- [ ] Rate limiting is configured
- [ ] Error handling is comprehensive
- [ ] Logging is set up properly

## PDF Service

- [ ] Service is deployed and accessible
- [ ] Connection to Cloudflare R2 is working
- [ ] PDF generation is tested with various templates
- [ ] Error handling is robust
- [ ] Monitoring is set up

## Deployment Process

### Pre-Deployment
- [ ] Git repository is up to date
- [ ] All changes are committed
- [ ] Feature branches are merged to main
- [ ] Version number is updated (if applicable)
- [ ] Changelog is updated (if applicable)

### Cloudflare Setup
- [ ] Cloudflare account has necessary permissions
- [ ] Workers and Pages are enabled
- [ ] D1 database is created
- [ ] R2 bucket is created
- [ ] Queue is created
- [ ] Custom domain is configured (if applicable)

### Deployment Steps
1. [ ] Deploy the Worker backend
   ```
   cd worker
   wrangler deploy
   ```

2. [ ] Deploy the PDF service
   ```
   cd ../pdf-service
   ./deploy.sh
   ```

3. [ ] Update environment variables with correct URLs
   ```
   # In .env.production
   NEXT_PUBLIC_API_URL=https://contract-generator-worker.yourdomain.workers.dev
   NEXT_PUBLIC_PDF_SERVICE_URL=https://pdf-service.yourdomain.com
   ```

4. [ ] Deploy the frontend
   ```
   cd ..
   npm run build
   npm run pages:deploy
   ```

### Post-Deployment
- [ ] Verify frontend is accessible
- [ ] Test authentication flow
- [ ] Test document generation
- [ ] Test PDF generation and download
- [ ] Check all features in production environment
- [ ] Monitor for errors in Cloudflare dashboard

## Rollback Plan

In case of deployment issues:

1. [ ] Identify the problematic component (frontend, worker, PDF service)
2. [ ] For frontend: Rollback to previous deployment in Cloudflare Pages dashboard
3. [ ] For worker: Rollback to previous version using `wrangler rollback`
4. [ ] For PDF service: Restore previous Docker image
5. [ ] Document the issue and solution for future reference

## Monitoring and Maintenance

- [ ] Set up alerts for errors
- [ ] Configure performance monitoring
- [ ] Schedule regular backups
- [ ] Plan for regular updates and maintenance
- [ ] Document operational procedures

## Final Approval

- [ ] Product owner approval
- [ ] Technical lead approval
- [ ] Security review completed
- [ ] Performance testing completed

---

**Deployment Completed On**: ________________

**Deployed By**: ________________

**Version**: ________________

**Notes**: ________________
