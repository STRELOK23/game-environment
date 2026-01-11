import React, { useEffect } from 'react';
import * as THREE from 'three';

import { Editor } from './js/Editor.js';
import { Viewport } from './js/Viewport.js';
import { Toolbar } from './js/Toolbar.js';
import { Script } from './js/Script.js';
import { Player } from './js/Player.js';
import { Sidebar } from './js/Sidebar.js';
import { Menubar } from './js/Menubar.js';
import { Resizer } from './js/Resizer.js';

import "./styles/main.css"

const EditorPage = () => {

    useEffect(() => {
        document.title = 'Editor';

        window.URL = window.URL || window.webkitURL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

        const editor = new Editor();
        const viewport = new Viewport(editor);
        const toolbar = new Toolbar(editor);
        const script = new Script(editor);
        const player = new Player(editor);
        const sidebar = new Sidebar(editor);
        const menubar = new Menubar(editor);
        const resizer = new Resizer(editor);
        document.body.appendChild(viewport.dom);
        document.body.appendChild(toolbar.dom);
        document.body.appendChild(script.dom);
        document.body.appendChild(player.dom);
        document.body.appendChild(sidebar.dom);
        document.body.appendChild(menubar.dom);
        document.body.appendChild(resizer.dom);

        editor.storage.init(function () {
            editor.storage.get(async function (state) {

                if (isLoadingFromHash) return;
                if (state !== undefined) {
                    await editor.fromJSON(state);
                }

                const selected = editor.config.getKey('selected');

                if (selected !== undefined) {
                    editor.selectByUuid(selected);
                }

            });

            let timeout;

            function saveState() {
                if (editor.config.getKey('autosave') === false) return;

                clearTimeout(timeout);

                timeout = setTimeout(function () {
                    editor.signals.savingStarted.dispatch();
                    timeout = setTimeout(function () {
                        editor.storage.set(editor.toJSON());
                        editor.signals.savingFinished.dispatch();
                    }, 100);
                }, 1000);
            }

            const signals = editor.signals;

            signals.geometryChanged.add(saveState);
            signals.objectAdded.add(saveState);
            signals.objectChanged.add(saveState);
            signals.objectRemoved.add(saveState);
            signals.materialChanged.add(saveState);
            signals.sceneBackgroundChanged.add(saveState);
            signals.sceneEnvironmentChanged.add(saveState);
            signals.sceneFogChanged.add(saveState);
            signals.sceneGraphChanged.add(saveState);
            signals.scriptChanged.add(saveState);
            signals.historyChanged.add(saveState);

        });

        document.addEventListener('dragover', function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });

        document.addEventListener('drop', function (event) {
            event.preventDefault();
            if (event.dataTransfer.types[0] === 'text/plain') return; // Outliner drop
            if (event.dataTransfer.items) {
                editor.loader.loadItemList(event.dataTransfer.items);
            } else {
                editor.loader.loadFiles(event.dataTransfer.files);
            }
        });

        function onWindowResize() {
            editor.signals.windowResize.dispatch();
        }
        window.addEventListener('resize', onWindowResize);

        onWindowResize();

        let isLoadingFromHash = false;
        const hash = window.location.hash;

        if (hash.slice(1, 6) === 'file=') {
            const file = hash.slice(6);

            if (window.confirm(editor.strings.getKey('prompt/file/open'))) {
                const loader = new THREE.FileLoader();
                loader.crossOrigin = '';
                loader.load(file, function (text) {
                    editor.clear();
                    editor.fromJSON(JSON.parse(text));
                });
                isLoadingFromHash = true;
            }

        }

        if ('serviceWorker' in navigator) {
            try {
                navigator.serviceWorker.register('/editor/sw.js');
            } catch (error) { }
        }

    }, []);

    return <div id="editor-root" style={{ width: '100vw', height: '100vh' }} />;
};

export default EditorPage;
