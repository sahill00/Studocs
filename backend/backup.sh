#!/bin/bash
# Database Backup Script for StuDocs
# Can be executed via cron job: 0 2 * * * /path/to/backend/backup.sh

set -e

# Configuration
DB_NAME=${DB_NAME:-noteflow}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/studocs_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup of database $DB_NAME..."

# Dump database
pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

echo "Backup completed successfully: $BACKUP_FILE"

# Optional: compress backup
gzip "$BACKUP_FILE"

# Keep only the last 7 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

echo "Cleanup of old backups completed."
