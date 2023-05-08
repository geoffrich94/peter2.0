import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Import Shaders
import vertexShader from "./shaders/earth/vertex.glsl";
import fragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/earth/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/earth/atmosphereFragment.glsl";
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

// Sun
const sun = new Sphere({
  radius: 100,
  widthSegments: 1000,
  heightSegments: 1000,
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
const animateNoise = (time) => {
  time *= 0.001;
  sun.material.uniforms.time.value = time;
};

// Sun's Atmosphere
const sunAtmosphere = new Sphere({
  radius: 100,
  widthSegments: 1000,
  heightSegments: 1000,
  vertexShader: sunAtmosphereVertexShader,
  fragmentShader: sunAtmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
sunAtmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(sunAtmosphere);

// Create a group object
const sunGroup = new THREE.Group();
// Add the sun and sun atmosphere meshes to the group
sunGroup.add(sun);
sunGroup.add(sunAtmosphere);
// Add the group to the scene
scene.add(sunGroup);
sunGroup.position.set(0, 0, -200);

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

renderer.setAnimationLoop((time) => {
  renderer.render(scene, camera);
  animateNoise(time);
  // Rotate
  earth.rotation.y += 0.001;
  sun.rotation.y += 0.001;
});
