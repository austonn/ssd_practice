FROM alpine:3.18

# Install git and other necessary packages, create git user and directories
RUN apk add --no-cache \
    busybox-extras \
    fcgiwrap \
    git \
    git-daemon \
    nginx \
    openssh \
    spawn-fcgi \
    supervisor && \
    adduser -D -s /bin/sh git && \
    mkdir -p /var/www/git && \
    mkdir -p /var/log/supervisor && \
    mkdir -p /etc/supervisor/conf.d && \
    chown -R git:git /var/www/git

# Copy configuration files
COPY nginx-git.conf /etc/nginx/nginx.conf
COPY supervisord-git.conf /etc/supervisor/conf.d/supervisord.conf
COPY init-git-server.sh /usr/local/bin/init-git-server.sh

RUN chmod +x /usr/local/bin/init-git-server.sh

# Expose ports
EXPOSE 3000 9418

# Switch to root user for starting services
USER root

# Start the services
CMD ["/usr/local/bin/init-git-server.sh"]
