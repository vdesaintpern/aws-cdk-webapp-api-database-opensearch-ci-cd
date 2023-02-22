---
title: "Organising code and CDK stacks"
date: 2022-12-06T11:37:41Z
draft: false
weight: 2
---

# Organising code and CDK stacks

Resources to be deployed by CDK are organised in stacks. These stacks will contain the needed AWS components of your architecture such as S3 buckets, RDS database, ECS cluster or AWS Lambda. Stacks will also create the CI/CD for you - a pipeline - that will get application code (JS) and build the needed packages such as a zip file or a docker image. 

The [code of this workshop](https://link "Link to code root") has been organised to enhance readability and increase separation of concern. This is intended to give you a baseline for organising your own projects.

## Top level organisation

![New user](code/top-level.png)

At the top level, code has been organised by ownership and lifecycle.

- *baseline* : contains the required resource to initialize the architecture : common secrets and code shared across the differents stacks (constants here).  These elements are likely not updated often
- *infra* : contains the shared components of the architecture such as VPC, database or OpenSearch Domain. These elements are likely not updated often.
- *api* : contains all the resources related to the api, both application code (JS) and infrastructure-as-code (IaC) creating api specific AWS resources such as ECS cluster, AWS Lambda or CI/CD pipeline. This is likely to get frequent updates and short lifecycle.
- *webapp* : contains all the resources related to webapp, both application code and IaC creating webapp specific AWS resources such as S3 bucket or CI/CD pipeline. This is likely to get frequent updates and short lifecycle.

First level of organisation brings immediate benefits :
- Each folder is self-contained and can thus be delegate to specific team or team members
- Each folder has a different lifecycle and can thus be protected if needed from unwanted changes (ex. database)
- Code has clear separations allowing for split into separate repositories in the future if needed

## Code and IaC

Each folder contains 2 specific subfolders:

![New user](code/sub-level.png)

- Code: for application code such as JS code
- IaC: for resources needed on top of shared folders ex: ECS cluster or AWS Lambda

> IaC folder may have dependancies on shared 'infra' stack

### Code

This folder contains application code. This is specific to the kind of project or language used. 

As an example, in this workshop, API is writing in TS and deployed in a container. Thus, code folder contains the following resources.

![New user](code/code-folder.png)

### IaC

This folder contains infrastructure to deploy the code provided. This is specific to the tools used to deploy.

As an example, in this workshop, API is deployed in an ECS cluster with a CodePipeline to build the container and update the cluster. Resources needed are provisioned using CDK.

![New user](code/iac-folder.png)

## CDK Stacks and environments

Stack organisation follows the folder structure to help separate ownership.

In this workshop, we will showcase how to deploy both *with* and *without a pipeline* in 2 environments (test and prod) for illustration purposes :
- baseline and infra stacks will be deployed manually for each environment
- api and webapp stacks will create a pipeline covering both environments

At the end of the workshop, we will get:

- 2 baseline stacks : 1 for test and 1 for prod
- 2 infra stacks : 1 for test and 1 for prod
- api stack : 1 pipeline covering deployment to test and prod
- webapp stack : 1 pipeline covering deployment to test and prod

-- IMG to illustrate

> In real-life, you may chose to have pipelines for all the stacks. This adds an additional process allowing for additional checks.



