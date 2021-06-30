#!/bin/bash

cd utils && yarn
cd ..
cd aframe && yarn && yarn run build
cd ..
cd threejs && yarn && yarn run build
cd ..
cp -R aframe/dist dist
cp -R threejs/dist/* dist
cp -R assets dist
