#! /bin/bash
aws cloudformation create-stack --stack-name refigure --template-body file://./be.template --profile refigure_org --capabilities CAPABILITY_IAM --region us-east-1