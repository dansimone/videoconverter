#!/usr/bin/env bash

PROJECT_ID="${PROJECT_ID:?Variable PROJECT_ID must be defined}"
PROJECT_VERSION="${PROJECT_VERSION:?Variable PROJECT_VERSION must be defined}"

gcloud docker -- push gcr.io/$PROJECT_ID/catalog-service:$PROJECT_VERSION