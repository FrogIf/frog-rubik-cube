import * as THREE from 'three';
import { OrbitControls } from './js/threejs/jsm/controls/OrbitControls.js';

const CubeColor = {
    RED: 1,
    GREEN: 2,
    BLUE: 3,
    ORANGE: 4,
    YELLOW: 5,
    WHITE: 6,
    properties: {
        1: { name: "red", value: "#C41E3A" },
        2: { name: "green", value: "#009E60" },
        3: { name: "blue", value: "#0051BA" },
        4: { name: "orange", value: "#FF5800" },
        5: { name: "yellow", value: "#FFD500" },
        6: { name: "white", value: "#FFFFFF" }
    }
};
const backgroundColor = 0xFFFFFF;

const rank = 3;
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
// 创建场景
const scene = new THREE.Scene();
var orbitControler;
var isDebug = false;
const renderer = new THREE.WebGLRenderer({
    antialias: true    // 抗锯齿
});


// 鼠标控制相关
const raycaster = new THREE.Raycaster();//光线碰撞检测器
var mouse = new THREE.Vector2();//存储鼠标坐标或者触摸坐标


export const rubicCube = {
    rank: 3,
    cubemap:[],
    cubes:{},
    init : function(){
        const geometry = new THREE.BoxGeometry();
        const m1 = generateMaterial(CubeColor.ORANGE);
        const m2 = generateMaterial(CubeColor.RED);
        const m3 = generateMaterial(CubeColor.YELLOW);
        const m4 = generateMaterial(CubeColor.WHITE);
        const m5 = generateMaterial(CubeColor.GREEN);
        const m6 = generateMaterial(CubeColor.BLUE);
        const meterials = new Array();
        meterials.push(m1);
        meterials.push(m2);
        meterials.push(m3);
        meterials.push(m4);
        meterials.push(m5);
        meterials.push(m6);
        this.cubes = new THREE.InstancedMesh(geometry, meterials, rank * rank * rank);
        let i = 0;
        const matrix = new THREE.Matrix4();
        for(let x = 0; x < this.rank; x++){
            for(let y = 0; y < this.rank; y++){
                for(let z = 0; z < this.rank; z++){
                    this.cubemap.push(i);
                    let coordinate = this.matrixPositionFix(x, y, z);
                    matrix.setPosition(coordinate.x, coordinate.y, coordinate.z);
                    this.cubes.setMatrixAt(i, matrix);
                    i++;
                }
            }
        }
    },
    matrixPositionFix: function (x, y, z){
        let offset = (rank - 1) / 2;
        return {
            x : x - offset,
            y : y - offset,
            z : z - offset
        };
    },
    action:{
        R:{
            permutation : [
                -1, -1, -1, 
                -1, -1, -1,
                -1, -1, -1,
    
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
    
                20, 23, 26,
                19, 22, 25,
                18, 21, 24
            ],
            axis: new THREE.Vector3( -1, 0, 0 ),
            angle: Math.PI / 2
        },
        R_:{
            permutation : [
                -1, -1, -1, 
                -1, -1, -1,
                -1, -1, -1,
    
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
                
                24, 21, 18,
                25, 22, 19,
                26, 23, 20
            ],
            axis: new THREE.Vector3( 1, 0, 0 ),
            angle: Math.PI / 2
        },
        U:{
            permutation : [
                -1, -1, -1,
                -1, -1, -1,
                24, 15, 6,
    
                -1, -1, -1,
                -1, -1, -1,
                25, 16, 7,
    
                -1, -1, -1,
                -1, -1, -1,
                26, 17, 8
            ],
            axis: new THREE.Vector3(0, -1, 0),
            angle: Math.PI / 2
        },
        U_ :{
            permutation : [
                -1, -1, -1,
                -1, -1, -1,
                8, 17, 26,
    
                -1, -1, -1,
                -1, -1, -1,
                7, 16, 25,
    
                -1, -1, -1,
                -1, -1, -1,
                6, 15, 24
            ],
            axis: new THREE.Vector3(0, 1, 0),
            angle: Math.PI / 2
        },
        F:{
            permutation : [
                -1, -1, 8,
                -1, -1, 17,
                -1, -1, 26,
    
                -1, -1, 5,
                -1, -1, 14,
                -1, -1, 23,
    
                -1, -1, 2,
                -1, -1, 11,
                -1, -1, 20
            ],
            axis: new THREE.Vector3(0, 0, -1),
            angle: Math.PI / 2
        },
        F_:{
            permutation : [
                -1, -1, 20,
                -1, -1, 11,
                -1, -1, 2,
    
                -1, -1, 23,
                -1, -1, 14,
                -1, -1, 5,
    
                -1, -1, 26,
                -1, -1, 17,
                -1, -1, 8
            ],
            axis: new THREE.Vector3(0, 0, 1),
            angle: Math.PI / 2
        },
        D:{
            permutation : [
                2, 11, 20,
                -1, -1, -1,
                -1, -1, -1,
    
                1, 10, 19,
                -1, -1, -1,
                -1, -1, -1,
    
                0, 9, 18,
                -1, -1, -1,
                -1, -1, -1
            ],
            axis: new THREE.Vector3(0, 1, 0),
            angle: Math.PI / 2
        },
        D_:{
            permutation : [
                18, 9, 0,
                -1, -1, -1,
                -1, -1, -1,
    
                19, 10, 1,
                -1, -1, -1,
                -1, -1, -1,
    
                20, 11, 2,
                -1, -1, -1,
                -1, -1, -1
            ],
            axis: new THREE.Vector3(0, -1, 0),
            angle: Math.PI / 2
        },
        L:{
            permutation : [
                6, 3, 0, 
                7, 4, 1,
                8, 5, 2,
    
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
    
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1
            ],
            axis: new THREE.Vector3(1, 0, 0),
            angle: Math.PI / 2
        },
        L_:{
            permutation : [
                2, 5, 8,
                1, 4, 7,
                0, 3, 6,
    
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
    
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1
            ],
            axis: new THREE.Vector3(-1, 0, 0),
            angle: Math.PI / 2
        },
        B:{
            permutation : [
                18, -1, -1,
                9, -1, -1,
                0, -1, -1,
    
                21, -1, -1,
                12, -1, -1,
                3, -1, -1,
    
                24, -1, -1,
                15, -1, -1,
                6, -1, -1
            ],
            axis: new THREE.Vector3(0, 0, 1),
            angle: Math.PI / 2
        },
        B_:{
            permutation : [
                6, -1, -1,
                15, -1, -1,
                24, -1, -1,
    
                3, -1, -1,
                12, -1, -1,
                21, -1, -1,
    
                0, -1, -1,
                9, -1, -1,
                18, -1, -1
            ],
            axis: new THREE.Vector3(0, 0, -1),
            angle: Math.PI / 2
        }
    },
    doAction: function(action){
        this.move(action.axis, action.permutation, action.angle);
    },
    permute: function(permutation){
        // 根据定义的置换, 对cubemap进行置换操作
        let newCubeMap = [];
        for(let i = 0; i < this.cubemap.length; i++){
            newCubeMap.push(this.cubemap[i]);
        }
        let i = 0;
        for(let x = 0; x < this.rank; x++){
            for(let y = 0; y < this.rank; y++){
                for(let z = 0; z < this.rank; z++){
                    let target = permutation[i];
                    if(target >= 0){
                        newCubeMap[target] = this.cubemap[i];
                    }
                    i++;
                }
            }
        }
        this.cubemap = newCubeMap;
    },
    move: function(rotateAxis, permutation, angle){
        // 根据置换的定义, 按照指定轴进行旋转
        this.animationQueue.push({
            currentFrameIndex: 0,
            rotateAxis: rotateAxis,
            permutation: permutation,
            angle, angle
        });
    },
    doMove: function(rotateAxis, permutation, angle){
        const matrix = new THREE.Matrix4();
        let v = new THREE.Vector3();
        let q = new THREE.Quaternion();
        let s = new THREE.Vector3();
        let i = 0;
        for(let x = 0; x < this.rank; x++){
            for(let y = 0; y < this.rank; y++){
                for(let z = 0; z < this.rank; z++){
                    let target = permutation[i];
                    if(target >= 0){
                        let index = this.cubemap[i];
                        this.cubes.getMatrixAt(index, matrix);
                        
                        matrix.decompose(v, q, s);
            
                        const quaternion = new THREE.Quaternion();
                        quaternion.setFromAxisAngle(rotateAxis, angle);
                        v.applyQuaternion(quaternion);
            
                        q.premultiply(quaternion);
            
                        matrix.compose(v, q, s);
                        this.cubes.setMatrixAt(index, matrix);
                    }
                    i++;
                }
            }
        }
        this.cubes.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
    },
    animationQueue:[],
    animationSpeed: Math.PI / 40, // 每一帧多少弧度
    animation: function(){
        if(this.animationQueue.length > 0){
            let first = this.animationQueue[0];
            if(first.currentFrameIndex * this.animationSpeed >= first.angle){
                this.animationQueue.shift();
                this.permute(first.permutation);
            }else{
                first.currentFrameIndex++;
                this.doMove(first.rotateAxis, first.permutation, this.animationSpeed);
            }
        }
    }
};

export function init(debug) {
    isDebug = debug;

    renderer.setClearColor(backgroundColor, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    orbitControler = new OrbitControls(camera, renderer.domElement);
    orbitControler.rotateSpeed = 0.5;

    rubicCube.init();
    scene.add(rubicCube.cubes);

    scene.add(createCoverCube());
    if (isDebug) {
        let helper = new THREE.AxesHelper(20);
        helper.setColors(
            0xFF0000, // x r
            0x00FF00, // y g
            0x0000FF // z b
        );
        scene.add(helper);
    }
    const light = new THREE.AmbientLight(0xFEFEFE);
    scene.add(light);

    camera.position.set(10, 10, 10);
    orbitControler.update();

    function animate() {
        requestAnimationFrame(animate);
        orbitControler.update();
        rubicCube.animation();
        renderer.render(scene, camera);
    }
    animate();

    // addListener();
}

export function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function addListener() {
    renderer.domElement.addEventListener('mousedown', startCube, false);
    renderer.domElement.addEventListener('mousemove', moveCube, false);
    renderer.domElement.addEventListener('mouseup', stopCube, false);
}

function startCube(event) {
    console.log("start");
}

function moveCube(event) {
    console.log("move");
}

function stopCube(event) {
    console.log("stop");
}

//获取操作焦点以及该焦点所在平面的法向量
function getIntersects(event) {
    //触摸事件和鼠标事件获得坐标的方式有点区别
    if (event.touches) {
        var touch = event.touches[0];
        mouse.x = (touch.clientX / width) * 2 - 1;
        mouse.y = -(touch.clientY / height) * 2 + 1;
    } else {
        mouse.x = (event.clientX / width) * 2 - 1;
        mouse.y = -(event.clientY / height) * 2 + 1;
    }
    raycaster.setFromCamera(mouse, camera);
    //Raycaster方式定位选取元素，可能会选取多个，以第一个为准
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length) {
        try {
            if (intersects[0].object.cubeType === 'coverCube') {
                intersect = intersects[1];
                normalize = intersects[0].face.normal;
            } else {
                intersect = intersects[0];
                normalize = intersects[1].face.normal;
            }
        } catch (err) {
            //nothing
        }
    }
}

function createCoverCube() {
    //透明正方体
    var cubegeo = new THREE.BoxGeometry(4, 4, 4);
    var cubemat = new THREE.MeshBasicMaterial({ color: 0x00FF00, opacity: 0, transparent: true });
    var cube = new THREE.Mesh(cubegeo, cubemat);
    cube.cubeType = 'coverCube';
    return cube;
}

function generateMaterial(cubeColor) {
    var texture = new THREE.Texture(face(CubeColor.properties[cubeColor].value));
    texture.needsUpdate = true;
    return new THREE.MeshLambertMaterial({ map: texture });
}


//生成canvas素材
function face(rgbaColor) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var context = canvas.getContext('2d');
    if (context) {
        //画一个宽高都是256的黑色正方形
        context.fillStyle = 'rgba(0,0,0,1)';
        context.fillRect(0, 0, 256, 256);
        //在内部用某颜色的16px宽的线再画一个宽高为224的圆角正方形并用改颜色填充
        context.rect(16, 16, 224, 224);
        context.lineJoin = 'round';
        context.lineWidth = 16;
        context.fillStyle = rgbaColor;
        context.strokeStyle = rgbaColor;
        context.stroke();
        context.fill();
    } else {
        console.warn('canvas failed.');
    }
    return canvas;
}