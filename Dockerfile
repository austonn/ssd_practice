FROM node:18-alpine

# Set environment variables for the specified user
ENV APP_USER="AUSTON IAN NG"
ENV APP_PASSWORD="2301768@sit.singaporetech.edu.sg"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY src/ ./src/
COPY xato-net-10-million-passwords-1000.txt ./

# Create non-root user for security and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 && \
    chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
