#!/usr/bin/env node

process.env.NODE_PATH = __dirname + '/../node_modules/'
process.env.NODE_ENV = 'development';
require('../src/commander');
