#!/bin/bash

# Install dependencies and build
yarn
cd utils && yarn
cd ..
cd aframe && yarn && yarn run build
cd ..
cd babylonjs && yarn && yarn run build
cd ..
cd r3f && yarn && yarn run build
cd ..
cd threejs && yarn && yarn run build
cd ..
cd web && yarn && yarn run build
cd ..
cd wonderland && yarn && yarn run build
cd ..

# Test
yarn run test
