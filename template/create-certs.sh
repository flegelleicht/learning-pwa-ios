#!/usr/bin/env bash

# Taken from https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec

#
# Create a root ssl key
openssl genrsa -des3 -out rootca.key 2048
  # enter password: 355znmi8dcpvH_en7rkR8w

#
# Create a root ssl certificate
openssl req -x509 -new -nodes -key rootca.key -sha256 -days 365 -out rootca.pem

#
# Trust this root ssl certificate in the Keychain
open -a /Applications/Utilities/Keychain\ Access.app
# „Import Objects ... (Shift-Cmd-i)“
# „Always trust“ certificate


#
# Create a domain ssl certificate
cat > server.csr.cnf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=DE
ST=RandomState
L=RandomCity
O=RandomOrganization
OU=RandomOrganizationUnit
emailAddress=flegelleicht@gmail.com
CN = localhost
EOF
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )


# Make certificate signing request
cat > v3.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
EOF
openssl x509 -req -in server.csr -CA rootca.pem -CAkey rootca.key -CAcreateserial -out server.crt -days 365 -sha256 -extfile v3.ext