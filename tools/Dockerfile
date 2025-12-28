FROM node:18-bullseye

# Install prerequisites
RUN apt-get update && apt-get install -y openjdk-11-jre-headless wget unzip python3-pip curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install sonar-scanner
RUN wget -O /tmp/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip \
  && unzip /tmp/sonar-scanner.zip -d /opt \
  && ln -s /opt/sonar-scanner-*/bin/sonar-scanner /usr/local/bin/sonar-scanner \
  && rm /tmp/sonar-scanner.zip

# Install semgrep
RUN pip3 install --no-cache-dir semgrep

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /workspace

# Ensure scripts directory is available via mounted volume; default command keeps container alive
ENTRYPOINT ["/bin/sh","-c","while sleep 3600; do :; done"]
