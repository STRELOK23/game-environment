import { useEffect } from 'react';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { addMLTModelToScene, addOBJModelToScene } from '../core/loaders';


const pixelizationLevel = 4;

// init
const Scene = () => {
    const width = window.innerWidth, height = window.innerHeight;
    // камера, сцена, рендерер
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
    camera.position.z = 1;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA);

    // Добавляем яркий эмбиентный свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 3); // белый свет, высокая яркость
    scene.add(ambientLight);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animate);

    
    // добавляем хелпер с размерной сеткой
    const gridHelper = new THREE.GridHelper();
    scene.add(gridHelper);

    // управление камерами
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 2);
    controls.update();

    // добавление обработки пикселизации
    const composer = new EffectComposer(renderer);
    const pixelatedPass = new RenderPixelatedPass(pixelizationLevel, scene, camera);
    composer.addPass(pixelatedPass);

    // анимация (22 строка)
    function animate(time) {
        composer.render(scene, camera);
    }

    // Load Pliers OBJ and apply a proper material + optional texture

    addOBJModelToScene(scene, 'VHSPlayer', {x: -2, y: 0, z: 0});
    // addMLTModelToScene(scene, 'Container', undefined, undefined, 0.003);
    // addMLTModelToScene(scene, 'Container', {x: -1, y: 0, z: 0}, undefined, 0.003);
    
    addOBJModelToScene(scene, 'verstak', {x: 0, y: 0, z: 0}, undefined, 0.5)
    
    // addOBJModelToScene(scene, 'Cube', {x: 0, y: 0, z: 0}).then((object) => {
    //     // куб 1метр
    //     console.log("Cube loaded", object);
    // });
    // тестовая загрузка множества моделей
    // for (let i = -10; i <= 10; i++) {
    //     for (let j = -10; j <= 10; j++) {
    //         addMLTModelToScene(scene, 'Container', {x: i * 0.2, y: 0, z: j * 0.2}, undefined, 0.003);
    //     }
    // }

    // добавляем полупрозрачный конус
    const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
    const coneMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.1 });
    // раскрашиваем конус в градиент
    const gradient = new THREE.Color(0x00ff00);
    coneMaterial.color = gradient;

    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    // делаем отображение поверхности конуса с обеих сторон
    coneMaterial.side = THREE.DoubleSide;
    cone.position.set(2, 0, 0);
    scene.add(cone);

    console.log("Scene loaded", scene);

    useEffect(() => {
        const containCanvas = document.getElementById('scene');
        containCanvas.appendChild(renderer.domElement);
    }, [renderer.domElement]);

    return <div id='scene' />;
}

export default Scene;