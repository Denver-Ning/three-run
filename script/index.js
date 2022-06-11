import {
  OrbitControls
} from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import {
  GLTFLoader
} from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
let scene, renderer, camera, controls;
let model, mixer, clock;

let x = 0,
  y = 0,
  z = 0;
let direction = '';
let directionRota = Math.PI;
let text = document.getElementById('text');
function init() {
  const canvas = document.getElementById('canvas');
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  // 创建场景
  scene = new THREE.Scene();
  // 创建相机
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(-20, 30, 30);
  camera.lookAt(0, 1, 0);
  // 控制相机
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableKeys = false;
  controls.update();
  clock = new THREE.Clock();
  // 创建平面
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  // 平面材质
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x999999,
    depthWrite: false
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.castShadow = true;
  plane.receiveShadow = true;
  plane.rotation.x = -0.5 * Math.PI;
  scene.add(plane);


  // *创建平行光light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 100, 100);
  dirLight.castShadow = true;
  scene.add(dirLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 初始化加载器
  let loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
    text.innerHTML = `加载中${Math.floor(loaded / total * 100)}%`;
  }
  loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  loadingManager.onLoad = function () {
    const loadingText = document.getElementById('loading-text');
    if (loadingText.parentNode) {
      loadingText.parentNode.removeChild(loadingText);
    }
  };

  // 加载glb模型
  const loader2 = new GLTFLoader(loadingManager);
  loader2.load('/Module/Soldier.glb', function (gltf) {
    model = gltf.scene;
    console.log(x, y, z);
    model.rotation.y = Math.PI;
    scene.add(model);
    model.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });
    console.log(gltf.animations.length); // 动画数量

    let meshAnimation = gltf.animations[1];
    mixer = new THREE.AnimationMixer(gltf.scene);
    let animationClip = meshAnimation;
    let clipAction = mixer.clipAction(animationClip).play();
    animationClip = clipAction.getClip();
    animate();

  });
  // 监听窗口变化
  window.addEventListener('resize', onWindowResize);
  // 监听键盘事件
  window.addEventListener('keydown', onWindowKeydown)
  // renderer.setClearColor('pink');
  renderer.setSize(window.innerWidth, window.innerHeight);
}
init()

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}
// 模型动画
function modelAnimate() {
  requestAnimationFrame(modelAnimate);
  model.position.set(x, y, z)
  model.rotation.set(0, directionRota, 0);
}

function onWindowKeydown(e) {
  if (e.code === 'ArrowUp') {
    z -= 0.1;
    direction = 'up'
    direction == 'up' && (directionRota = 0);
  } else if (e.code === 'ArrowDown') {
    z += 0.1;
    direction = 'down'
    direction == 'down' && (directionRota = Math.PI);
  } else if (e.code === 'ArrowLeft') {
    x -= 0.1;
    direction = 'left';
    direction == 'left' && (directionRota = Math.PI / 2);
  } else if (e.code === 'ArrowRight') {
    x += 0.1;
    direction = 'right';
    direction == 'right' && (directionRota = Math.PI * 3 / 2);
  }

  let time = clock.getDelta();
  mixer.update(time);

  modelAnimate()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}