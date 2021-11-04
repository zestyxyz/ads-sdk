const execSync = require('child_process').execSync;

const aframeOutput = execSync('jest tests/aframe.test.js');
const babylonjsOutput = execSync('jest tests/babylonjs.test.js');
const threejsOutput = execSync('jest tests/threejs.test.js');
const webOutput = execSync('jest tests/web.test.js');
const wonderlandOutput = execSync('jest tests/wonderland.test.js');
const utilsOutput = execSync('jest tests/utils');
