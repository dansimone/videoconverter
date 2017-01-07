#!/usr/bin/env bash

PROJECT_ID="${PROJECT_ID:?Variable PROJECT_ID must be defined}"
PROJECT_VERSION="${PROJECT_VERSION:?Variable PROJECT_VERSION must be defined}"

gcloud.cmd docker -- push gcr.io/$PROJECT_ID/ui-gateway:$PROJECT_VERSION