#!/bin/bash

# Function to retrieve a secret from Azure Key Vault
get_secret() {
    local vault_name="$1"
    local secret_name="$2"
    local output_file="$3"

    az keyvault secret show --name "$secret_name" --vault-name "$vault_name" --query "value" -o tsv >> "$output_file"
    echo "Retrieved secret: $secret_name"
}

# Check if Azure CLI is installed
if ! command -v az &>/dev/null; then
    echo "Azure CLI is not installed. Please install it before running this script."
    exit 1
fi

# Check the number of arguments
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <vault_name> <output_file> <secret_name1> [<secret_name2> ...]"
    exit 1
fi

vault_name="$1"
output_file="$2"
shift 2

# Create an empty JSON file
echo "{" > "$output_file"

# Loop through the provided secret names
while [ $# -gt 0 ]; do
    secret_name="$1"
    get_secret "$vault_name" "$secret_name" "$output_file"
    shift
    if [ $# -gt 0 ]; then
        echo "," >> "$output_file"
    fi
done

# Close the JSON object
echo "}" >> "$output_file"
echo "Secrets retrieved successfully and saved to $output_file"
