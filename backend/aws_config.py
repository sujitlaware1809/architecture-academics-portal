"""
AWS Configuration and Setup Script
"""
import os
import boto3
from botocore.exceptions import ClientError
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# AWS Credentials and Region
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

# S3 Configuration
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'architecture-academics-files')
S3_BUCKET_REGION = AWS_REGION

# RDS Configuration
DB_INSTANCE_IDENTIFIER = 'architecture-academics-db'
DB_NAME = 'architecture_academics'
DB_USERNAME = os.getenv('DB_USERNAME', 'admin')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = 5432

class AWSManager:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        
        self.rds_client = boto3.client(
            'rds',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )

    def create_s3_bucket(self):
        """Create S3 bucket if it doesn't exist"""
        try:
            location = {'LocationConstraint': S3_BUCKET_REGION}
            self.s3_client.create_bucket(
                Bucket=S3_BUCKET_NAME,
                CreateBucketConfiguration=location
            )
            print(f"✅ Created S3 bucket: {S3_BUCKET_NAME}")
            
            # Configure bucket for website hosting
            self.s3_client.put_bucket_cors(
                Bucket=S3_BUCKET_NAME,
                CORSConfiguration={
                    'CORSRules': [
                        {
                            'AllowedHeaders': ['*'],
                            'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                            'AllowedOrigins': ['*'],
                            'ExposeHeaders': []
                        }
                    ]
                }
            )
            print("✅ Configured S3 bucket CORS policy")
            
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
                print(f"ℹ️ S3 bucket {S3_BUCKET_NAME} already exists")
                return True
            print(f"❌ Error creating S3 bucket: {e}")
            return False

    def create_rds_instance(self):
        """Create RDS PostgreSQL instance if it doesn't exist"""
        try:
            response = self.rds_client.describe_db_instances(
                DBInstanceIdentifier=DB_INSTANCE_IDENTIFIER
            )
            print(f"ℹ️ RDS instance {DB_INSTANCE_IDENTIFIER} already exists")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == 'DBInstanceNotFound':
                try:
                    self.rds_client.create_db_instance(
                        DBInstanceIdentifier=DB_INSTANCE_IDENTIFIER,
                        DBName=DB_NAME,
                        Engine='postgres',
                        EngineVersion='13.7',
                        DBInstanceClass='db.t3.micro',  # Free tier eligible
                        MasterUsername=DB_USERNAME,
                        MasterUserPassword=DB_PASSWORD,
                        AllocatedStorage=20,  # 20GB storage
                        PubliclyAccessible=True,
                        VpcSecurityGroupIds=[],  # Add your security group IDs
                        AvailabilityZone=f'{AWS_REGION}a',
                        Port=DB_PORT,
                        BackupRetentionPeriod=7,  # 7 days backup retention
                        MultiAZ=False,  # Set to True for production
                        AutoMinorVersionUpgrade=True,
                        Tags=[
                            {
                                'Key': 'Project',
                                'Value': 'Architecture Academics'
                            }
                        ]
                    )
                    print(f"✅ Created RDS instance: {DB_INSTANCE_IDENTIFIER}")
                    return True
                except ClientError as create_error:
                    print(f"❌ Error creating RDS instance: {create_error}")
                    return False
            print(f"❌ Error checking RDS instance: {e}")
            return False

    def get_rds_endpoint(self):
        """Get the endpoint for the RDS instance"""
        try:
            response = self.rds_client.describe_db_instances(
                DBInstanceIdentifier=DB_INSTANCE_IDENTIFIER
            )
            endpoint = response['DBInstances'][0]['Endpoint']
            return {
                'host': endpoint['Address'],
                'port': endpoint['Port']
            }
        except ClientError as e:
            print(f"❌ Error getting RDS endpoint: {e}")
            return None

    def test_database_connection(self, host):
        """Test the connection to the RDS database"""
        try:
            conn = psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USERNAME,
                password=DB_PASSWORD,
                host=host,
                port=DB_PORT
            )
            conn.close()
            print("✅ Successfully connected to RDS database")
            return True
        except Exception as e:
            print(f"❌ Error connecting to database: {e}")
            return False

def setup_aws_infrastructure():
    """Set up all required AWS infrastructure"""
    aws = AWSManager()
    
    # Create S3 bucket
    if not aws.create_s3_bucket():
        print("❌ Failed to set up S3 bucket")
        return False
    
    # Create RDS instance
    if not aws.create_rds_instance():
        print("❌ Failed to set up RDS instance")
        return False
    
    # Wait for RDS instance to be available
    print("⏳ Waiting for RDS instance to be available (this may take several minutes)...")
    waiter = aws.rds_client.get_waiter('db_instance_available')
    try:
        waiter.wait(
            DBInstanceIdentifier=DB_INSTANCE_IDENTIFIER,
            WaiterConfig={'Delay': 30, 'MaxAttempts': 60}
        )
    except Exception as e:
        print(f"❌ Error waiting for RDS instance: {e}")
        return False
    
    # Get RDS endpoint
    endpoint = aws.get_rds_endpoint()
    if not endpoint:
        print("❌ Failed to get RDS endpoint")
        return False
    
    # Test database connection
    if not aws.test_database_connection(endpoint['host']):
        print("❌ Failed to connect to database")
        return False
    
    # Return connection details
    return {
        'database_url': f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{endpoint['host']}:{endpoint['port']}/{DB_NAME}",
        's3_bucket': S3_BUCKET_NAME,
        'region': AWS_REGION
    }

if __name__ == "__main__":
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        print("❌ AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.")
        exit(1)
        
    if not DB_PASSWORD:
        print("❌ Database password not set. Please set DB_PASSWORD environment variable.")
        exit(1)
        
    print("🚀 Setting up AWS infrastructure...")
    result = setup_aws_infrastructure()
    
    if result:
        print("\n✅ AWS infrastructure setup complete!")
        print("\nConfiguration Details:")
        print(f"Database URL: {result['database_url']}")
        print(f"S3 Bucket: {result['s3_bucket']}")
        print(f"AWS Region: {result['region']}")
        
        print("\n📝 Next steps:")
        print("1. Update your .env file with these values")
        print("2. Update database.py to use the new PostgreSQL connection")
        print("3. Run database migrations")
        print("4. Test the application")
    else:
        print("\n❌ AWS infrastructure setup failed. Please check the errors above.")