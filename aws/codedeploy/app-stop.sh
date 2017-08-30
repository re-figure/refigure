#!/bin/sh

service=refigure

if (( $(ps -ef | grep -v grep | grep $service | wc -l) > 0 )); then
 initctl stop $service
 echo $service" stopped"
fi
