import * as THREE from "three"; // This will now be resolved by the import map

// Import Shaders
import vertexShader from "./shaders/earth/vertex.glsl";
import fragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/earth/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/earth/atmosphereFragment.glsl";

const canvasContainer = document.querySelector("#canvas-container");

// Scene
const scene = new THREE.Scene();

// Camera Element
const camera = new THREE.PerspectiveCamera(
  75,
  canvasContainer.offsetWidth / canvasContainer.offsetHeight,
  0.1,
  1000
);
// Set camera position
camera.position.z = 15;

function init() {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    // Increase pixel quality
    antialias: true,
    canvas: document.querySelector("canvas"),
  });
  // Increase pixel quality
  renderer.setPixelRatio(window.devicePixelRatio);
  // Set renderer size
  renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);

  // Create a new sphere
  const geometry = new THREE.SphereGeometry(5, 50, 50);
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      earthTexture: {
        value: new THREE.TextureLoader().load("/assets/earth_map.jpg"),
      },
    },
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Create an atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(5, 50, 50);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  atmosphere.scale.set(1.1, 1.1, 1.1);
  scene.add(atmosphere);

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

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // Rotate Earth
    sphere.rotation.y += 0.001;
  }
  animate();
}

window.onload = function () {
  init();
};
