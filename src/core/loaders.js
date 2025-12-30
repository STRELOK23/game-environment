import * as THREE from 'three';
import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';


const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

function applyTransforms(object, position, rotation, scale) {
    if (!object) return;
    if (position) object.position.set(position.x || 0, position.y || 0, position.z || 0);
    if (rotation) object.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
    if (scale !== undefined) {
        if (typeof scale === 'number') object.scale.setScalar(scale);
        else object.scale.set((scale.x === undefined ? 1 : scale.x), (scale.y === undefined ? 1 : scale.y), (scale.z === undefined ? 1 : scale.z));
    }
}

export async function addMLTModelToScene(scene, modelName, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = 1, options = {}) {
    // wrapper that calls the async version and logs errors (keeps existing usage simple)
    try {
        await addMLTModelToSceneAsync(scene, modelName, position, rotation, scale, options);
    } catch (e) {
        console.error('addModelToScene failed:', e);
    }
}

export async function addOBJModelToScene(scene, modelName, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = 1, options = {}) {
    // wrapper that calls the async version and logs errors (keeps existing usage simple)
    try {
        await addOBJModelToSceneAsync(scene, modelName, position, rotation, scale, options);
    } catch (e) {
        console.error('addModelToScene failed:', e);
    }
}

export function addMLTModelToSceneAsync(scene, modelName, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = 1, options = {}) {
    return new Promise(async (resolve, reject) => {
        if (!scene) {
            reject(new Error('addModelToSceneAsync: scene is required'));
            return;
        }
        const mtlFileName = options.mtlFileName || `${modelName}.mtl`;
        const objFileName = options.objFileName || `${modelName}.obj`;
        const basePath = `./models/${modelName}`;
        const mtlPath = `${basePath}/${mtlFileName}`;
        const objPath = `${basePath}/${objFileName}`;

        mtlLoader.load(
            mtlPath,
            (materials) => {
                materials.preload();
                objLoader.setMaterials(materials);
                objLoader.load(
                    objPath,
                    (object) => {
                        applyTransforms(object, position, rotation, scale);
                        object.name = modelName;
                        scene.add(object);
                        resolve(object);
                    },
                    undefined,
                    (err) => {
                        reject(err);
                    }
                );
            },
            undefined,
            (err) => {
                reject(err);
            }
        );
    });
}

export function addOBJModelToSceneAsync(scene, modelName, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = 1, options = {}) {
    return new Promise(async (resolve, reject) => {
        if (!scene) {
            reject(new Error('addModelToSceneAsync: scene is required'));
            return;
        }

        const objFileName = options.objFileName || `${modelName}.obj`;

        const basePath = `./models/${modelName}`;
        const objPath = `${basePath}/${objFileName}`;

        // no MTL — load OBJ directly
        const objLoader = new OBJLoader();
        objLoader.load(
            objPath,
            (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        const texturePathPng = `${basePath}/texture_diffuse.png`;
                        const texturePathJpg = `${basePath}/texture_diffuse.jpg`;
                        const mat = new THREE.MeshStandardMaterial({
                            color: 0xcccccc,
                            metalness: 0.2,
                            roughness: 0.6,
                            side: THREE.DoubleSide
                        });
                        child.material = mat;
                        child.castShadow = true;
                        child.receiveShadow = true;

                        const textureLoader = new THREE.TextureLoader();
                        textureLoader.load(
                            texturePathPng,
                            (texture) => {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            },
                            undefined,
                            (err) => {
                                // Try loading JPG if PNG fails
                                textureLoader.load(
                                    texturePathJpg,
                                    (texture) => {
                                        mat.map = texture;
                                        mat.needsUpdate = true;
                                    },
                                    undefined,
                                    (err2) => {
                                        console.warn(`Failed to load diffuse texture for ${modelName}:`, err2);
                                    }
                                );
                            }
                        );
                    }
                });
                applyTransforms(object, position, rotation, scale);
                object.name = modelName;
                scene.add(object);
                resolve(object);
            },
            undefined,
            (err) => {
                reject(err);
            }
        );
    });
}