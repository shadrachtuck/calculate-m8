#!/bin/bash

# Supabase Database Restore Script
# Usage: ./scripts/restore-supabase.sh [backup-file.sql]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Supabase Database Restore Script${NC}"
echo "=================================="
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup file not provided${NC}"
    echo "Usage: $0 <backup-file.sql>"
    echo ""
    echo "Example:"
    echo "  $0 ~/Downloads/supabase-backup.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Please provide your Supabase connection details:${NC}"
echo ""
echo -e "${YELLOW}Note: The database name is always 'postgres' in Supabase (not your project name).${NC}"
echo ""

# Ask if user wants to use connection string or individual parameters
read -p "Do you have a connection string from Supabase dashboard? (y/n, default: n): " USE_CONN_STRING
USE_CONN_STRING=${USE_CONN_STRING:-n}

if [ "$USE_CONN_STRING" = "y" ] || [ "$USE_CONN_STRING" = "Y" ]; then
    echo ""
    echo "Get your connection string from: Settings → Database → Connection string"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "  - For new projects, try 'Session pooler' connection string first"
    echo "  - If that doesn't work, try 'Direct connection'"
    echo "  - Make sure to copy the FULL connection string including the password"
    echo ""
    read -p "Paste connection string: " CONNECTION_STRING
    
    # Use connection string directly - psql will handle URL encoding
    CONN_STRING_FOR_PSQL="$CONNECTION_STRING"
    
    # Extract database name for display purposes only
    if [[ "$CONNECTION_STRING" =~ /([^?]+) ]]; then
        DISPLAY_DB="${BASH_REMATCH[1]}"
    fi
else
    # Get connection details individually
    read -p "Project Reference (from Supabase dashboard): " PROJECT_REF
    read -sp "Database Password: " DB_PASSWORD
    echo ""
    echo -e "${YELLOW}Database Name: postgres${NC} (Supabase always uses 'postgres' as the database name)"
    DB_NAME="postgres"
    
    # Set connection parameters (using environment variables to avoid URL encoding issues)
    export PGHOST="db.${PROJECT_REF}.supabase.co"
    export PGPORT="5432"
    export PGDATABASE="${DB_NAME}"
    export PGUSER="postgres"
    export PGPASSWORD="${DB_PASSWORD}"
fi

echo ""
echo -e "${YELLOW}Restoring database from: $BACKUP_FILE${NC}"
if [ -n "$PROJECT_REF" ]; then
    echo "Project: $PROJECT_REF"
fi
if [ -n "$DISPLAY_DB" ]; then
    echo "Database: $DISPLAY_DB"
elif [ -n "$PGDATABASE" ]; then
    echo "Database: $PGDATABASE"
fi
if [ -n "$PGHOST" ] && [ -z "$CONN_STRING_FOR_PSQL" ]; then
    echo "Host: $PGHOST"
fi
echo ""

# Verify hostname can be resolved (only if using individual parameters, not connection string)
if [ -n "$PGHOST" ] && [ -z "$CONN_STRING_FOR_PSQL" ]; then
    echo -e "${YELLOW}Verifying connection...${NC}"
    if ! host "$PGHOST" &>/dev/null && ! nslookup "$PGHOST" &>/dev/null; then
        echo -e "${RED}✗ Cannot resolve hostname: $PGHOST${NC}"
        echo ""
        echo -e "${YELLOW}Troubleshooting steps:${NC}"
        echo "1. Check if your Supabase project is active (not paused)"
        echo "   - Go to https://app.supabase.com"
        echo "   - Find your project and check if it shows 'Paused'"
        echo "   - If paused, click 'Restart' or 'Unpause'"
        echo ""
        echo "2. Verify the project reference is correct:"
        echo "   - Go to Settings → General → Reference"
        echo "   - Make sure you're using the full reference ID"
        echo ""
        echo "3. Check your internet connection"
        echo ""
        echo "4. If the project is paused and can't be unpaused, you may need to:"
        echo "   - Create a new Supabase project"
        echo "   - Restore the backup to the new project"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✓ Hostname resolved${NC}"
    echo ""
fi

# Check if PostgreSQL tools are available
if ! command -v psql &> /dev/null && ! command -v pg_restore &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL client tools are not installed${NC}"
    echo "Install PostgreSQL client tools to use this script."
    echo ""
    echo "macOS: brew install postgresql"
    echo "Ubuntu/Debian: sudo apt-get install postgresql-client"
    exit 1
fi

# Detect file type by checking the first few bytes
# Binary dumps start with "PGDMP" magic bytes, text dumps are readable SQL
FIRST_5_BYTES=$(head -c 5 "$BACKUP_FILE" 2>/dev/null || echo "")

# Check if it's a binary format (starts with "PGDMP")
IS_BINARY=false
if [ "$FIRST_5_BYTES" = "PGDMP" ]; then
    IS_BINARY=true
fi

# Restore database
echo -e "${GREEN}Starting restore...${NC}"

if [ "$IS_BINARY" = true ]; then
    # Use pg_restore for binary backup files
    echo "Detected binary backup format, using pg_restore..."
    if ! command -v pg_restore &> /dev/null; then
        echo -e "${RED}Error: pg_restore is not installed${NC}"
        exit 1
    fi
    
    # Temporarily disable exit on error to check the error message
    set +e
    pg_restore \
        --verbose \
        --clean \
        --no-acl \
        --no-owner \
        --host="$PGHOST" \
        --port="$PGPORT" \
        --username="$PGUSER" \
        --dbname="$PGDATABASE" \
        "$BACKUP_FILE" 2>&1 | tee /tmp/pg_restore_output.log
    RESTORE_EXIT_CODE=${PIPESTATUS[0]}
    set -e
    
    # Check if the error is because file is text format
    if [ $RESTORE_EXIT_CODE -ne 0 ] && grep -q "text format" /tmp/pg_restore_output.log 2>/dev/null; then
        echo ""
        echo -e "${YELLOW}File is actually text format, switching to psql...${NC}"
        IS_BINARY=false
    elif [ $RESTORE_EXIT_CODE -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Database restored successfully!${NC}"
        # Clean up
        rm -f /tmp/pg_restore_output.log
        # Unset password and exit successfully
        unset PGPASSWORD
        echo ""
        echo "Next steps:"
        echo "1. Verify the restore by checking your tables"
        echo "2. Update your .env file with the new project credentials"
        echo "3. Test your application"
        exit 0
    else
        echo ""
        echo -e "${RED}✗ Restore failed. Please check the error messages above.${NC}"
        rm -f /tmp/pg_restore_output.log
        exit 1
    fi
    rm -f /tmp/pg_restore_output.log
fi

if [ "$IS_BINARY" = false ]; then
    # Use psql for SQL text files
    echo "Using psql for SQL text format..."
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}Error: psql is not installed${NC}"
        exit 1
    fi
    
    set +e
    if [ -n "$CONN_STRING_FOR_PSQL" ]; then
        # Use connection string directly
        echo -e "${YELLOW}Attempting to connect using provided connection string...${NC}"
        echo -e "${YELLOW}Note: If the project is paused, this will fail. Unpause it first in the Supabase dashboard.${NC}"
        echo ""
        psql "$CONN_STRING_FOR_PSQL" --file="$BACKUP_FILE" 2>&1 | tee /tmp/psql_output.log
    else
        # Use individual connection parameters
        psql \
            --host="$PGHOST" \
            --port="$PGPORT" \
            --username="$PGUSER" \
            --dbname="$PGDATABASE" \
            --file="$BACKUP_FILE" 2>&1 | tee /tmp/psql_output.log
    fi
    PSQL_EXIT_CODE=${PIPESTATUS[0]}
    set -e
    
    if [ $PSQL_EXIT_CODE -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Database restored successfully!${NC}"
        rm -f /tmp/psql_output.log
    else
        echo ""
        echo -e "${RED}✗ Restore failed.${NC}"
        echo ""
        if grep -q "could not translate host name\|nodename\|servname" /tmp/psql_output.log 2>/dev/null; then
            echo -e "${YELLOW}Connection Error: Cannot resolve hostname (DNS error).${NC}"
            echo ""
            echo "This usually means:"
            echo "1. The project is still provisioning (new projects can take 2-5 minutes)"
            echo "2. You're using 'Direct connection' - try 'Session pooler' instead"
            echo "3. The project reference in the connection string is incorrect"
            echo ""
            echo "Try these solutions:"
            echo ""
            echo "Option 1: Wait and retry (if project is new)"
            echo "  - New Supabase projects can take a few minutes to fully provision"
            echo "  - Wait 2-5 minutes and try again"
            echo ""
            echo "Option 2: Use Session pooler connection string"
            echo "  - Go to Settings → Database → Connection string"
            echo "  - Copy the 'Session pooler' connection string (not Direct)"
            echo "  - Session pooler uses a different hostname format"
            echo "  - Run this script again with the Session pooler string"
            echo ""
            echo "Option 3: Verify project is active"
            echo "  - Go to https://app.supabase.com"
            echo "  - Check that your project shows as 'Active' (not 'Paused' or 'Initializing')"
        elif grep -q "could not connect\|connection refused\|timeout\|authentication failed" /tmp/psql_output.log 2>/dev/null; then
            echo -e "${YELLOW}Connection Error: Cannot connect to the database.${NC}"
            echo ""
            echo "This usually means:"
            echo "1. The project is paused - go to Supabase dashboard and unpause it"
            echo "2. The connection string password is incorrect"
            echo "3. The project has been deleted"
            echo ""
            echo "If the project is paused, you need to unpause it first before restoring."
        fi
    rm -f /tmp/psql_output.log
    exit 1
fi
fi

# Unset password from environment
unset PGPASSWORD

echo ""
echo "Next steps:"
echo "1. Verify the restore by checking your tables"
echo "2. Update your .env file with the new project credentials"
echo "3. Test your application"
