#!/bin/bash

# Generate JWT RSA key pair
openssl genpkey -algorithm RSA -out jwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in jwt_private.pem -out jwt_public.pem

# Define file and variable names
jwt_private="jwt_private.pem"
jwt_public="jwt_public.pem"
ENV_key_private="JWT_PRIVATE_KEY"
ENV_key_public="JWT_PUBLIC_KEY"

# Convert PEM files to escaped, single-line strings
key_private=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$jwt_private")
key_public=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$jwt_public")

# Output environment-friendly format
echo "${ENV_key_private}=\"${key_private}\""
echo "${ENV_key_public}=\"${key_public}\""

# Optional: Clean up PEM files
rm "$jwt_private" "$jwt_public"