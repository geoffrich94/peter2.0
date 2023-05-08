import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Import Shaders
import vertexShader from "./shaders/earth/vertex.glsl";
import fragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/earth/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/earth/atmosphereFragment.glsl";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Set camera position
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Orbital Controls
new OrbitControls(camera, renderer.domElement);

// Sphere class
class Sphere extends THREE.Mesh {
  constructor({
    radius,
    widthSegments,
    heightSegments,
    vertexShader,
    fragmentShader,
    uniforms = {},
    blending = THREE.NormalBlending,
    side = THREE.FrontSide,
  }) {
    const geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: Object.assign(
        {
          earthTexture: { value: null },
        },
        uniforms
      ),
      blending,
      side,
    });
    super(geometry, material);
  }
}

// Earth
const earth = new Sphere({
  radius: 5,
  widthSegments: 50,
  heightSegments: 50,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    earthTexture: {
      value: new THREE.TextureLoader().load("/assets/earth_map.jpg"),
    },
  },
});
scene.add(earth);

// Earth's Atmosphere
const earthAtmosphere = new Sphere({
  radius: 5,
  widthSegments: 50,
  heightSegments: 50,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
earthAtmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(earthAtmosphere);

// Create a Starfield
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});
const starVerticies = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 4000;
  starVerticies.push(x, y, z);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVerticies, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
  // Rotate Earth
  earth.rotation.y += 0.001;
});
