# End 2 end workshop - CDK - Webapp - RDS - Opensearch - CI/CD

# Workshop preparation

## AWS credentials

## Checkout code from github 

## Create code commit repository

## Push code to repository

## Configure environment variables
export AWS_REGION=aws-region-code (eg. eu-west-1)
export AWS_ACCOUNT_ID=your_account_id (eg. 1234567890)
export CODECOMMIT_REPOSITORY_NAME=your_code_commit_repository_name (the one created above)

## Bootstrap CDK with the right permissions

IMPORTANT : Please note we're giving Administrator access to keep it simple here, please scope down for real usage

cdk bootstrap --trust $AWS_ACCOUNT_ID --trust-for-lookup $AWS_ACCOUNT_ID --cloudformation-execution-policies 'arn:aws:iam::aws:policy/AdministratorAccess' aws://$AWS_ACCOUNT_ID/$AWS_REGION

# Deploy preprod environement

## Baseline stack
cd baseline/iac
npm install
cdk deploy -c envName=preprod

## Infrastructure stack
cd infra/iac
npm install
cdk deploy -c envName=preprod

## Initialize preprod database schema

EC2 instance with SSM

create database myservicepreprod
create table items (id int not null auto_increment, name varchar(50) not null, price int not null, primary key (id));

## API Pipeline

This creates a pipeline building the docker file and deploying to environments. By default, at this stage only preprod will be deployed. Prod stage is commented out in api-container-pipeline.ts, to be deployed in the prod section in the workshop.

cd api-container/iac
npm install
cdk deploy => please not no env here as it is a cross env pipeline

## Check API is working

curl with public URL of API

## Webapp

This creates a pipeline building the reactjs app and deploying to environments. By default, at this stage only preprod will be deployed. Prod stage is commented out in Webapp-pipeline.ts, to be deployed during prod section in the workshop.

cd webapp/iac
npm install
cdk deploy => please note no env here as it is a cross env pipeline

## Check Webapp is working

# Deploy production environement

## Deploy prod stacks 

cd baseline/iac
npm install
cdk deploy -c envName=preprod

cd infra/iac
npm install
cdk deploy -c envName=preprod

## Initialize prod database schema

EC2 instance with SSM

create database myservicepreprod
create table items (id int not null auto_increment, name varchar(50) not null, price int not null, primary key (id));

## Add prod stage to API


and test

## Add prod stage to Webapp

and test

# Additional notes

## public ecr

we're using public ecr instead of dockerhub 

# Gotchas

bucketdeployment when not changed
delete assets buckets when it doesn't work
redeploy bucket deployment stack
pre doesn't work when you want to build but it is probably because of that ??

 CDK Deploy-Step Fails - Lambda Assets not uploaded to S3 after build -- "Error occurred while GetObject. S3 Error Code: NoSuchKey" · Issue #11025 · aws/aws-cdk
 https://github.com/aws/aws-cdk/issues/11025

# going further

security groups open to all VPC
HTTPS
remove sourcemap


## local execution

it is possible to run DB and opensearch locally useting AWS_REGION and providing info on local tooling.

unset AWS_REGION
export OS_LOCAL_USERNAME=
export OS_LOCAL_PASSWORD=
export DB_LOCAL_HOST=
export DB_LOCAL_USERNAME=
export DB_LOCAL_PASSWORD=
export DATABASE_NAME=
export OS_HOSTNAME=
export OS_PORT=

