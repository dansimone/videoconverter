#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$SCRIPT_DIR/ui-gateway/push-gcloud.sh
$SCRIPT_DIR/catalog-service/push-gcloud.sh
$SCRIPT_DIR/processor-service/push-gcloud.sh