#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

if ! echo "$command" | grep -Eq '(^|[[:space:]])git[[:space:]]+push([[:space:]]|$)'; then
  echo '{ "permission": "allow" }'
  exit 0
fi

if ! npm --prefix config run format:check >&2; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "Prettier check failed. Run npm --prefix config run format, commit the formatting, then push.",
  "agent_message": "git push was blocked because Prettier check failed. Run npm --prefix config run format, commit the formatting changes, then retry the push."
}
EOF
  exit 0
fi

if ! npm --prefix config run build >&2; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "Jekyll build failed. Fix the site build, commit, then push.",
  "agent_message": "git push was blocked because the Jekyll build failed. Run npm --prefix config run build, fix the errors, commit, then retry the push."
}
EOF
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
