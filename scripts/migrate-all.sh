#!/usr/bin/env bash

##############################################################################
# NexaSphere Database Migration Manager
# 
# Unified CLI for managing migrations across all backend services:
# - Node.js (server/)
# - Java (server-java/)
# - Python (server-python/)
#
# Usage: ./scripts/migrate-all.sh <command> [options]
##############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
NODE_SERVICE="$PROJECT_ROOT/server"
JAVA_SERVICE="$PROJECT_ROOT/server-java"
PYTHON_SERVICE="$PROJECT_ROOT/server-python"

##############################################################################
# Utility Functions
##############################################################################

print_header() {
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

##############################################################################
# Migration Commands
##############################################################################

# Node.js Migrations
migrate_nodejs() {
  local cmd=$1
  cd "$NODE_SERVICE"
  
  case $cmd in
    status)
      print_info "Checking Node.js migration status..."
      npm run migrate -- --dryRun 2>/dev/null || true
      ;;
    up)
      print_info "Applying Node.js migrations..."
      npm run migrate:latest
      print_success "Node.js migrations applied"
      ;;
    down)
      print_info "Rolling back last Node.js migration..."
      npm run migrate:rollback
      print_success "Node.js migration rolled back"
      ;;
    create)
      print_info "Create migration: npm run migrate:create -- <description>"
      npm run migrate:create -- "${2:-new_migration}"
      ;;
    *)
      print_error "Unknown command: $cmd"
      return 1
      ;;
  esac
}

# Java Migrations
migrate_java() {
  local cmd=$1
  cd "$JAVA_SERVICE"
  
  case $cmd in
    status)
      print_info "Checking Java migration status..."
      mvn flyway:info -q 2>/dev/null || print_warning "Flyway info not available"
      ;;
    up)
      print_info "Java migrations auto-apply on startup"
      print_info "To test: mvn spring-boot:run"
      ;;
    down)
      print_error "Manual rollback required for Java/Flyway"
      print_info "See: https://flywaydb.org/documentation/command/undo"
      ;;
    validate)
      print_info "Validating Java migration files..."
      ls -1 src/main/resources/db/migration/V*.sql 2>/dev/null || print_warning "No migration files found"
      ;;
    *)
      print_error "Unknown command: $cmd"
      return 1
      ;;
  esac
}

# Python Migrations
migrate_python() {
  local cmd=$1
  cd "$PYTHON_SERVICE"
  
  case $cmd in
    status)
      print_info "Checking Python migration status..."
      alembic current 2>/dev/null || print_warning "Database not initialized"
      ;;
    up)
      print_info "Applying Python migrations..."
      alembic upgrade head
      print_success "Python migrations applied"
      ;;
    down)
      print_info "Rolling back last Python migration..."
      alembic downgrade -1
      print_success "Python migration rolled back"
      ;;
    create)
      print_info "Creating new Python migration..."
      alembic revision -m "${2:-new_migration}"
      ;;
    history)
      print_info "Showing Python migration history..."
      alembic history
      ;;
    *)
      print_error "Unknown command: $cmd"
      return 1
      ;;
  esac
}

##############################################################################
# Main Commands
##############################################################################

show_help() {
  cat << EOF
${BLUE}NexaSphere Database Migration Manager${NC}

${BLUE}Usage:${NC}
  ./scripts/migrate-all.sh <command> [service] [options]

${BLUE}Commands:${NC}
  status          Show migration status for all services
  up              Apply pending migrations to all services
  down            Rollback last migration from all services
  create          Create new migration (requires service and description)
  validate        Validate all migration files
  info            Show detailed migration information
  help            Show this help message

${BLUE}Services:${NC}
  --node          Node.js backend only (server/)
  --java          Java backend only (server-java/)
  --python        Python backend only (server-python/)
  (default: all services)

${BLUE}Examples:${NC}
  # Check status of all services
  ./scripts/migrate-all.sh status

  # Apply migrations to Node.js only
  ./scripts/migrate-all.sh up --node

  # Create new migration in Python backend
  ./scripts/migrate-all.sh create --python add_new_table

  # Rollback last migration from Java
  ./scripts/migrate-all.sh down --java

  # Validate all migration files
  ./scripts/migrate-all.sh validate

${BLUE}More Info:${NC}
  See DATABASE_MIGRATIONS.md for detailed documentation

EOF
}

migrate_status() {
  print_header "Migration Status Report"
  
  if [ -z "$1" ] || [ "$1" == "--node" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Node.js Backend (server/)${NC}"
    migrate_nodejs status || true
  fi
  
  if [ -z "$1" ] || [ "$1" == "--java" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Java Backend (server-java/)${NC}"
    migrate_java status || true
  fi
  
  if [ -z "$1" ] || [ "$1" == "--python" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Python Backend (server-python/)${NC}"
    migrate_python status || true
  fi
}

migrate_up_all() {
  print_header "Applying Pending Migrations"
  
  if [ -z "$1" ] || [ "$1" == "--node" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Node.js Backend (server/)${NC}"
    migrate_nodejs up || print_error "Node.js migration failed"
  fi
  
  if [ -z "$1" ] || [ "$1" == "--java" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Java Backend (server-java/)${NC}"
    migrate_java up || print_warning "Java requires startup to apply migrations"
  fi
  
  if [ -z "$1" ] || [ "$1" == "--python" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Python Backend (server-python/)${NC}"
    migrate_python up || print_error "Python migration failed"
  fi
}

migrate_down_all() {
  print_header "Rolling Back Last Migration"
  
  if [ -z "$1" ] || [ "$1" == "--node" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Node.js Backend (server/)${NC}"
    migrate_nodejs down || print_error "Node.js rollback failed"
  fi
  
  if [ -z "$1" ] || [ "$1" == "--java" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Java Backend (server-java/)${NC}"
    migrate_java down || print_warning "Manual Flyway undo required"
  fi
  
  if [ -z "$1" ] || [ "$1" == "--python" ] || [ "$1" == "--all" ]; then
    echo -e "\n${BLUE}Python Backend (server-python/)${NC}"
    migrate_python down || print_error "Python rollback failed"
  fi
}

validate_all() {
  print_header "Validating Migration Files"
  
  # Check Node.js
  echo -e "\n${BLUE}Node.js Migrations${NC}"
  if [ -d "$NODE_SERVICE/migrations" ]; then
    count=$(find "$NODE_SERVICE/migrations" -name "*.js" 2>/dev/null | wc -l)
    print_success "Found $count migration file(s)"
  else
    print_error "Migration directory not found"
  fi
  
  # Check Java
  echo -e "\n${BLUE}Java Migrations${NC}"
  if [ -d "$JAVA_SERVICE/src/main/resources/db/migration" ]; then
    count=$(find "$JAVA_SERVICE/src/main/resources/db/migration" -name "V*.sql" 2>/dev/null | wc -l)
    print_success "Found $count migration file(s)"
  else
    print_error "Migration directory not found"
  fi
  
  # Check Python
  echo -e "\n${BLUE}Python Migrations${NC}"
  if [ -d "$PYTHON_SERVICE/alembic/versions" ]; then
    count=$(find "$PYTHON_SERVICE/alembic/versions" -name "*.py" -not -name "__*" 2>/dev/null | wc -l)
    print_success "Found $count migration file(s)"
  else
    print_error "Migration directory not found"
  fi
}

show_info() {
  print_header "Migration System Information"
  
  echo -e "\n${BLUE}Configuration:${NC}"
  echo "  NODE_SERVICE: $NODE_SERVICE"
  echo "  JAVA_SERVICE: $JAVA_SERVICE"
  echo "  PYTHON_SERVICE: $PYTHON_SERVICE"
  
  echo -e "\n${BLUE}Migration Tools:${NC}"
  echo "  Node.js: node-pg-migrate"
  echo "  Java: Flyway (auto-configured via Spring Boot)"
  echo "  Python: Alembic"
  
  echo -e "\n${BLUE}Documentation:${NC}"
  echo "  See DATABASE_MIGRATIONS.md for complete guide"
  echo "  See INSTRUCTIONS.md for quick reference"
  
  validate_all
}

##############################################################################
# Main Script Logic
##############################################################################

main() {
  local cmd=$1
  local service=$2
  local extra=$3
  
  # Default to all services if not specified
  if [[ -z "$service" ]] || [[ "$service" == --* ]]; then
    extra="$service"
    service="--all"
  fi
  
  case $cmd in
    status)
      migrate_status "$service"
      ;;
    up)
      migrate_up_all "$service"
      ;;
    down)
      migrate_down_all "$service"
      ;;
    create)
      case $service in
        --node)
          migrate_nodejs create "$extra"
          ;;
        --java)
          migrate_java create "$extra"
          ;;
        --python)
          migrate_python create "$extra"
          ;;
        *)
          print_error "Service required for create command"
          show_help
          exit 1
          ;;
      esac
      ;;
    validate)
      validate_all
      ;;
    info)
      show_info
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      print_error "Unknown command: $cmd"
      show_help
      exit 1
      ;;
  esac
}

# Run main function with all arguments
main "$@"
