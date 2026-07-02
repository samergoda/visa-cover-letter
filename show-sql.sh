#!/bin/bash

# Simple script to display the SQL migration
# Usage: ./show-sql.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         COPY THIS SQL TO SUPABASE SQL EDITOR                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click: SQL Editor → + New query"
echo "4. Copy and paste ALL the text below:"
echo ""
echo "──────────────────────────────────────────────────────────────"
cat supabase-migration-family-visa.sql
echo "──────────────────────────────────────────────────────────────"
echo ""
echo "5. Click the RUN button (or press Ctrl+Enter)"
echo "6. Wait for: ✓ Success message"
echo ""
echo "Done! Your database is updated. 🎉"
