#!/usr/bin/env python3
"""
Lexi Learn - AWS Architecture Diagram (Optimized Layout)
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.network import APIGateway, CloudFront, Route53
from diagrams.aws.security import Cognito, IAM
from diagrams.aws.storage import S3
from diagrams.aws.mobile import Amplify
from diagrams.aws.general import Users
from diagrams.aws.ml import Transcribe, Translate as AWSTranslate, Polly
from diagrams.aws.management import Cloudwatch

# Compact graph attributes
graph_attr = {
    "fontsize": "14",
    "bgcolor": "white",
    "pad": "0.3",
    "splines": "spline",
    "concentrate": "true",
    "nodesep": "0.5",
    "ranksep": "0.8"
}

with Diagram("Lexi Learn - AWS Architecture", 
             filename="lexi-architecture",
             show=False,
             direction="LR",  # Left to Right for better horizontal layout
             outformat="png",
             graph_attr=graph_attr):
    
    users = Users("Users")
    
    with Cluster("Frontend"):
        route53 = Route53("DNS")
        cdn = CloudFront("CDN")
        amplify = Amplify("Next.js")
    
    with Cluster("Auth"):
        cognito = Cognito("Cognito")
        iam = IAM("IAM")
    
    with Cluster("API"):
        api = APIGateway("REST")
        ws = APIGateway("WS")
    
    with Cluster("Lambda Functions"):
        auth = Lambda("Auth")
        flashcard = Lambda("Flashcard")
        scenario = Lambda("Scenario")
        translate = Lambda("Translate")
        speaking = Lambda("Speaking")
    
    with Cluster("AI/ML"):
        aws_translate = AWSTranslate("Translate")
        polly = Polly("Polly")
        transcribe = Transcribe("Transcribe")
    
    with Cluster("Data"):
        db = Dynamodb("DynamoDB")
        s3 = S3("S3")
    
    monitor = Cloudwatch("Logs")
    
    # Flow
    users >> route53 >> cdn >> amplify
    amplify >> cognito >> iam
    amplify >> api >> [auth, flashcard, scenario, translate]
    amplify >> ws >> speaking
    
    translate >> aws_translate
    speaking >> [polly, transcribe]
    
    [auth, flashcard, scenario] >> db
    speaking >> s3
    
    [api, ws, auth, speaking] >> monitor

print("✅ Compact architecture diagram created!")
