#!/bin/sh

# Create repos directory if it doesn't exist
mkdir -p /var/www/git

# Set proper permissions
chown -R git:git /var/www/git

# Initialize a sample repository if none exists
if [ ! -d "/var/www/git/sample.git" ]; then
    cd /var/www/git
    git init --bare sample.git
    chown -R git:git sample.git
    echo "Sample Git repository initialized"
fi

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
