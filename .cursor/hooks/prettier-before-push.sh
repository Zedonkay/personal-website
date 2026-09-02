#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

if ! echo "$command" | grep -Eq '(^|[[:space:]])git[[:space:]]+push([[:space:]]|$)'; then
  echo '{ "permission": "allow" }'
  exit 0
fi

if ! npx prettier . --check >&2; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "Prettier check failed. Run npx prettier . --write, commit the formatting, then push.",
  "agent_message": "git push was blocked because npx prettier . --check failed. Run npx prettier . --write, commit the formatting changes, then retry the push."
}
EOF
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
