FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build React frontend
RUN npm run client:build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]

