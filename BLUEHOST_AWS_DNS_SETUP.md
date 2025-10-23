# Bluehost to AWS Domain Configuration Guide

## 1. Get AWS CloudFront/Load Balancer Details

Before making changes in Bluehost, get these values from AWS:
1. Your CloudFront distribution domain name (e.g., d1234abcd.cloudfront.net)
2. Your Application Load Balancer DNS name (e.g., your-alb-123456789.region.elb.amazonaws.com)

## 2. Bluehost DNS Configuration

### Step 1: Login to Bluehost
1. Go to Bluehost control panel
2. Navigate to "Domains" → "DNS"

### Step 2: Update DNS Records
Add these records in Bluehost DNS management:

```
# Main domain CNAME record
Type: CNAME
Host: www
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

# Root domain A record (if needed)
Type: A
Host: @
Points to: [Your Load Balancer IP]
TTL: 4 hours

# Subdomain CNAME records
Type: CNAME
Host: courses
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

Type: CNAME
Host: jobs
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

Type: CNAME
Host: events
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

Type: CNAME
Host: workshops
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

Type: CNAME
Host: blogs
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

Type: CNAME
Host: discussions
Points to: [Your CloudFront Distribution URL]
TTL: 4 hours

Type: CNAME
Host: api
Points to: [Your Load Balancer DNS]
TTL: 4 hours
```

### Step 3: SSL Configuration
1. Request SSL certificate in AWS Certificate Manager:
   - Include your main domain and all subdomains
   - Use DNS validation method

2. Add these DNS records in Bluehost for SSL validation:
   - Copy the CNAME records provided by AWS Certificate Manager
   - Add them to your Bluehost DNS management
   - Wait for validation to complete (can take up to 24 hours)

## 3. Important Settings

### Nameservers
Keep your nameservers at Bluehost. We're only adding DNS records, not transferring the domain.

### DNS Propagation
- DNS changes can take 24-48 hours to propagate globally
- You can check propagation using:
  ```bash
  dig courses.yourdomain.com
  dig api.yourdomain.com
  ```

### Email Configuration
If you're using Bluehost email services:
1. Keep existing MX records
2. Keep existing email-related TXT records
3. Don't modify any existing email-related CNAME records

## 4. Verification Steps

After DNS propagation (24-48 hours), verify:

1. Main website access:
   ```
   https://www.yourdomain.com
   https://yourdomain.com
   ```

2. Subdomain access:
   ```
   https://courses.yourdomain.com
   https://jobs.yourdomain.com
   https://events.yourdomain.com
   https://workshops.yourdomain.com
   https://blogs.yourdomain.com
   https://discussions.yourdomain.com
   https://api.yourdomain.com
   ```

3. SSL certificate validity for all domains

## 5. Troubleshooting

### Common Issues:

1. SSL Certificate Not Working
   - Verify DNS validation records in Bluehost
   - Check certificate status in AWS Certificate Manager
   - Ensure CloudFront is using the correct certificate

2. Subdomains Not Resolving
   - Verify CNAME records in Bluehost
   - Check CloudFront distribution settings
   - Confirm load balancer health

3. API Not Accessible
   - Verify API subdomain CNAME record
   - Check load balancer health
   - Confirm security group settings

### DNS Verification Commands
```bash
# Check domain resolution
nslookup yourdomain.com

# Check specific subdomain
nslookup courses.yourdomain.com

# Verify DNS propagation
dig +trace yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

## 6. Monitoring

1. Set up health checks in Route 53 for:
   - Main domain
   - All subdomains
   - API endpoint

2. Create CloudWatch alarms for:
   - DNS resolution issues
   - SSL certificate expiration
   - Load balancer health

## 7. Backup Plan

1. Keep a copy of all DNS records
2. Document all AWS resource endpoints
3. Save SSL certificate details
4. Maintain emergency contact information for both Bluehost and AWS support