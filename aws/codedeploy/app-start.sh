#!/bin/sh

#register service
src="/var/www/refigure.org"
cp -f $src/aws/etc/init/refigure.conf /etc/init/

#start service
initctl start refigure
