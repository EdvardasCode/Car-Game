import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * model loader
 */
const gltfLoader = new GLTFLoader();

gltfLoader.load("/models/sport_car_2.gltf", (object) => {
  for (const child of object.scene.children[0].children) {
    // for (let i = 0; i < child.geometry.attributes.position.array.length; i++) {}
    console.log(child.geometry.attributes.position.array);
    // const carPhysics = new CANNON.Shape(
    //   child.geometry.attributes.position.array
    // );

    // console.log(carPhysics);
    // carPhysics.vertices = child.children[0].geometry.attributes.position.array;
    // carPhysics.boundingSphereRadius = 3.07838;
    // const carBody = new CANNON.Body();
    // console.log(carPhysics);
  }
  // const geometry = new THREE.BufferGeometry();
  // geometry.setAttribute(
  //   "position",
  //   new THREE.BufferAttribute(
  //     object.scene.children[0].children[0].geometry.attributes.position.array
  //   )
  // );
  console.log(object);

  object.scene.scale.set(1.0, 1.0, 1.0);
  object.scene.position.set(0, 1, 0);
  scene.add(object.scene);
});

/**
 * Physics
 */

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

/**
 * geometries
 */
//Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({})
);
scene.add(sphere);
//body
const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(2, 3, -1),
  shape: sphereShape,
});
world.addBody(sphereBody);

//Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#444444",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);
// floor body

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
floorBody.mass = 0;
floorBody.addShape(floorShape);
world.addBody(floorBody);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //update physics
  world.step(1 / 60, deltaTime, 3);
  sphere.position.copy(sphereBody.position);
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
