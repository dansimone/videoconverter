#!/usr/bin/env bash

PROJECT_ID="${PROJECT_ID:?Variable PROJECT_ID must be defined}"
PROJECT_VERSION="${PROJECT_VERSION:?Variable PROJECT_VERSION must be defined}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build -f $SCRIPT_DIR/Dockerfile --build-arg http_proxy=$PROXY --build-arg https_proxy=$PROXY -t \
  gcr.io/$PROJECT_ID/ui-gateway:$PROJECT_VERSION $SCRIPT_DIR
