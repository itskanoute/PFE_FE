#!/bin/bash
# Supprime Cursor des contributeurs GitHub
# Lancer dans Git Bash (PAS depuis Cursor Agent) :
#   bash scripts/remove-cursor-from-git.sh

set -e
cd "$(dirname "$0")/.."

echo "=== 1. Correction du commit (sans Cursor) ==="

git commit --amend -m "Add backend API and connect frontend auth flows." -m "Introduce Express/MySQL backend with JWT auth, school and student registration, and wire login/inscription pages through a shared API service with Vite dev proxy."

echo ""
echo "=== 2. Vérification ==="
if git cat-file -p HEAD | grep -q "cursoragent@cursor.com"; then
  echo "ERREUR : Cursor est encore dans le commit."
  echo "Désactive Cursor Settings > Agents > Attribution > Commit Attribution"
  exit 1
fi

echo "OK : plus de Co-authored-by Cursor"
git log -1 --format=fuller

echo ""
echo "=== 3. Push vers GitHub ==="
read -p "Force push sur main ? (o/n) " confirm
if [ "$confirm" = "o" ] || [ "$confirm" = "O" ]; then
  git push --force origin main
  echo ""
  echo "Terminé ! Attends 5-10 min puis rafraîchis la page Contributeurs sur GitHub."
else
  echo "Annulé. Lance manuellement : git push --force origin main"
fi
