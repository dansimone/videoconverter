#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$SCRIPT_DIR/ui-gateway/build-docker.sh
$SCRIPT_DIR/catalog-service/build-docker.sh
$SCRIPT_DIR/processor-service/build-docker.sh
