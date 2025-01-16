import * as THREE from "three"; // This will now be resolved by the import map
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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

// Earth Group
const earthGroup = new THREE.Group();
earthGroup.add(earth, earthAtmosphere);
// scene.add(earthGroup);

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
const animateNoise = (time) => {
  time *= 0.001;
  sun.material.uniforms.time.value = time;
};

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
// const starCount = 15000;
// const starVerticies = new Float32Array(starCount);
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
