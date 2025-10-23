# AWS Subdomain Setup Guide

## 1. Domain and DNS Configuration

Since your domain is managed in Bluehost:
1. Keep domain registration with Bluehost
2. Create a public hosted zone in Route 53 (for AWS services)
3. Configure DNS records in Bluehost (see BLUEHOST_AWS_DNS_SETUP.md)
4. Set up subdomains in CloudFront:

```
Type: A Record
Name: courses.architectureacademics.com
Value: [Your CloudFront Distribution IP]
```

Repeat for all subdomains:
- jobs.architectureacademics.com
- events.architectureacademics.com
- workshops.architectureacademics.com
- blogs.architectureacademics.com
- discussions.architectureacademics.com
- api.architectureacademics.com

## 2. SSL/TLS Certificate

1. Request certificate in AWS Certificate Manager:
   ```
   *.architectureacademics.com
   architectureacademics.com
   ```

2. Validate domain ownership through Route 53 (automatic)

## 3. CloudFront Distribution

1. Create a new distribution:
   - Origin: Your ECS/EKS/EC2 origin
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Alternate Domain Names: Add all subdomains
   - SSL Certificate: Select the one created above

2. Create origin request policies for different subdomains

## 4. ECS/EKS Setup

### Task Definition
```json
{
  "family": "architecture-academics",
  "containerDefinitions": [
    {
      "name": "nextjs-app",
      "image": "your-ecr-repo/architecture-academics:latest",
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://api.architectureacademics.com"
        },
        {
          "name": "NEXT_PUBLIC_ROOT_DOMAIN",
          "value": ".architectureacademics.com"
        }
      ],
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ]
    }
  ]
}
```

### Service Configuration
- Task Count: 2 (minimum)
- Auto Scaling: 2-10 tasks based on CPU/Memory
- Load Balancer: Application Load Balancer
- Health Check Path: /api/health

## 5. Load Balancer Setup

1. Create Application Load Balancer:
   - Listeners: HTTPS:443
   - Target Groups: Your ECS services
   - SSL Certificate: From ACM

2. Configure routing rules for subdomains:
   ```
   IF host-header = courses.architectureacademics.com
   THEN forward to courses-target-group
   ```

## 6. Security Groups

1. Load Balancer Security Group:
   - Inbound: HTTPS (443) from anywhere
   - Outbound: All traffic to ECS Security Group

2. ECS Security Group:
   - Inbound: All traffic from ALB Security Group
   - Outbound: All traffic

## 7. Environment Variables for Production

```env
# Frontend
NEXT_PUBLIC_API_URL=https://api.architectureacademics.com
NEXT_PUBLIC_ROOT_DOMAIN=.architectureacademics.com
NEXT_PUBLIC_ENVIRONMENT=production

# Backend
DATABASE_URL=your-rds-connection-string
JWT_SECRET=your-production-secret
CORS_ORIGINS=https://courses.architectureacademics.com,https://jobs.architectureacademics.com,https://events.architectureacademics.com,https://workshops.architectureacademics.com,https://blogs.architectureacademics.com,https://discussions.architectureacademics.com
```

## 8. CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: your-region

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: architecture-academics
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Update ECS service
        run: |
          aws ecs update-service --cluster your-cluster --service your-service --force-new-deployment
```

## 9. DNS Propagation

After setup, wait for DNS propagation (usually 24-48 hours). You can verify with:
```bash
dig courses.architectureacademics.com
dig api.architectureacademics.com
```

## 10. Monitoring Setup

1. Set up CloudWatch dashboards for:
   - ALB metrics
   - ECS service metrics
   - Route 53 health checks

2. Create alarms for:
   - 5xx errors
   - High latency
   - CPU/Memory utilization

## 11. Backup and Disaster Recovery

1. Set up RDS automated backups
2. Create AMIs of any EC2 instances
3. Store static assets in S3 with versioning enabled
4. Document failover procedures