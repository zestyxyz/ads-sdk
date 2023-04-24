#!/bin/bash

cd utils && yarn
cd ..
cd aframe && yarn && yarn run build
cd ..
cd babylonjs && yarn && yarn run build
cd ..
cd beacon && yarn && yarn run build
cd ..
cd r3f && yarn && yarn run build
cd ..
cd threejs && yarn && yarn run build
cd ..
cd web && yarn && yarn run build
cd ..
cd utils && yarn && yarn run build
cd ..
