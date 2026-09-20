import * as THREE from 'three';

export const ALICE_POS = new THREE.Vector3(-4, 0.5, 8);
export const EVE_POS = new THREE.Vector3(2.2, -1.6, -6);
export const BOB_POS = new THREE.Vector3(4, 0.5, -20);

// The quantum channel the message packet physically travels along.
export const channelCurve = new THREE.CatmullRomCurve3([
  ALICE_POS.clone(),
  new THREE.Vector3(-1, 1.2, 2),
  new THREE.Vector3(1, -0.4, -2),
  EVE_POS.clone().add(new THREE.Vector3(-0.3, 0.6, 1.2)),
  new THREE.Vector3(3, 0.6, -11),
  new THREE.Vector3(3.6, 0.5, -16),
  BOB_POS.clone(),
]);

// A separate, slightly offset path the camera dollies along so the channel
// stays in view as one continuous world instead of cutting between scenes.
// Adjusted camera points to maintain a comfortable, normal node perspective during scroll.
export const cameraCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2, 3.8, 18),
  new THREE.Vector3(-4.5, 3.5, 14.5), // Alice perspective — pulled back for normal node scale
  new THREE.Vector3(-2.0, 4.0, 7.5),
  new THREE.Vector3(1.5, 3.5, 1.5),
  new THREE.Vector3(2.8, 3.2, -3.5),  // Eve perspective — pulled back for comfortable view
  new THREE.Vector3(4.8, 3.5, -9.5),
  new THREE.Vector3(4.5, 3.2, -14.5), // Bob perspective — balanced framing
  new THREE.Vector3(3.2, 3.0, -24.5),
]);

// Narrative timing windows along the 0..1 scroll axis.
export const TIMELINE = {
  messageStart: 0.2,
  messageEnd: 0.86,
  eveStart: 0.38,
  eveEnd: 0.62,
  decisionStep1: 0.6,
  decisionStep2: 0.68,
  decisionStep3: 0.75,
};
