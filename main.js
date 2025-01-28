import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Import Shaders
import vertexShader from "./shaders/earth/vertex.glsl";
import fragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/earth/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/earth/atmosphereFragment.glsl";
import vertexShader02 from "./shaders/earth02/vertex.glsl";
import fragmentShader02 from "./shaders/earth02/fragment.glsl";
import { uniforms } from "/shaders/earth02/uniforms.js";
import sunVertexShader from "./shaders/sun/vertex.glsl";
import sunFragmentShader from "./shaders/sun/fragment.glsl";
import sunAtmosphereVertexShader from "./shaders/sun/atmosphereVertex.glsl";
import sunAtmosphereFragmentShader from "./shaders/sun/atmosphereFragment.glsl";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Set camera position
camera.position.z = 30;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
ambientLight.position.set(0, 0, 0);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xfffff, 2);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

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
  radius: 10,
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
console.log(earth);
scene.add(earth);

// Earth's Atmosphere
const earthAtmosphere = new Sphere({
  radius: 10,
  widthSegments: 50,
  heightSegments: 50,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
earthAtmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(earthAtmosphere);

// Earth Group
const earthGroup = new THREE.Group();
earthGroup.add(earth, earthAtmosphere);
earthGroup.position.set(0, 0, -60);
scene.add(earthGroup);

// Vertex Earth
const colorMap = new THREE.TextureLoader().load(
  "/assets/earth02/00_earthmap1k.jpg"
);
const elevationMap = new THREE.TextureLoader().load(
  "/assets/earth02/01_earthbump1k.jpg"
);
const alphaMap = new THREE.TextureLoader().load(
  "/assets/earth02/02_earthspec1k.jpg"
);
uniforms.colorTexture.value = colorMap;
uniforms.elevTexture.value = elevationMap;
uniforms.alphaTexture.value = alphaMap;

const globeGroup = new THREE.Group();
globeGroup.position.set(200, 0, -32.5);
scene.add(globeGroup);

const geo = new THREE.IcosahedronGeometry(1, 10);
const mat = new THREE.MeshBasicMaterial({
  color: 0x202020,
  wireframe: true,
  transparent: true,
  opacity: 0.05,
});
const cube = new THREE.Mesh(geo, mat);
globeGroup.add(cube);

const detail = 500;
// const sphere = new Sphere({
//   radius: 1,
//   widthSegments: detail,
//   heightSegments: detail,
//   vertexShader: vertexShader02,
//   fragmentShader: fragmentShader02,
//   uniforms: uniforms,
//   transparent: true,
// });
const pointsGeo = new THREE.SphereGeometry(1, detail, detail);
const pointsMat = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader02,
  fragmentShader: fragmentShader02,
  transparent: true,
});
const points = new THREE.Points(pointsGeo, pointsMat);
globeGroup.add(points);

// Sun
const sun = new Sphere({
  radius: 10,
  widthSegments: 100,
  heightSegments: 100,
  vertexShader: sunVertexShader,
  fragmentShader: sunFragmentShader,
  uniforms: {
    time: { value: 0.0 },
    sunTexture: {
      value: new THREE.TextureLoader().load("/assets/sun_map.jpg"),
    },
  },
});
scene.add(sun);

// Sun's Atmosphere
const sunAtmosphere = new Sphere({
  radius: 10,
  widthSegments: 100,
  heightSegments: 100,
  vertexShader: sunAtmosphereVertexShader,
  fragmentShader: sunAtmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
sunAtmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(sunAtmosphere);

// Sun Group
const sunGroup = new THREE.Group();
sunGroup.add(sun, sunAtmosphere);
scene.add(sunGroup);
sunGroup.position.set(0, 0, 0);

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

// Store camera speed and movement distance
let cameraSpeed = 0.05; // Speed of the camera movement
let forwardBackwardDistance = 60; // Distance to move forward or backward
let leftRightDistance = 200; // Distance to move left or right
let isMoving = false; // Flag to check if the camera is currently moving
let targetCameraPosition = camera.position.clone(); // Start with the current camera position

// Handle button click to move the camera forward
document.getElementById("moveForwardButton").addEventListener("click", () => {
  if (!isMoving) {
    // Incrementally move the camera forward by 60 units
    targetCameraPosition.z -= forwardBackwardDistance;
    isMoving = true; // Start moving the camera
  }
});

// Handle button click to move the camera back
document.getElementById("moveBackButton").addEventListener("click", () => {
  if (!isMoving) {
    // Incrementally move the camera back by 60 units
    targetCameraPosition.z += forwardBackwardDistance;
    isMoving = true; // Start moving the camera
  }
});

// Handle button click to move the camera left
document.getElementById("moveLeftButton").addEventListener("click", () => {
  if (!isMoving) {
    // Incrementally move the camera left by 200 units
    targetCameraPosition.x -= leftRightDistance;
    isMoving = true; // Start moving the camera
  }
});

// Handle button click to move the camera right
document.getElementById("moveRightButton").addEventListener("click", () => {
  if (!isMoving) {
    // Incrementally move the camera right by 200 units
    targetCameraPosition.x += leftRightDistance;
    isMoving = true; // Start moving the camera
  }
});

// Function to smoothly move the camera
function moveCamera() {
  if (isMoving) {
    // Lerp (smoothly interpolate) the camera's position toward the target position
    camera.position.lerp(targetCameraPosition, cameraSpeed);

    // Check if the camera has reached the target position (a small threshold)
    if (camera.position.distanceTo(targetCameraPosition) < 0.1) {
      camera.position.copy(targetCameraPosition); // Ensure camera reaches the exact target position
      isMoving = false; // Stop moving the camera
    }
  }
}

renderer.setAnimationLoop((time) => {
  renderer.render(scene, camera);

  // Move the camera smoothly
  moveCamera();

  // Rotate
  earth.rotation.y += 0.001;
  sun.rotation.y += 0.001;
  globeGroup.rotation.y += 0.01;
});
