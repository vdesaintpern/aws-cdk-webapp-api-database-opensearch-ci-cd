---
title: "Prerequisites"
date: 2022-12-06T11:11:41Z
draft: false
weight: 1
---

# Prerequisites

## Install AWS CLI

First, we need to make sure AWS CLI is installed. 

```shell
aws --version # should return a new line starting with "aws-cli/{your local version number}" 
```

If needed, installation procedure for AWS CLI is provided [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html "Install AWS CLI")

## AWS account for experimentation

In this workshop, you will administrator access to an AWS account as we will create various resources such as - but not limited to - S3 buckets, ECS cluster, ECR images, CodeCommit repository or IAM roles. 

> If you are using an existing account, either personal or a company account, make sure you understand the implications and policy of provisioning resources into this account.

if you don't have an AWS account, you can [create a free account here](https://portal.aws.amazon.com/billing/signup "Create a free account here")

1. Sign in to your AWS account
2. Go to the AWS IAM console and [create a new user](https://console.aws.amazon.com/iam/home?#/users$new "Create a new user")
3. Type a name for your user (e.g. cdk-workshop) and choose “Programmatic access”.

![New user](prerequisites/new-user-1.png)

4. Click *Next: Permissions* to continue to the next step
5. Click Attach existing policies directly and choose AdministratorAccess.

![Policies](prerequisites/new-user-2.png)

6. Click Next: Review
7. Click Next: Tags
8. Click Create User
9. In the next screen, you’ll see your Access key ID and you will have the option to click Show to show the Secret access key. Keep this browser window open.

![Credentials](prerequisites/new-user-3.png)

## Configure your credentials 

Open a terminal window and use aws configure to set up your environment. Type the access key ID and secret key and choose a default region (you can use us-east-1, eu-west-1, us-west-2 for example). Preferably use a region that doesn’t have any resources already deployed into it.

```shell
aws configure
```

And fill in the information from the console:

```shell
AWS Access Key ID [None]: <type key ID here>
AWS Secret Access Key [None]: <type access key>
Default region name [None]: <choose region (e.g. "us-east-1", "eu-west-1")>
Default output format [None]: <leave blank>
```

## Install CDK locally

As we will be using CDK Toolkit (cdk command) throughout the workshop, we need to install it. We will install it with npm (Node Package Manager) <a href="https://docs.aws.amazon.com/cdk/v2/guide/cli.html">as documented in the official documentation</a>.

```shell
npm install -g aws-cdk             # install latest version
npm install -g aws-cdk@X.YY.Z      # install specific version
```

> This workshop has been tested with version 2 of CDK and we recommend to use the latest CDK v2 available.

## Bootstrap CDK

(TODO)

