#!/bin/bash

npx decaffeinate --use-js-modules $1 && mv $(basename $1 .coffee).js $(basename $1 .coffee).ts && rm $1
