#!/bin/bash

# Function to determine change type from commit message
get_change_type() {
    local msg="$1"
    if [[ $msg == feat:* ]]; then
        echo "feature"
    elif [[ $msg == fix:* ]]; then
        echo "fix"
    elif [[ $msg == beta:* ]]; then
        echo "beta"
    else
        echo "improvement"
    fi
}

# Get the current timestamp in ISO format
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Start the JSON structure
echo '{
  "lastUpdated": "'$CURRENT_TIME'",
  "entries": [' > public/changelog.json

# Get git log and format it as JSON
git log --since="2025-01-01" --pretty=format:'{
      "commitHash": "%H",
      "date": "%aI",
      "author": "%an",
      "title": "%s",
      "description": "%b",
      "type": "'$(get_change_type "%s")'"
    },' | sed '$ s/,$//' >> public/changelog.json

# Close the JSON structure
echo '
  ]
}' >> public/changelog.json

# Format the JSON file
if command -v jq &> /dev/null; then
    jq '.' public/changelog.json > public/changelog.tmp.json && mv public/changelog.tmp.json public/changelog.json
fi

echo "Changelog updated successfully!"
