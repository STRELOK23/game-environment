import React, { useEffect } from 'react';

const EditorPage = () => {
    useEffect(() => {
        document.title = 'Editor';

        const created = [];

        const track = (el, parent = document.head) => {
            parent.appendChild(el);
            created.push({ el, parent });
            return el;
        };

        // Styles
        const mainCss = document.createElement('link');
        mainCss.rel = 'stylesheet';
        mainCss.href = '/editor/css/main.css';
        track(mainCss, document.head);

        const cmCss = document.createElement('link');
        cmCss.rel = 'stylesheet';
        cmCss.href = '/editor/js/libs/codemirror/codemirror.css';
        track(cmCss, document.head);

        const cmTheme = document.createElement('link');
        cmTheme.rel = 'stylesheet';
        cmTheme.href = '/editor/js/libs/codemirror/theme/monokai.css';
        track(cmTheme, document.head);

        const cmAddon1 = document.createElement('link');
        cmAddon1.rel = 'stylesheet';
        cmAddon1.href = '/editor/js/libs/codemirror/addon/dialog.css';
        track(cmAddon1, document.head);

        const cmAddon2 = document.createElement('link');
        cmAddon2.rel = 'stylesheet';
        cmAddon2.href = '/editor/js/libs/codemirror/addon/show-hint.css';
        track(cmAddon2, document.head);

        const cmAddon3 = document.createElement('link');
        cmAddon3.rel = 'stylesheet';
        cmAddon3.href = '/editor/js/libs/codemirror/addon/tern.css';
        track(cmAddon3, document.head);

        // importmap
        const importmap = document.createElement('script');
        importmap.type = 'importmap';
        importmap.textContent = JSON.stringify({
            imports: {
                three: '/editor/three.module.js',
                'three/addons/': '/editor/examples/jsm/',
                'three/examples/': '/editor/examples/',
                'three-gpu-pathtracer': '/editor/index.module.js',
                'three-mesh-bvh': 'https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.7.4/build/index.module.js',
                'effect-composer': '/editor/jsm/postprocessing/EffectComposer.js',
                'render-pixelated-pass': '/editor/jsm/postprocessing/RenderPixelatedPass.js'
            }
        });
        track(importmap, document.head);

        // Non-module scripts
        const libs = [
            '/editor/js/libs/draco/draco_encoder.js',
            '/editor/js/libs/codemirror/codemirror.js',
            '/editor/js/libs/codemirror/mode/javascript.js',
            '/editor/js/libs/codemirror/mode/glsl.js',
            '/editor/js/libs/esprima.js',
            '/editor/js/libs/jsonlint.js',
            'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js',
            '/editor/js/libs/codemirror/addon/dialog.js',
            '/editor/js/libs/codemirror/addon/show-hint.js',
            '/editor/js/libs/codemirror/addon/tern.js',
            '/editor/js/libs/acorn/acorn.js',
            '/editor/js/libs/acorn/acorn_loose.js',
            '/editor/js/libs/acorn/walk.js',
            '/editor/js/libs/ternjs/polyfill.js',
            '/editor/js/libs/ternjs/signal.js',
            '/editor/js/libs/ternjs/tern.js',
            '/editor/js/libs/ternjs/def.js',
            '/editor/js/libs/ternjs/comment.js',
            '/editor/js/libs/ternjs/infer.js',
            '/editor/js/libs/ternjs/doc_comment.js',
            '/editor/js/libs/tern-threejs/threejs.js',
            '/editor/js/libs/signals.min.js'
        ];

        libs.forEach((src) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = false;
            track(s, document.body);
        });

        // Module script: adapted from public/editor/index.html
        const moduleScript = document.createElement('script');
        moduleScript.type = 'module';
        moduleScript.textContent = `
import * as THREE from '/editor/three.module.js';

import { Editor } from '/editor/js/Editor.js';
import { Viewport } from '/editor/js/Viewport.js';
import { Toolbar } from '/editor/js/Toolbar.js';
import { Script } from '/editor/js/Script.js';
import { Player } from '/editor/js/Player.js';
import { Sidebar } from '/editor/js/Sidebar.js';
import { Menubar } from '/editor/js/Menubar.js';
import { Resizer } from '/editor/js/Resizer.js';

// import { EffectComposer } from '/editor/jsm/postprocessing/EffectComposer.js";
// import { RenderPixelatedPass } from '/editor/jsm/postprocessing/RenderPixelatedPass.js";

window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

const editor = new Editor();

window.editor = editor; // Expose editor to Console
window.THREE = THREE; // Expose THREE to APP Scripts and Console

// window.EffectComposer = EffectComposer;
// window.RenderPixelatedPass = RenderPixelatedPass;

const viewport = new Viewport( editor );
document.body.appendChild( viewport.dom );

const toolbar = new Toolbar( editor );
document.body.appendChild( toolbar.dom );

const script = new Script( editor );
document.body.appendChild( script.dom );

const player = new Player( editor );
document.body.appendChild( player.dom );

const sidebar = new Sidebar( editor );
document.body.appendChild( sidebar.dom );

const menubar = new Menubar( editor );
document.body.appendChild( menubar.dom );

const resizer = new Resizer( editor );
document.body.appendChild( resizer.dom );

editor.storage.init( function () {

	editor.storage.get( async function ( state ) {

		if ( isLoadingFromHash ) return;

		if ( state !== undefined ) {

			await editor.fromJSON( state );

		}

		const selected = editor.config.getKey( 'selected' );

		if ( selected !== undefined ) {

			editor.selectByUuid( selected );

		}

	} );

	let timeout;

	function saveState() {

		if ( editor.config.getKey( 'autosave' ) === false ) {

			return;

		}

		clearTimeout( timeout );

		timeout = setTimeout( function () {

			editor.signals.savingStarted.dispatch();

			timeout = setTimeout( function () {

				editor.storage.set( editor.toJSON() );

				editor.signals.savingFinished.dispatch();

			}, 100 );

		}, 1000 );

	}

	const signals = editor.signals;

	signals.geometryChanged.add( saveState );
	signals.objectAdded.add( saveState );
	signals.objectChanged.add( saveState );
	signals.objectRemoved.add( saveState );
	signals.materialChanged.add( saveState );
	signals.sceneBackgroundChanged.add( saveState );
	signals.sceneEnvironmentChanged.add( saveState );
	signals.sceneFogChanged.add( saveState );
	signals.sceneGraphChanged.add( saveState );
	signals.scriptChanged.add( saveState );
	signals.historyChanged.add( saveState );

} );

document.addEventListener( 'dragover', function ( event ) {

	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';

} );

document.addEventListener( 'drop', function ( event ) {

	event.preventDefault();

	if ( event.dataTransfer.types[ 0 ] === 'text/plain' ) return; // Outliner drop

	if ( event.dataTransfer.items ) {

		editor.loader.loadItemList( event.dataTransfer.items );

	} else {

		editor.loader.loadFiles( event.dataTransfer.files );

	}

} );

function onWindowResize() {

	editor.signals.windowResize.dispatch();

}

window.addEventListener( 'resize', onWindowResize );

onWindowResize();

let isLoadingFromHash = false;
const hash = window.location.hash;

if ( hash.slice( 1, 6 ) === 'file=' ) {

	const file = hash.slice( 6 );

	if ( confirm( editor.strings.getKey( 'prompt/file/open' ) ) ) {

		const loader = new THREE.FileLoader();
		loader.crossOrigin = '';
		loader.load( file, function ( text ) {

			editor.clear();
			editor.fromJSON( JSON.parse( text ) );

		} );

		isLoadingFromHash = true;

	}

}

if ( 'serviceWorker' in navigator ) {

	try {

		navigator.serviceWorker.register( '/editor/sw.js' );

	} catch ( error ) {

	}

}
`;

        track(moduleScript, document.body);

        return () => {
            // Try graceful editor cleanup
            try {
                if (window.editor) {
                    if (typeof window.editor.dispose === 'function') window.editor.dispose();
                    if (typeof window.editor.clear === 'function') window.editor.clear();
                    delete window.editor;
                }
                if (window.THREE) delete window.THREE;
            } catch (e) {
                // ignore
            }

            // remove injected elements
            created.reverse().forEach(({ el, parent }) => {
                try { parent.removeChild(el); } catch (e) { }
            });
        };
    }, []);

    return <div id="editor-root" style={{ width: '100vw', height: '100vh' }} />;
};

export default EditorPage;
