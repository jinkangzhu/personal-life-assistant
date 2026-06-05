#!/bin/sh
set -e

if [ -f "./node_modules/prisma/build/index.js" ]; then
  node ./node_modules/prisma/build/index.js db push --skip-generate
fi

exec node server.js
