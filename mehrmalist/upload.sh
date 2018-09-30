#!/usr/bin/env bash

if [ $# -lt 2 ]
then
  echo "Usage $0 <from-dir> <to-server>"
  exit -1
fi

# For even more fun: 
#   Call me together with `fswatch -0 *paths* | *this script*`
rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress --exclude=.DS_Store --exclude=.bundle --exclude=vendor --exclude=.ruby-version $1 $2
