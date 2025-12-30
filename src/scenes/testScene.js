import { useEffect } from 'react';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';

import * as THREE from 'three';
import { MTLLoader, OBJLoader, OrbitControls } from 'three/examples/jsm/Addons.js';


const pixelizationLevel = 4;

// init
const TestScene = () => {
	const width = window.innerWidth, height = window.innerHeight;

	const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
	camera.position.z = 1;
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xAAAAAA);
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);
	renderer.setAnimationLoop(animate);

	// камера
	const controls = new OrbitControls(camera, renderer.domElement);
	camera.position.set(0, 0, 2);
	controls.update();

	// кубик
	const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
	const material = new THREE.MeshNormalMaterial();
	const cubeOne = new THREE.Mesh(geometry, material);
	const cubeTwo = new THREE.Mesh(geometry, material);
	cubeTwo.position.setZ(-0.4);
	scene.add(cubeOne);
	scene.add(cubeTwo);

	// свет 
	const light = new THREE.DirectionalLight(0xffffff, 10);
	const lightHelper = new THREE.DirectionalLightHelper(light, 1);

	light.position.set(1, 1, 1);
	scene.add(light);
	scene.add(lightHelper);
	// animation 

	const composer = new EffectComposer(renderer);
	const pixelatedPass = new RenderPixelatedPass(pixelizationLevel, scene, camera);
	composer.addPass(pixelatedPass);

	function animate(time) {
		cubeOne.position.setX(0.8);
		cubeOne.position.setZ(0.4);
		cubeOne.rotation.x = time / 2000;
		cubeOne.rotation.y = time / 1000;
		// Плавное движение света по оси X туда и обратно (синусоидальное)
		const amplitude = 5; // максимальное смещение по X
		const speed = 0.0005; // скорость движения
		const lightShift = Math.sin(time * speed) * amplitude;
		light.position.set(lightShift, 2, 2);
		// Рендер сцены через composer
		composer.render(scene, camera);
	}

	// Загрузка картинки и создание плоскости
	const loader = new THREE.TextureLoader();
	loader.load(
		'textures/test.jpg', // путь к картинке
		function (texture) {
			// Создание материала
			const material = new THREE.MeshBasicMaterial({
				map: texture,
				side: THREE.DoubleSide // Чтобы видеть плоскость с обеих сторон
			});
			material.transparent = false; // Отключение прозрачности
			material.opacity = 1.0; // Полная непрозрачность
			const geometry = new THREE.PlaneGeometry(1, 2); // Создание плоскости (Ширина , высота)
			const plane = new THREE.Mesh(geometry, material); // Создание объекта (Mesh)
			scene.add(plane); // Добавляем плоскость на сцену
			function animate() {
				requestAnimationFrame(animate);
				composer.render(scene, camera);
			}
			animate();
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total) * 100 + "% loaded test.jpg");
		},
		function (err) {
			console.error('Произошла ошибка при загрузке текстуры', err); // Обработка ошибок
		}
	);

	loader.load(
		'textures/sun_test.png', // путь к картинке
		function (texture) {
			// Создание материала
			const material = new THREE.MeshBasicMaterial({
				map: texture,
				side: THREE.DoubleSide, // Чтобы видеть плоскость с обеих сторон
				transparent: true // Включение прозрачности
			});
			const geometry = new THREE.PlaneGeometry(2, 2); // Создание плоскости (Ширина , высота)
			const plane = new THREE.Mesh(geometry, material); // Создание объекта (Mesh)
			plane.position.setX(-3);
			plane.rotateY(-(Math.PI / 2)); // Поворот плоскости на 90 градусов вокруг оси Y
			scene.add(plane); // Добавляем плоскость на сцену
			function animate() {
				requestAnimationFrame(animate);
				composer.render(scene, camera);
			}
			animate();
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total) * 100 + "% loaded test.jpg");
		},
		function (err) {
			console.error('Произошла ошибка при загрузке текстуры', err); // Обработка ошибок
		}
	);

	// load material
	const mtlLoader = new MTLLoader();
	mtlLoader.load("./models/Container/Container.mtl", function (materials) {
		materials.preload();
		console.log("loaded Material");

		// load Object
		var objLoader = new OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load(
			"./models/Container/Container.obj",
			function (object) {
				const container = object;
				container.position.setX(-2);
				container.scale.set(0.005, 0.005, 0.005);
				scene.add(container);
			},
			function (xhr) {
				console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
			},
			// called when loading has errors
			function (error) {
				console.log("An error happened" + error);
			}
		);
	});

	// Load Pliers OBJ and apply a proper material + optional texture
	const pliersTexturePath = './models/VHSPlayer/texture_diffuse.png';
	const textureLoaderForPliers = new THREE.TextureLoader();
	var objLoader = new OBJLoader();
	objLoader.load(
		"./models/VHSPlayer/VHSPlayer.obj",
		function (object) {
			object.traverse(function (child) {
				if (child.isMesh) {
					const mat = new THREE.MeshStandardMaterial({
						color: 0xcccccc,
						metalness: 0.2,
						roughness: 0.6,
						side: THREE.DoubleSide
					});
					child.material = mat;
					child.castShadow = true;
					child.receiveShadow = true;

					// Try loading a texture; if it exists, apply it
					textureLoaderForPliers.load(
						pliersTexturePath,
						function (tex) {
							mat.map = tex;
							mat.needsUpdate = true;
						},
						undefined,
						function () {
							// Texture not found — keep default material color
						}
					);
				}
			});
			object.position.setX(2);
			scene.add(object);
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total) * 100 + "% loaded Pliers.obj");
		},
		function (error) {
			console.log("An error happened loading Pliers.obj", error);
		}
	);

	useEffect(() => {
		document.getElementById('scene').appendChild(renderer.domElement)
	}, [renderer.domElement])

	return <div id='scene' />;
}

export default TestScene;