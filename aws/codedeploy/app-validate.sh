#!/bin/sh

result=$(curl -s http://localhost/api/service-validate)

if [[ "$result" =~ "OKBOAZMEAL" ]]; then
    exit 0
else
    exit 1
fi
