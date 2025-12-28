#!/bin/sh
set -eu

# run inside the tools container (working dir /workspace/MonoRepro)
# Requires sonar-scanner installed in the container and SonarQube available at http://sonarqube:9000

WORKDIR=$(pwd)
OUT_DIR="$WORKDIR/tmp/sonar"
mkdir -p "$OUT_DIR"

# wait for SonarQube to be healthy
echo "Waiting for SonarQube..."
until curl -sSf http://sonarqube:9000/api/system/health | grep -q "GREEN"; do
  echo "SonarQube not ready, sleeping 5s"
  sleep 5
done

echo "SonarQube ready"

# default auth for local dev (change to token for production)
SONAR_LOGIN=${SONAR_LOGIN:-admin}
SONAR_PASS=${SONAR_PASS:-admin}
SONAR_URL=${SONAR_URL:-http://sonarqube:9000}

# iterate packages
for pkgdir in packages/*; do
  if [ -d "$pkgdir" ]; then
    pkgname=$(basename "$pkgdir")
    projectKey="mono:$pkgname"
    echo "Scanning $pkgname"

    # set sources to package src or package root if no src
    if [ -d "$pkgdir/src" ]; then
      sources="$pkgdir/src"
    else
      sources="$pkgdir"
    fi

    LOGFILE="$OUT_DIR/$pkgname.log"

    sonar-scanner \
      -Dsonar.projectKey="$projectKey" \
      -Dsonar.sources="$sources" \
      -Dsonar.host.url="$SONAR_URL" \
      -Dsonar.login="$SONAR_LOGIN" \
      -Dsonar.password="$SONAR_PASS" \
      -Dsonar.projectVersion=1.0 \
      -Dsonar.sourceEncoding=UTF-8 > "$LOGFILE" 2>&1 || true

    echo "Finished $pkgname; log: $LOGFILE"
  fi
done

echo "All packages scanned."
