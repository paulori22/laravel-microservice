#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh

###Front-end
cd /var/www/frontend && npm install && cd ..

###Back-end
cd backend
composer install
php artisan key:generate
php artisan migrate

php-fpm
