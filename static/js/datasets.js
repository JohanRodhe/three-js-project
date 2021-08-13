"use strict";
import * as THREE from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
let baseGeometry = new THREE.SphereBufferGeometry(1, 6, 6);
baseGeometry.computeVertexNormals();
baseGeometry.scale(0.004, 0.004, 0.004);
let data, instanceId;
const position = new THREE.Vector3();
const matrix = new THREE.Matrix4();
const pointer = new THREE.Vector2();

class DatasetApp {
    constructor(container) {
        // Scene and cam setup
        this.container = container;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#171717")
        this.camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 1.5);
        container.appendChild(this.renderer.domElement);
        //Lights
        const light1 = new THREE.HemisphereLight( 0xffffff, 0x000088 );
        light1.position.set( 0, 1, 0 );
        this.scene.add( light1 );
        const light2 = new THREE.HemisphereLight( 0xffffff, 0x880000, 0.5 );
        light2.position.set( -1, -1, 0 );
        this.scene.add( light2 );

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.raycaster = new THREE.Raycaster();
        
        this.clock = new THREE.Clock();
        this.tick = this.tick.bind(this);
        this.init = this.init.bind(this);

        this.init();

        // this.tick();
    }

    
    init() {
        this.start();
        this.tick();
    }
    
    animate (time) {
        if (this.scene) {
            // this.scene.rotation.y += 0.5 * time;
            // const obj = this.scene.getObjectByName("graph");
            // if (obj) {
            //     obj.rotation.y += 0.5 * time;
            // }
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    tick () {
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();

        
        this.raycaster.setFromCamera( pointer, this.camera );

        const intersection = this.raycaster.intersectObject( this.spheres );

        if ( intersection.length > 0 ) {

            if (instanceId != intersection[0].instanceId) {
                instanceId = intersection[ 0 ].instanceId;
                // this.spheres.getMatrixAt(instanceId, matrix);
                // position.setFromMatrixPosition(matrix);
                // position.x += 1;
                // matrix.setPosition(position);
                // this.spheres.setMatrixAt( instanceId, matrix );
                // this.spheres.instanceMatrix.needsUpdate = true;
                this.spheres.setColorAt( instanceId, this.spheres.colors[0].setHex( Math.random() * 0xffffff ) );
                this.spheres.instanceColor.needsUpdate = true;
            }
            else {

            }



        }
        let time = this.clock.getDelta();
        this.animate(time);
        requestAnimationFrame( this.tick );
    }
    
    stop() {
        this.scene.remove(this.spheres);
    }

    start(count) {
        this.spheres = new Spheres([new THREE.Color("#aaaacc")], count)
        this.spheres.init();
        this.scene.add(this.spheres);
    }

    restart (count) {
        this.stop();
        // this.spheres = new Spheres([new THREE.Color("#ff7700"), new THREE.Color("#11ffaa"), new THREE.Color("#1133aa")], count)
        this.start(count);
    }
}
    
    

class Spheres extends THREE.InstancedMesh {
    constructor(colors, count) {
        let material = new THREE.MeshPhongMaterial();
        let instanceCount = count;
        super(baseGeometry, material, instanceCount);
        this.material = material
        this.instanceCount = instanceCount;
        this.colors = colors;
    }
    
    init() {
        let instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
        instancedGeometry.maxInstancedCount = this.instanceCount;
        this.dummy = new THREE.Object3D();
        this.dummy.name = "graph";
        this.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
        for (var n = 0; n < this.instanceCount; n++) {
            if (data.length > 0) {
                var positions = data[n];
                this.dummy.position.set(parseFloat(positions[1]) - 0.5, parseFloat(positions[2]) - 0.5, parseFloat(positions[3]) - 0.5);
            }
            else {
                this.dummy.position.set(-10 + Math.random() * 20, -10 + Math.random() * 20, -10 + Math.random() * 20);
            }
            this.dummy.updateMatrix();
            
            this.setMatrixAt( n, this.dummy.matrix );
            this.setColorAt( n, this.colors[0] );
        }

        this.geometry = instancedGeometry;
    }
}


let container = document.getElementById("previewContainer");    
document.addEventListener('pointermove', onPointerMove);

function onPointerMove() {
    var rect = myApp.renderer.domElement.getBoundingClientRect();
    pointer.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    pointer.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    // pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

let previewButtons = document.getElementsByClassName("previewButton");
var button;
for (button of previewButtons) {
    button.fName = "https://cellexalvr.med.lu.se/data/" + button.id;
    button.addEventListener("click", previewClick);
}


function previewClick(evt) {
    myApp.stop();
    if (evt.currentTarget.classList.contains("active")) {
        evt.currentTarget.classList.remove("active");
    }
    else {
        for (var button of previewButtons) {
            if (button == evt.currentTarget) {
                button.classList.add("active");
                loadData(button.fName);
            }
            else {
                button.classList.remove("active");
            }
        }

    }
}


function loadData(fName) {
    fetch(fName)
    .then(response => response.text())
    .then(csvText => {
        data = [];
        const rows = csvText.split('\n');
        for (var row of rows) {
            data.push(row.split(','));
        }
        myApp.start(data.length);
    });
    return data;
}


const myApp = new DatasetApp(container);
loadData("https://cellexalvr.med.lu.se/data/aging_brain.txt");
// myApp.init();

            
