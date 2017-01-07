#!/usr/bin/env bash

PROJECT_ID="${PROJECT_ID:?Variable PROJECT_ID must be defined}"
PROJECT_VERSION="${PROJECT_VERSION:?Variable PROJECT_VERSION must be defined}"

kubectl set image deployment/ui-gateway ui-gateway=gcr.io/$PROJECT_ID/ui-gateway:$PROJECT_VERSION
kubectl set image deployment/catalog-service catalog-service=gcr.io/$PROJECT_ID/catalog-service:$PROJECT_VERSION
kubectl set image deployment/processor-service processor-service=gcr.io/$PROJECT_ID/processor-service:$PROJECT_VERSION
