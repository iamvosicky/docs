FROM ubuntu:22.04

# Install LibreOffice and dependencies
RUN apt-get update && apt-get install -y \
    libreoffice \
    curl \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start the service
CMD ["node", "index.js"]
