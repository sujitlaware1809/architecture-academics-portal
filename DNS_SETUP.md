# DNS Configuration Guide for Subdomain Setup

## Domain: architectureacademics.online

### DNS Records to Create

1. Root Domain (@ or apex record):
```
Type: A
Name: @
Value: [Your server IP]
TTL: 3600
```

2. www Subdomain:
```
Type: A
Name: www
Value: [Your server IP]
TTL: 3600
```

3. Subdomains for Different Sections:
```
Type: A or CNAME
Name: courses
Value: [Your server IP] or [Your domain]
TTL: 3600

Type: A or CNAME
Name: jobs
Value: [Your server IP] or [Your domain]
TTL: 3600

Type: A or CNAME
Name: events
Value: [Your server IP] or [Your domain]
TTL: 3600

Type: A or CNAME
Name: workshops
Value: [Your server IP] or [Your domain]
TTL: 3600

Type: A or CNAME
Name: blogs
Value: [Your server IP] or [Your domain]
TTL: 3600

Type: A or CNAME
Name: discussions
Value: [Your server IP] or [Your domain]
TTL: 3600
```

4. Wildcard Subdomain (Optional but recommended):
```
Type: A or CNAME
Name: *
Value: [Your server IP] or [Your domain]
TTL: 3600
```

## Nginx Configuration

Add this configuration to your Nginx server block:

```nginx
# Main domain
server {
    listen 80;
    server_name architectureacademics.online www.architectureacademics.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Subdomains
server {
    listen 80;
    server_name *.architectureacademics.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL Configuration (Required for Production)

1. Install Certbot:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificates:
```bash
sudo certbot --nginx -d architectureacademics.online -d www.architectureacademics.online -d courses.architectureacademics.online -d jobs.architectureacademics.online -d events.architectureacademics.online -d workshops.architectureacademics.online -d blogs.architectureacademics.online -d discussions.architectureacademics.online
```

## Environment Variables

Update your `.env.local` file:

```bash
NEXT_PUBLIC_ROOT_DOMAIN=.architectureacademics.online
NEXT_PUBLIC_API_URL=https://api.architectureacademics.online
NEXTAUTH_URL=https://architectureacademics.online
```

## Verifying Setup

1. Test DNS propagation:
```bash
dig courses.architectureacademics.online
dig jobs.architectureacademics.online
dig events.architectureacademics.online
```

2. Test SSL certificates:
```bash
curl -vI https://courses.architectureacademics.online
curl -vI https://jobs.architectureacademics.online
curl -vI https://events.architectureacademics.online
```

## Testing Local Development

Add these entries to your hosts file (`/etc/hosts` on Linux/Mac or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1 architectureacademics.local
127.0.0.1 courses.architectureacademics.local
127.0.0.1 jobs.architectureacademics.local
127.0.0.1 events.architectureacademics.local
127.0.0.1 workshops.architectureacademics.local
127.0.0.1 blogs.architectureacademics.local
127.0.0.1 discussions.architectureacademics.local
```

## Troubleshooting

1. DNS Issues:
   - Use `dig` or `nslookup` to verify DNS resolution
   - Check DNS propagation at https://dnschecker.org
   - TTL values may require up to 48 hours for full propagation

2. SSL Issues:
   - Verify certificates: `sudo certbot certificates`
   - Test SSL configuration: https://www.ssllabs.com/ssltest/
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

3. Application Issues:
   - Check Next.js server logs
   - Verify environment variables
   - Test both HTTP and HTTPS access
   - Check browser console for CORS errors

## Security Recommendations

1. Enable HSTS:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

2. Configure security headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

3. Set up rate limiting:
```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
location / {
    limit_req zone=one burst=10 nodelay;
    proxy_pass http://localhost:3000;
    # ... other proxy settings
}
```