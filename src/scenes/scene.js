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

    addOBJModelToScene(scene, 'VHSPlayer');
    addMLTModelToScene(scene, 'Container', undefined, undefined, 0.003);
    addMLTModelToScene(scene, 'Container', {x: -1, y: 0, z: 0}, undefined, 0.003);

    console.log("Scene loaded", scene);

    useEffect(() => {
        const containCanvas = document.getElementById('scene');
        containCanvas.appendChild(renderer.domElement);
    }, [renderer.domElement]);

    return <div id='scene' />;
}

export default Scene;