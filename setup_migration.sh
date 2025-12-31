#!/bin/bash
# Setup script - generates initial Alembic migration

echo "This script should be run inside the Docker container"
echo "Run: docker-compose exec api bash setup_migration.sh"
echo ""
echo "Generating initial migration..."

alembic revision --autogenerate -m "Initial schema with all models"

echo ""
echo "Migration created! Review it in alembic/versions/"
echo "To apply: alembic upgrade head"
