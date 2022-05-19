import * as THREE from './threejs/three.module.js';
import { OrbitControls } from './threejs/jsm/controls/OrbitControls.js';

// 场景背景色
const SCENE_BACKGROUND_COLOR = 0xFFFFFF;
// 魔方颜色
const CubeColor = {
    D: 0,
    F: 1,
    U: 2,
    B: 3,
    R: 4,
    L: 5,
    properties: {
        0: { name: "white", value: "#FFFFFF" },
        1: { name: "blue", value: "#0051BA" },
        2: { name: "yellow", value: "#FFD500" },
        3: { name: "green", value: "#009E60" },
        4: { name: "red", value: "#C41E3A" },
        5: { name: "orange", value: "#FF5800" }
    },
    getCubeColorByColorValue: function(color){
        if(color.startsWith('#')){
            color = color.toUpperCase();
        }else{
            color = colorHex(color);
        }
        for(let k in this.properties){
            let vObj = this.properties[k];
            if(vObj.value == color){
                return k;
            }
        }
        return -1;
    }
};

function colorHex(color){
    // RGB颜色值的正则
    var reg = /^(rgb|RGB)/;
    if (reg.test(color)) {
      var strHex = "#";
      // 把RGB的3个数值变成数组
      var colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      // 转成16进制
      for (let c of colorArr) {
        var hex = Number(c).toString(16);
        if (hex === "0") {
          hex += hex;
        }
        strHex += hex;
      }
      return strHex.toUpperCase();
    } else {
      return String(color);
    }
}

// 3d图像相关
const ThreeJsContainer = {
    camera : new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000), // 相机
    scene : new THREE.Scene(), // 场景
    orbitControler : null, // 轨道控制器, 用于鼠标拖动时, 控制相机进行角度切换
    raycaster: new THREE.Raycaster(), //光线碰撞检测器
    mouse: new THREE.Vector2(), // 存储鼠标坐标
    width: 0,
    height: 0,
    renderer : new THREE.WebGLRenderer({  // 渲染器
        antialias: true    // 抗锯齿
    }),
    cameraResetDefault: function(){ // 相机回到默认视角
        this.camera.position.set(10, 10, 15);
    },
    init : function(parentDom, rubikCube, isDebug){
        // 初始化渲染器
        this.renderer.setClearColor(SCENE_BACKGROUND_COLOR, 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        parentDom.appendChild(this.renderer.domElement);

        // 初始化轨道控制器
        this.orbitControler = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControler.rotateSpeed = 0.5;

        // 初始化魔方模型
        rubikCube.init(this);
        this.scene.add(rubikCube.cubes);

        // 设置灯光
        const light = new THREE.AmbientLight(0xFEFEFE);
        this.scene.add(light);

        var selfObj = this;

        // 设置相机位置
        this.camera.position.set(10, 10, 15);
        this.orbitControler.update();

        // 循环指定的动画回调
        function animate() {
            selfObj.renderer.render(selfObj.scene, selfObj.camera);
            requestAnimationFrame(animate);
            selfObj.orbitControler.update();
            rubikCube.animation();
        }
        animate();
    }
};

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

/**
 * 用于表示单个方块的旋转, 方块位置顺序如下:
              ------  ------ 
             /  2  / |  3   |
            /     /  |      |
    ------ ------  4  ------
   |  5   |  1   |  /
   |      |      | /
    ------ ------
          |  0   |
          |      |
           ------
 * 例如 x : [3, 0, 1, 2, 4, 5]是标准的置换表示方法, 表示经过x置换之后, 原3位置的值移动到0位置, 
 *                                   原0位置的值移动到1位置, 原1位置的值移动到2位置......
 * 这是一个有限生成群, 下面列出了该群中的所有生成元(逆元也列出)和单位元
 * 根据方块颜色推理可知, 该有限生成群共有24个元素
 */
const RotatePermutationGroup = {
    generateElement : { // 生成元
        x: [3, 0, 1, 2, 4, 5],
        x_: [1, 2, 3, 0, 4, 5], // x的逆
        y : [0, 4, 2, 5, 3, 1],
        y_ : [0, 5, 2, 4, 1, 3], // y的逆
        z : [4, 1, 5, 3, 2, 0],
        z_ : [5, 1, 4, 3, 0, 2] // z的逆
    },
    identity: [0, 1, 2, 3, 4, 5], // 单位元
    illegalSequence: {  // 非法序列
        0 : 2,  // 0不可能紧挨着2
        1 : 3,  // 1不可能紧挨着3
        4 : 5,  // ...
        2 : 0, 
        3 : 1, 
        5 : 4
    },
    rotateAxis:{
        x: new THREE.Vector3(-1, 0, 0),
        x_: new THREE.Vector3(1, 0, 0),
        y: new THREE.Vector3(0, -1, 0),
        y_: new THREE.Vector3(0, 1, 0),
        z: new THREE.Vector3(0, 0, -1),
        z_: new THREE.Vector3(0, 0, 1)
    },
    applyRotate: function(rotateName, eulerAngle){
        if(rotateName == 'x'){ eulerAngle.x -= Math.PI / 2; }
        else if(rotateName == 'x_'){ eulerAngle.x += Math.PI / 2; }
        else if(rotateName == 'y'){ eulerAngle.y -= Math.PI / 2; }
        else if(rotateName == 'y_'){ eulerAngle.y += Math.PI / 2; }
        else if(rotateName == 'z'){ eulerAngle.z -= Math.PI / 2; }
        else if(rotateName == 'z_'){ eulerAngle.z += Math.PI / 2; }
    }
};

/**
 * 计算两个置换的复合置换
 */
function multiplyRotatePermutation(a, b){
    let result = [];
    for(let i of b){
        result.push(a[i]);
    }
    return result;
}

/**
 * 从指定的状态到另一个状态的最短旋转路径
 * 广度优先搜索, 从程序上看, 有可能执行6^24次搜索, 待优化
 */
function getRotatePathForRotatePermutationGroup(source, target){
    if(!checkRotateStatusForRotatePermutation(source)){
        console.warn("illegal source", source);
        return null;
    }
    if(!checkRotateStatusForRotatePermutation(target)){
        console.warn("illegal target", target);
        return null;
    }
    if(source.length != 6){
        // 确定source的实际值
        let fullsource = fillRotateStatusForRotatePermutation(source);
        if(fullsource == null){
            console.warn("nonexistent source status : ", source);
            return null;
        }
        source = fullsource;
    }
    if(specialMatch(source, target)){
        return [];  // 说明来源状态和目标状态一致, 不需要旋转
    }
    let currentStatusPath = [{
        status : source,
        path : []
    }];
    let nextStatusPath = [];
    for(let i = 0; i < 24; i++){
        for(let cursorPath of currentStatusPath){
            let currentStatus = cursorPath.status;
            for(let k in RotatePermutationGroup.generateElement){
                let v = RotatePermutationGroup.generateElement[k];
                let newStatus = multiplyRotatePermutation(currentStatus, v);
                if(specialMatch(newStatus, target)){
                    cursorPath.path.push({
                        name: k,
                        permutation: v
                    });
                    return cursorPath.path; 
                }
                else{
                    let newPath = [];
                    for(let p of cursorPath.path){
                        newPath.push(p);
                    }
                    newPath.push({
                        name: k,
                        permutation: v
                    });
                    nextStatusPath.push({
                        status : newStatus,
                        path : newPath
                    });
                }
            }
        }
        currentStatusPath = nextStatusPath;
        nextStatusPath = [];
    }
    return null;
}

// 补全旋转状态, 旋转状态共有6个值, 但是, 根据两个值就可以确定整个状态
function fillRotateStatusForRotatePermutation(rotateStatus){
    let currentStatusArr = [RotatePermutationGroup.identity];
    let nextStatusArr = [];
    for(let k in RotatePermutationGroup.generateElement){
        let p = RotatePermutationGroup.generateElement[k];
        if(specialMatch(p, rotateStatus)){
            return p;
        }
    }
    for(let i = 0; i < 24; i++){
        for(let status of currentStatusArr){
            for(let k in RotatePermutationGroup.generateElement){
                let v = RotatePermutationGroup.generateElement[k];
                let newStatus = multiplyRotatePermutation(status, v);
                if(specialMatch(newStatus, rotateStatus)){ 
                    return newStatus; 
                }
                else{
                    nextStatusArr.push(newStatus);
                }
            }
        }
        currentStatusArr = nextStatusArr;
        nextStatusArr = [];
    }
    return null;
}

/*
 * 1. 最少有2个值, 否则无法确定唯一的状态
 * 2. 最多有6个值
 * 3. 一些值不能"相邻"
 */
function checkRotateStatusForRotatePermutation(status){
    if(status.length < 2 || status.length > 6){ return false; }
    for(let i = 0; i < status.length; i++){
        let s = status[i];
        if(s < 0){ continue; }  // 表示这个状态未指定
        let exceptPosIndex = RotatePermutationGroup.illegalSequence[i];
        let illegalValue = RotatePermutationGroup.illegalSequence[s];
        for(let j = 0; j < status.length; j++){
            if(exceptPosIndex == j){
                continue;
            }
            if(status[j] == illegalValue){
                return false;
            }
        }
    }
    return true;
}

/*
 * 判断一个数组是否与另一个数组匹配, 如果值是-1, 表示跳过该位置
 */
function specialMatch(array, subArray){
    for(let i = 0; i < subArray.length; i++){
        if(array[i] == -1 || subArray[i] == -1){ continue; }
        if(array[i] != subArray[i]){
            return false;
        }
    }
    return true;
}

/**
 * 求两个数组的交集
 */
function intersection(a, b){
    if(a.length == 0 || b.length == 0){ return []; }
    let result = [];
    for(let ai of a){
        if(b.indexOf(ai) >= 0){
            result.push(ai);
        }
    }
    return result;
}

function copyArray(array){
    let result = [];
    for(let a of array){
        result.push(a);
    }
    return result;
}

/**
 * 魔方动作类
 * 
 * 魔方执行一个动作, 针对其中一个块, 可以拆解为平移+旋转
 * 其中, 
 *    1. 平移:
 *      使用permutation来描述, 这是一个置换, 首先魔方的27个棱块采用如下编号顺序:
 * 
 *              ──────────────
 *            / 6  / 15 / 24 /
 *           / 7  / 16 / 25 /
 *          / 8  / 17 / 26 /
 *         ────────────────
 *              ──────────────
 *            / 3  / 12 / 21 /
 *           / 4  / 13 / 22 /            y
 *          / 5  / 14 / 23 /             |
 *         ────────────────              |
 *              ──────────────           |
 *            / 0  / 9  / 18 /           ─────────── x
 *           / 1  / 10 / 19 /           /
 *          / 2  / 11 / 20 /           /
 *        ────────────────           z
 * 
 *     permutation采用标准的置换表示方法, 使用长度为27的数组, 表示单一置换
 *    2. 旋转
 *      使用axis进行描述, 这是一个向量值, 表示绕该法向量遵循右手定则(大拇指指向法线方向, 四指握拳指向旋转方向)旋转90度
 * 
 *  此外, 还包含颜色置换(colorPermutation)属性, 这个实际上与上述的旋转同构, 只是这个更方便的监控每个块的颜色朝向, 
 *  colorPermutation实际值就是RotatePermutationGroup的值
 */
class CubeAction{
    constructor(permutation, axis, colorPermutation){
        this.permutation = permutation; // 置换, 记录魔方27个方块位置如何置换
        this.axis = axis; // 旋转轴
        this.colorPermutation = colorPermutation;
    }
}

const BasicActions = ["U", "U2", "U_", "R", "R2", "R_", "F", "F2", "F_", "D", "D2", "D_", "L", "L2", "L_", "B", "B2", "B_"];

/**
 * "动作群"(有限生成群)的生成元
 */
const ActionGroup = {
    R : new CubeAction([
        -1, -1, -1, 
        -1, -1, -1,
        -1, -1, -1,

        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,

        24, 21, 18,
        25, 22, 19,
        26, 23, 20
    ], new THREE.Vector3( -1, 0, 0 ), RotatePermutationGroup.generateElement.x),
    R_ : new CubeAction([
        -1, -1, -1, 
        -1, -1, -1,
        -1, -1, -1,

        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,
        
        20, 23, 26,
        19, 22, 25,
        18, 21, 24
    ], new THREE.Vector3( 1, 0, 0 ), RotatePermutationGroup.generateElement.x_),
    U: new CubeAction([
        -1, -1, -1,
        -1, -1, -1,
        8, 17, 26,

        -1, -1, -1,
        -1, -1, -1,
        7, 16, 25,

        -1, -1, -1,
        -1, -1, -1,
        6, 15, 24
    ], new THREE.Vector3(0, -1, 0), RotatePermutationGroup.generateElement.y),
    U_: new CubeAction([
        -1, -1, -1,
        -1, -1, -1,
        24, 15, 6,

        -1, -1, -1,
        -1, -1, -1,
        25, 16, 7,

        -1, -1, -1,
        -1, -1, -1,
        26, 17, 8
    ], new THREE.Vector3(0, 1, 0), RotatePermutationGroup.generateElement.y_),
    F : new CubeAction([
        -1, -1, 20,
        -1, -1, 11,
        -1, -1, 2,

        -1, -1, 23,
        -1, -1, 14,
        -1, -1, 5,

        -1, -1, 26,
        -1, -1, 17,
        -1, -1, 8
    ], new THREE.Vector3(0, 0, -1), RotatePermutationGroup.generateElement.z),
    F_ : new CubeAction([
        -1, -1, 8,
        -1, -1, 17,
        -1, -1, 26,

        -1, -1, 5,
        -1, -1, 14,
        -1, -1, 23,

        -1, -1, 2,
        -1, -1, 11,
        -1, -1, 20
    ], new THREE.Vector3(0, 0, 1), RotatePermutationGroup.generateElement.z_),
    D : new CubeAction([
        18, 9, 0,
        -1, -1, -1,
        -1, -1, -1,

        19, 10, 1,
        -1, -1, -1,
        -1, -1, -1,

        20, 11, 2,
        -1, -1, -1,
        -1, -1, -1
    ], new THREE.Vector3(0, 1, 0), RotatePermutationGroup.generateElement.y_),
    D_ : new CubeAction([
        2, 11, 20,
        -1, -1, -1,
        -1, -1, -1,

        1, 10, 19,
        -1, -1, -1,
        -1, -1, -1,

        0, 9, 18,
        -1, -1, -1,
        -1, -1, -1
    ], new THREE.Vector3(0, -1, 0), RotatePermutationGroup.generateElement.y),
    L : new CubeAction([
        2, 5, 8,
        1, 4, 7,
        0, 3, 6,

        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,

        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1
    ], new THREE.Vector3(1, 0, 0), RotatePermutationGroup.generateElement.x_),
    L_ : new CubeAction([
        6, 3, 0, 
        7, 4, 1,
        8, 5, 2,

        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,

        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1
    ], new THREE.Vector3(-1, 0, 0), RotatePermutationGroup.generateElement.x),
    B : new CubeAction([
        6, -1, -1,
        15, -1, -1,
        24, -1, -1,

        3, -1, -1,
        12, -1, -1,
        21, -1, -1,

        0, -1, -1,
        9, -1, -1,
        18, -1, -1
    ], new THREE.Vector3(0, 0, 1), RotatePermutationGroup.generateElement.z_),
    B_ : new CubeAction([
        18, -1, -1,
        9, -1, -1,
        0, -1, -1,

        21, -1, -1,
        12, -1, -1,
        3, -1, -1,

        24, -1, -1,
        15, -1, -1,
        6, -1, -1
    ], new THREE.Vector3(0, 0, -1), RotatePermutationGroup.generateElement.z),
    E : new CubeAction([
        -1, -1, -1,
        21, 12, 3,
        -1, -1, -1,

        -1, -1, -1,
        22, 13, 4,
        -1, -1, -1,

        -1, -1, -1,
        23, 14, 5,
        -1, -1, -1
    ], new THREE.Vector3(0, 1, 0), RotatePermutationGroup.generateElement.y_),
    E_ : new CubeAction([
        -1, -1, -1,
        5, 14, 23,
        -1, -1, -1,

        -1, -1, -1,
        4, 13, 22,
        -1, -1, -1,

        -1, -1, -1,
        3, 12, 21,
        -1, -1, -1
    ], new THREE.Vector3(0, -1, 0), RotatePermutationGroup.generateElement.y),
    M : new CubeAction([
        -1, -1, -1, 
        -1, -1, -1,
        -1, -1, -1,

        11, 14, 17,
        10, 13, 16,
        9, 12, 15,

        -1, -1, -1, 
        -1, -1, -1,
        -1, -1, -1
    ], new THREE.Vector3( 1, 0, 0 ), RotatePermutationGroup.generateElement.x_),
    M_ : new CubeAction([
        -1, -1, -1, 
        -1, -1, -1,
        -1, -1, -1,

        15, 12, 9,
        16, 13, 10,
        17, 14, 11,
        
        -1, -1, -1, 
        -1, -1, -1,
        -1, -1, -1
    ], new THREE.Vector3( -1, 0, 0 ), RotatePermutationGroup.generateElement.x),
    S : new CubeAction([
        -1, 19, -1,
        -1, 10, -1,
        -1, 1, -1,

        -1, 22, -1,
        -1, 13, -1,
        -1, 4, -1,

        -1, 25, -1,
        -1, 16, -1,
        -1, 7, -1
    ], new THREE.Vector3(0, 0, -1), RotatePermutationGroup.generateElement.z),
    S_ : new CubeAction([
        -1, 7, -1,
        -1, 16, -1,
        -1, 25, -1,

        -1, 4, -1,
        -1, 13, -1,
        -1, 22, -1,

        -1, 1, -1,
        -1, 10, -1,
        -1, 19, -1
    ], new THREE.Vector3(0, 0, 1), RotatePermutationGroup.generateElement.z_)
};

/**
 * 标准魔方转动标记(辛马斯特标记)
 * R（Right）、L（Left）、U（Up）、D（Down）、F（Front）、B（Back）
 */
const StandardCubeAction = {
    R:[ ActionGroup.R ],
    R_: [ ActionGroup.R_ ],
    R2 : [ ActionGroup.R, ActionGroup.R ],
    U: [ ActionGroup.U ],
    U_ : [ActionGroup.U_ ],
    U2 : [ ActionGroup.U, ActionGroup.U ],
    F: [ ActionGroup.F ],
    F_: [ ActionGroup.F_ ],
    F2 : [ ActionGroup.F, ActionGroup.F ],
    D: [ ActionGroup.D ],
    D_: [ ActionGroup.D_ ],
    D2: [ ActionGroup.D, ActionGroup.D ],
    L: [ ActionGroup.L ],
    L_: [ ActionGroup.L_ ],
    L2: [ ActionGroup.L, ActionGroup.L ],
    B: [ ActionGroup.B ],
    B_: [ ActionGroup.B_ ],
    B2: [ ActionGroup.B, ActionGroup.B ],
    E : [ ActionGroup.E ],
    E_: [ ActionGroup.E_ ],
    E2 : [ ActionGroup.E, ActionGroup.E ],
    M: [ ActionGroup.M ],
    M_: [ ActionGroup.M_ ],
    M2: [ ActionGroup.M, ActionGroup.M ],
    S: [ ActionGroup.S ],
    S_: [ ActionGroup.S_],
    S2: [ ActionGroup.S, ActionGroup.S ],
    r : [ ActionGroup.R, ActionGroup.M_ ],
    r_ : [ ActionGroup.R_, ActionGroup.M ],
    r2 : [ ActionGroup.R, ActionGroup.M_, ActionGroup.R, ActionGroup.M_ ],
    u : [ ActionGroup.U, ActionGroup.E_ ],
    u_ : [ ActionGroup.U_, ActionGroup.E ],
    u2 : [ ActionGroup.U, ActionGroup.E_, ActionGroup.U, ActionGroup.E_ ],
    f : [ ActionGroup.F, ActionGroup.S ],
    f_ : [ ActionGroup.F_, ActionGroup.S_ ],
    f2 : [ ActionGroup.F, ActionGroup.S, ActionGroup.F, ActionGroup.S ],
    d : [ ActionGroup.D, ActionGroup.E ],
    d_ : [ ActionGroup.D_, ActionGroup.E_ ],
    d2 : [ ActionGroup.D, ActionGroup.E, ActionGroup.D, ActionGroup.E ],
    l : [ ActionGroup.L, ActionGroup.M ],
    l_ : [ ActionGroup.L_, ActionGroup.M_ ],
    l2 : [ ActionGroup.L, ActionGroup.M, ActionGroup.L, ActionGroup.M ],
    b : [ ActionGroup.B, ActionGroup.S_ ],
    b_ : [ ActionGroup.B_, ActionGroup.S ],
    b2 : [ ActionGroup.B, ActionGroup.S_, ActionGroup.B, ActionGroup.S_ ],
    x : [ ActionGroup.R, ActionGroup.M_, ActionGroup.L_ ],
    x_ : [ ActionGroup.R_, ActionGroup.M, ActionGroup.L ],
    x2 : [ ActionGroup.R, ActionGroup.M_, ActionGroup.L_, ActionGroup.R, ActionGroup.M_, ActionGroup.L_ ],
    y : [ ActionGroup.U, ActionGroup.E_, ActionGroup.D_ ],
    y_ : [ ActionGroup.U_, ActionGroup.E, ActionGroup.D ],
    y2 : [ ActionGroup.U, ActionGroup.E_, ActionGroup.D_, ActionGroup.U, ActionGroup.E_, ActionGroup.D_ ],
    z: [ ActionGroup.F, ActionGroup.S, ActionGroup.B_ ],
    z_: [ ActionGroup.F_, ActionGroup.S_, ActionGroup.B ],
    z2: [ ActionGroup.F, ActionGroup.S, ActionGroup.B_, ActionGroup.F, ActionGroup.S, ActionGroup.B_ ],
};

const rubikCube = {
    rank: 3,     // 3阶魔方, 不可改动, 代码中StandardCubeAction置换是只针对3阶魔方的
    /**
     * 魔方索引地图, 初始状态下, 魔方索引是按顺序排列的(具体顺序见CubeAction注释), 每执行一次转动, 方块都会移动到一个新的位置
     * cubeIndexMap长度为27, 位置按照CubeAction注释图中标定, 每个方块编号也和注释图中一致, 初始情况下, 方块编号与位置重合, 转动之后, 数组记录了每个位置实际方块编号
     */
    cubeIndexMap:[],
    cubes:{},   // threejs THREE.InstancedMesh对象
    // 颜色状态地图, 共27个元素的数组, 索引值与方块索引(即cubeIndexMap的值)一一对应(注意, 不是与位置编号对应)
    colorMap:[
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L],
        [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L]
    ],
    corner:[0, 2, 6, 8, 18, 20, 24, 26],    // 所有角块编号集合
    edge:[1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25], // 所有棱块
    center: [4, 10, 12, 14, 16, 22], // 所有中心块
    threeJsHolder : null,   // threeJs操作持有者
    init : function(threeJsHolder){  // 初始化
        this.threeJsHolder = threeJsHolder;
        const geometry = new THREE.BoxGeometry();
        const m1 = generateMaterial(CubeColor.R);
        const m2 = generateMaterial(CubeColor.L);
        const m3 = generateMaterial(CubeColor.U);
        const m4 = generateMaterial(CubeColor.D);
        const m5 = generateMaterial(CubeColor.F);
        const m6 = generateMaterial(CubeColor.B);
        const meterials = new Array();
        meterials.push(m1);
        meterials.push(m2);
        meterials.push(m3);
        meterials.push(m4);
        meterials.push(m5);
        meterials.push(m6);
        this.cubes = new THREE.InstancedMesh(geometry, meterials, this.rank * this.rank * this.rank);
        let i = 0;
        const matrix = new THREE.Matrix4();
        for(let x = 0; x < this.rank; x++){
            for(let y = 0; y < this.rank; y++){
                for(let z = 0; z < this.rank; z++){
                    this.cubeIndexMap.push(i);
                    let coordinate = this.matrixPositionFix(x, y, z);
                    matrix.setPosition(coordinate.x, coordinate.y, coordinate.z);
                    this.cubes.setMatrixAt(i, matrix);
                    i++;
                }
            }
        }
    },
    matrixPositionFix: function (x, y, z){  // InstancedMesh矩阵位置修正
        let offset = (this.rank - 1) / 2;
        return {
            x : x - offset,
            y : y - offset,
            z : z - offset
        };
    },
    permute: function(action){
        // 根据定义的置换, 对cubeIndexMap, colorMap进行置换操作
        for(let act of action){
            let newCubeMap = [];
            let newColorMap = [];
            let i = 0;
            for(let x = 0; x < this.rank; x++){
                for(let y = 0; y < this.rank; y++){
                    for(let z = 0; z < this.rank; z++){
                        let source = act.permutation[i];
                        if(source >= 0){
                            newCubeMap.push(this.cubeIndexMap[source]);

                            // 单块颜色置换
                            let oldColorStatus = this.colorMap[source];
                            let newColorStatus = multiplyRotatePermutation(oldColorStatus, act.colorPermutation);
                            newColorMap.push(newColorStatus);
                        }else{
                            newCubeMap.push(this.cubeIndexMap[i]);
                            newColorMap.push(this.colorMap[i]);
                        }
                        i++;
                    }
                }
            }
            this.cubeIndexMap = newCubeMap;
            this.colorMap = newColorMap;
        }
    },
    move: function(action, notation){ // 将需要指定的动作, 放入执行队列
        this.animationQueue.push({
            currentFrameIndex: 0,
            action: action,
            notation: notation
        });
    },
    doMove: function(action, angle){    // 根据指定的角度, 动作, 实际执行转动操作
        const matrix = new THREE.Matrix4();
        let v = new THREE.Vector3();
        let q = new THREE.Quaternion();
        let s = new THREE.Vector3();
        for(let act of action){
            let i = 0;
            for(let x = 0; x < this.rank; x++){
                for(let y = 0; y < this.rank; y++){
                    for(let z = 0; z < this.rank; z++){
                        let target = act.permutation[i];
                        if(target >= 0){
                            let index = this.cubeIndexMap[i];
                            this.cubes.getMatrixAt(index, matrix);
                            
                            matrix.decompose(v, q, s);
                
                            const quaternion = new THREE.Quaternion();
                            quaternion.setFromAxisAngle(act.axis, angle);
                            v.applyQuaternion(quaternion);
                
                            q.premultiply(quaternion);
                
                            matrix.compose(v, q, s);
                            this.cubes.setMatrixAt(index, matrix);
                        }
                        i++;
                    }
                }
            }
        }
        this.cubes.instanceMatrix.needsUpdate = true;
        this.threeJsHolder.renderer.render(this.threeJsHolder.scene, this.threeJsHolder.camera);
    },
    actionDoneCallback:null,    // 一个动作执行完成后, 回调 notation -> { do something }
    animationQueue:[],  // 动作队列
    animationSpeed: 20, // 到达指定位置所需帧数量
    finishMove: function(action, notation){
        this.animationQueue.shift();
        this.permute(action);
        if(this.actionDoneCallback){
            this.actionDoneCallback(notation);
        }
    },
    animation: function(){
        if(this.animationQueue.length > 0){
            let top = this.animationQueue[0];
            if(top.currentFrameIndex >= this.animationSpeed){
                this.finishMove(top.action, top.notation);
            }else{
                top.currentFrameIndex++;
                this.doMove(top.action, Math.PI / (2 * this.animationSpeed));
            }
        }
    },
    standardColorPosition:{
        /**
         * 数组索引表示标准魔方展开上编号, 数组值表示立体魔方中块的位置, 以D为例, 分布如下:
         * ┌──┬──┬──┐
         * │ 2│11│20│
         * ├──┼──┼──┤
         * │ 1│10│19│
         * ├──┼──┼──┤
         * │ 0│ 9│18│
         * └──┴──┴──┘
         * 如果输入(D, 0), 即底面的第一个块, 根据上图, 可以确定在立方体中编号为18, 再根据CubeAction注释图, 可以确定位置在(x, y, z) = (3, 0, 0)位置
         */
        "D":[2, 11, 20, 1, 10, 19, 0, 9, 18], // 底面
        "F":[8, 17, 26, 5, 14, 23, 2, 11, 20], // 前面
        "U":[6, 15, 24, 7, 16, 25, 8, 17, 26], // 上面
        "B":[24, 15, 6, 21, 12, 3, 18, 9, 0],// 后面
        "R":[26, 25, 24, 23, 22, 21, 20, 19, 18], // 右面
        "L":[6, 7, 8, 3, 4, 5, 0, 1, 2] // 左面
    },
    getFaceNumber: function(face){  // 根据面名称, 判断面所属的index, 与RotatePermutationGroup注释所标注的一致
        for(let k in CubeColor){
            if(face == k){
                return CubeColor[k];
            }
        }
        console.warn("unrecognized face");
        return -1;
    },
    getFaceByFaceNumber: function(faceNumber){
        let face = null;
        if(faceNumber == 0){
            face = 'D';
        }else if(faceNumber == 1){
            face = 'F';
        }else if(faceNumber == 2){
            face = 'U';
        }else if(faceNumber == 3){
            face = 'B';
        }else if(faceNumber == 4){
            face = 'R';
        }else if(faceNumber == 5){
            face = 'L';
        }
        return face;
    },
    getColorByPosInfo: function(face /*所在面*/, pos/*在指定面上的编号, 按照标准魔方展开图, 每个面进行编号, 1 -- 9*/){
        let faceNo = this.getFaceNumber(face);
        if(faceNo == -1){ return "#000000"; }
        if(pos < 1 || pos > 9){
            console.warn("pos out of range 1 -- 9, real : " + pos);
            return "#000000";
        }
        let cubeNo = this.standardColorPosition[face][pos - 1];
        let color = this.colorMap[cubeNo][faceNo];
        return CubeColor.properties[color].value;
    },
    baseInfo: RotatePermutationGroup.identity,   // 默认状态下魔方的摆放
    rebase : function(){    // 重定义魔方的基准摆放, 默认是白底, 蓝面在前
        let cameraQuaternion = new THREE.Quaternion();
        this.threeJsHolder.camera.getWorldQuaternion(cameraQuaternion);
        let cameraEuler = new THREE.Euler();
        cameraEuler.setFromQuaternion(cameraQuaternion.normalize());
        let x = Math.round(cameraEuler.x / (Math.PI / 2));
        let y = Math.round(cameraEuler.y / (Math.PI / 2));
        let z = Math.round(cameraEuler.z / (Math.PI / 2));
        
        let rotateSub = new Array();
        for(let i = 0; i < x; i++){
            rotateSub.push('x');
        }
        for(let i = 0; i > x; i--){
            rotateSub.push('x_');
        }
        for(let i = 0; i < y; i++){
            rotateSub.push('y');
        }
        for(let i = 0; i > y; i--){
            rotateSub.push('y_');
        }
        for(let i = 0; i < z; i++){
            rotateSub.push('z');
        }
        for(let i = 0; i > z; i--){
            rotateSub.push('z_');
        }

        if(rotateSub.length > 0){
            let targetBase = this.baseInfo;
            for(let rotate of rotateSub){
                targetBase = multiplyRotatePermutation(targetBase, RotatePermutationGroup.generateElement[rotate]);
            }
            let rotatePath = getRotatePathForRotatePermutationGroup(this.baseInfo, targetBase);
            if(rotatePath != null && rotatePath.length > 0){
                let newBaseInfo = this.baseInfo;
                let rotateEular = new THREE.Euler( 0, 0, 0, 'XYZ');
                for(let rotate of rotatePath){
                    RotatePermutationGroup.applyRotate(rotate.name, rotateEular);
                    let action = StandardCubeAction[rotate.name];
                    this.doMove(action, Math.PI / 2);
                    this.finishMove(action);
                    newBaseInfo = multiplyRotatePermutation(newBaseInfo, rotate.permutation);
                }
                this.threeJsHolder.camera.position.applyAxisAngle(new THREE.Vector3( 1, 0, 0 ), rotateEular.x);
                this.threeJsHolder.camera.position.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), rotateEular.y);
                this.threeJsHolder.camera.position.applyAxisAngle(new THREE.Vector3( 0, 0, 1 ), rotateEular.z);
                this.threeJsHolder.camera.updateProjectionMatrix();
                this.baseInfo = newBaseInfo;
            }
        }
    },
    reset: function(){
        this.baseInfo = RotatePermutationGroup.identity;
        let standardColor = [CubeColor.D, CubeColor.F, CubeColor.U, CubeColor.B, CubeColor.R, CubeColor.L];
        this.colorMap = [];
        const matrix = new THREE.Matrix4();
        let i = 0;
        let v = new THREE.Vector3();
        let q = new THREE.Quaternion();
        let s = new THREE.Vector3();
        this.cubeIndexMap = [];
        for(let x = 0; x < this.rank; x++){
            for(let y = 0; y < this.rank; y++){
                for(let z = 0; z < this.rank; z++){
                    this.cubeIndexMap.push(i);
                    let colors = [];
                    for(let c of standardColor){
                        colors.push(c);
                    }
                    this.colorMap.push(colors);

                    matrix.decompose(v, q, s);
                    let coordinate = this.matrixPositionFix(x, y, z);
                    v.set(coordinate.x, coordinate.y, coordinate.z);
                    matrix.compose(v, q, s);

                    this.cubes.setMatrixAt(i, matrix);
                    i++;
                }
            }
        }
        this.cubes.instanceMatrix.needsUpdate = true;
        this.actionDoneCallback();
        ThreeJsContainer.cameraResetDefault();
    },
    isRotating: function(){
        return this.animationQueue.length > 0;
    }, 
    // 根据颜色数组, 给出该方块的编号, 如果是棱块, colors.length = 2, 如果是角块, colors.length = 3...
    getCubeNumber: function(colors){
        if(colors.length < 1 ||colors.length > 3){
            console.warn("illegal colors length", colors);
            return -1;
        }
        let potentialCubes = this.standardColorPosition[this.getFaceByFaceNumber(colors[0])];
        for(let i = 1; i < colors.length; i++){
            let face = this.getFaceByFaceNumber(colors[i]);
            let cubeNums = this.standardColorPosition[face];
            potentialCubes = intersection(cubeNums, potentialCubes);
        }
        if(potentialCubes.length == 0){ return -1; }
        else if(potentialCubes.length == 1){ return potentialCubes[0]; }
        else if(colors.length == 1){ // 中心块
            potentialCubes = intersection(potentialCubes, this.center);
        }else if(colors.length == 2){ // 棱块
            potentialCubes = intersection(potentialCubes, this.edge);
        }

        if(potentialCubes.length == 1){
            return potentialCubes[0];
        }else {
            return -1;
        }
    },
    // 重新组装魔方
    /**
     * 输入参数格式:
     * {
     *     "F": [color0, ... color5],
     *     "U": [...],
     *     ...
     *     "D": [color0, ... color5]
     * }
     */
    reassembly: function(colorStatus, checkFailedCallback, successCallback){
        // 记录27个块的颜色状态
        let cubesColors = [
            [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1]
        ];
        let count = 0;
        for(let k in colorStatus){
            count++;
            let colors = colorStatus[k];
            let faceMap = this.standardColorPosition[k];
            let faceNumber = this.getFaceNumber(k);
            if(colors.length != 9){
                if(checkFailedCallback){
                    checkFailedCallback();
                }
                return;
            }
            for(let i = 0; i < 9; i++){
                let cubeNumber = faceMap[i];
                cubesColors[cubeNumber][faceNumber] = colors[i];
            }
        }
        if(count != 6){
            checkFailedCallback();
            return;
        }

        let permutation = [];
        let cubeRotates = [];
        let newColorMap = [];
        for(let cc of cubesColors){
            let validColors = [];
            for(let c of cc){
                if(c >= 0){
                    validColors.push(c);
                }
            }
            newColorMap.push(copyArray(RotatePermutationGroup.identity));
            let cubeNumber = -1;
            if(validColors.length > 0){    // 最中心的块, 未定义
                cubeNumber = this.getCubeNumber(validColors);
                if(cubeNumber < 0){
                    if(checkFailedCallback){
                        checkFailedCallback();
                    }
                    return;
                }
                let path = getRotatePathForRotatePermutationGroup(RotatePermutationGroup.identity, cc);
                if(path.length > 0){
                    let colorStatus = RotatePermutationGroup.identity;
                    for(let p of path){
                        colorStatus = multiplyRotatePermutation(colorStatus, p.permutation);
                    }
                    newColorMap[newColorMap.length - 1] =  colorStatus;
                }
                cubeRotates.push(path);
            }else{
                cubeRotates.push([]);
            }
            if(cubeNumber < 0){ // 未定义的块, 不动
                permutation.push(permutation.length);
            }else if(permutation.indexOf(cubeNumber) < 0){
                permutation.push(cubeNumber);
            }else{
                if(checkFailedCallback){
                    checkFailedCallback();
                }
                return;
            }
        }

        // 由于定义的结构, 这里需要校验防止角块安装到棱块位置上, 棱块安装到角块位置上等等
        if(this.isMismatch(permutation)){
            checkFailedCallback();
            return;
        }

        if(!this.isSolvable(permutation, newColorMap)){
            checkFailedCallback();
            return;
        }

        let q = new THREE.Quaternion();
        let s = new THREE.Vector3();
        let v = new THREE.Vector3();
        const matrix = new THREE.Matrix4();
        for(let i = 0; i < permutation.length; i++){
            let translation = permutation[i];
            this.cubes.getMatrixAt(translation, matrix);
            matrix.decompose(v, q, s);

            // 平移
            let coordinate = decomposeCubeIndexToCoordinate(i);
            coordinate = this.matrixPositionFix(coordinate.x, coordinate.y, coordinate.z);
            v.set(coordinate.x, coordinate.y, coordinate.z);
            q.set(0, 0, 0, 1);
            
            // 旋转
            let rotate = cubeRotates[i];
            if(rotate.length > 0){
                for(let r of rotate){
                    const quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(RotatePermutationGroup.rotateAxis[r.name], Math.PI / 2);     
                    q.premultiply(quaternion);
                }
            }
            
            matrix.compose(v, q, s);
            this.cubes.setMatrixAt(translation, matrix);
        }
        
        this.cubeIndexMap = permutation;
        this.colorMap = newColorMap;
        this.cubes.instanceMatrix.needsUpdate = true;

        successCallback();
    },
    getExposeColor: function(cubeNumber){
        let expose = [];
        for(let k in this.standardColorPosition){
            if(this.standardColorPosition[k].indexOf(cubeNumber) >= 0){
                expose.push(CubeColor[k]);
            }
        }
        return expose;
    },
    /**
     * 获取指定编号的魔方块的信息
     * posDistribution -- 魔方块分布信息
     * colorStatus -- 魔方颜色状态
     * cubeNumber -- 块的编号(即初始位置信息)
     */
    getCubeInfo: function(posDistribution, colorStatus, cubeNumber){
        let expose = this.getExposeColor(cubeNumber); // 该块的颜色
        let currentPosition = posDistribution.indexOf(cubeNumber);
        let selfColorStatus = colorStatus[currentPosition]; // 该块的颜色置换状态
        if(selfColorStatus == null || selfColorStatus.length == 0){
            selfColorStatus = RotatePermutationGroup.identity;
        }
        let result = {
            colorInfo: {}
        };
        for(let e of expose){
            let faceNo = selfColorStatus.indexOf(e);
            result.colorInfo[this.getFaceByFaceNumber(faceNo)] = e;
        }

        return result;
    },
    // 判断是否错位: 角块放到棱块位置, 棱块放到中心块位置...
    isMismatch: function(permutation){
        for(let n of this.corner){
            if(this.corner.indexOf(permutation[n]) < 0){
                return true;
            }
        }

        for(let n of this.edge){
            if(this.edge.indexOf(permutation[n]) < 0){
                return true;
            }
        }

        for(let n of this.center){
            if(this.center.indexOf(permutation[n]) < 0){
                return true;
            }
        }

        return false;
    },
    isSolvable: function(permutation, colorMap){
        /**
         * 判断是否是正确的状态, 是否可解(https://math.stackexchange.com/a/127627, https://www.zhihu.com/question/322875785/answer/672641077)
         * 1. 奇偶校验:
         *      所有角块和棱块当前位置信息和初始位置信息之间可以通过一个置换来表示, 这个置换一定是偶置换, 否则是不可解的;
         *      假如魔方转动一个面90度, 那么对于这个面上的角块和棱块来说, 形成两个4循环置换, 所以是偶置换.
         * 2. 棱块色相:
         *      定义: 上下 -- 高级面; 前后 -- 中级面; 左右 -- 低级面
         *      棱块中较高级的颜色位于较高级的面上, 称为朝向正确
         *      -- 正确的棱块个数必须是偶数
         * 3. 角块色相:
         *      定义: 白色 和 黄色 面为基准面
         *      白色或者黄色角块位于基准面上, 则视为朝向正确(白色可以位于黄色面, 黄色可以位于白色面)
         *      顺时针120度旋转所有角块, 使所有棱块朝向正确, 总共旋转次数必须为3的倍数
         */

        // 奇偶校验
        let inversion = 0; // 逆序数
        for(let i = 1; i < permutation.length; i++){
            for(let j = 0; j < i; j++){
                if(permutation[i] < permutation[j]){
                    inversion++;
                }
            }
        }
        if(inversion % 2 != 0){
            return false;
        }

        // 棱块色相
        let correctEdge = 0;
        // 给面和色块分为高级/中级/低级 进行打分
        function markColorFace(number){
            if(number == 0 || number == 2){ // 底面和上面为高级面
                return 3;
            }else if(number == 1 || number == 3){ // 前面和后面为中级面
                return 2;
            }else { // 左面后右面为低级面
                return 1;
            } 
        }
        for(let e of this.edge){
            let cubeInfo = this.getCubeInfo(permutation, colorMap, e);
            let faces = Object.keys(cubeInfo.colorInfo);
            let faceCheck = markColorFace(this.getFaceNumber(faces[0])) > markColorFace(this.getFaceNumber(faces[1]));
            let colorCheck = markColorFace(cubeInfo.colorInfo[faces[0]]) > markColorFace(cubeInfo.colorInfo[faces[1]]);
            if(!(faceCheck ^ colorCheck)){
                correctEdge++;
            }
        }
        if(correctEdge % 2 != 0){
            return false;
        }

        // 角块色相
        let rotatePermutation = [
            [5, 2, 4, 0, 1, 3], // 0号角块顺时针120度旋转的置换表示
            [1, 5, 3, 4, 2, 0], // 1号角块顺时针120度旋转的置换表示
            [1, 4, 3, 5, 0, 2], // ...
            [4, 2, 5, 0, 3, 1],
            [3, 5, 1, 4, 0, 2], 
            [4, 0, 5, 2, 1, 3],
            [5, 0, 4, 2, 3, 1],
            [3, 4, 1, 5, 2, 0]
        ];
        let rotateCount = 0;
        let rotateIndex = 0;
        for(let c of this.corner){
            let colorStatus = colorMap[c];
            while(colorStatus[2] != CubeColor.U && colorStatus[2] != CubeColor.D){
                colorStatus = multiplyRotatePermutation(colorStatus, rotatePermutation[rotateIndex]);
                rotateCount++;
            }
            rotateIndex++;
        }
        return rotateCount % 3 == 0;
    },
    /**
     * 简单的打乱, 不保证满足WCA的打乱要求, 返回打乱后的公式数组
     * @param onlyBasic -- 是否只使用18个基本动作
     */
    scramble: function(onlyBasic){
        let step = 10 + Math.ceil(Math.random() * 10);  // 生成的总步数, 最小10步, 最大20步
        let exclude;
        let result = [];
        let actions = onlyBasic ? BasicActions : Object.keys(ActionGroup);
        for(let i = 0; i < step; i++){
            let index = Math.floor(Math.random() * actions.length);
            while(actions[index] == exclude){
                index = Math.floor(Math.random() * actions.length);
            }
            let notation = actions[index];
            if(notation.endsWith('_')){
                exclude = notation.replace('_', '');
            }else{
                exclude = notation + "_";
            }
            result.push(notation);
        }

        return result;
    }
};

export function debug(){
    // nothing
    return {
        position: rubikCube.cubeIndexMap,
        direction: rubikCube.colorMap
    };
}

export function scramble(onlyBasic){
    return rubikCube.scramble(onlyBasic);
}

/**
 * 根据块位置索引, 确定其相对坐标
 */
function decomposeCubeIndexToCoordinate(index){
    let x = Math.floor(index / 9);
    let yz = index % 9;
    let y = Math.floor(yz / 3);
    let z = Math.floor(yz % 3);
    return {
        x : x,
        y : y,
        z : z
    };
}

// 添加魔方转动动作完成监听
export function addActionDoneCallback(callback){
    if(rubikCube.actionDoneCallback == null){
        rubikCube.actionDoneCallback = callback;
    }else{
        let oldCallback = rubikCube.actionDoneCallback;
        rubikCube.actionDoneCallback = (notation) => {
            callback(notation);
            oldCallback(notation);
        }
    }
}

// 获取6个面中指定的面的指定位置的颜色, 面: F, R, U, D, B, L. 位置: 1 -- 9
export function getFaceColor(face, index){
    return rubikCube.getColorByPosInfo(face, index);
}

// 调整魔方基
export function rebase(){
    rubikCube.rebase();
}

// 执行指定的动作
export function doAction(notation){
    let action = StandardCubeAction[notation];
    if(action){
        rubikCube.move(action, notation);
    }else{
        console.warn("unrecognized notation");
    }
}

// 重置魔方到初始状态
export function reset(){
    rubikCube.reset();
}

// 相机恢复至初始视角
export function back(){
    ThreeJsContainer.cameraResetDefault();
}

// 初始化魔方
export function init(domContainer, debug) {
    ThreeJsContainer.init(domContainer, rubikCube, debug);
    addListener();
}

// 3d窗体自适应
export function resize() {
    ThreeJsContainer.camera.aspect = window.innerWidth / window.innerHeight;
    ThreeJsContainer.camera.updateProjectionMatrix();
    ThreeJsContainer.renderer.setSize(window.innerWidth, window.innerHeight);
}

export function getColorSchemes(){
    let colors = [];
    for(let k in CubeColor){
        if(CubeColor.properties[CubeColor[k]]){
            colors.push(CubeColor.properties[CubeColor[k]].value);
        }
    }
    return colors;
}

export function applyColorMap(colorMap, failedCallback, successCallback){
    let realColorMap = {};
    for(let k in colorMap){
        let v = colorMap[k];
        let faceColors = [];
        realColorMap[k] = faceColors;
        for(let color of v){
            faceColors.push(CubeColor.getCubeColorByColorValue(color));
        }
    }
    rubikCube.reassembly(realColorMap, () => {
        if(failedCallback){
            failedCallback();
        }
    }, () => {
        if(successCallback){
            successCallback();
        }
    });
}


// -- 鼠标交互相关 --
function addListener() {
    ThreeJsContainer.renderer.domElement.addEventListener('mousedown', startCube, false);
    ThreeJsContainer.renderer.domElement.addEventListener('mousemove', moveCube, false);
    ThreeJsContainer.renderer.domElement.addEventListener('mouseup', stopCube, false);

    ThreeJsContainer.renderer.domElement.addEventListener('touchstart', startCube, false);
    ThreeJsContainer.renderer.domElement.addEventListener('touchmove', moveCube, false);
    ThreeJsContainer.renderer.domElement.addEventListener('touchend', stopCube, false);
}

const mouseMonitor = {
    startPoint: null,
    endPoint: null
};

function startCube(event) {
    if(rubikCube.isRotating()){
        return;
    }
    mouseMonitor.startPoint = getIntersect(event);
    if(mouseMonitor.startPoint){
        ThreeJsContainer.orbitControler.enabled = false;
    }else{
        ThreeJsContainer.orbitControler.enabled = true;
    }
}

function moveCube(event) {
    if(!mouseMonitor.startPoint || rubikCube.isRotating()){
        return;
    }
    if(!mouseMonitor.endPoint){
        let point = getIntersect(event);
        if(point && point.instanceIndex != mouseMonitor.startPoint.instanceIndex){
            mouseMonitor.endPoint = point;
        }
    }
}

function stopCube(event) {
    ThreeJsContainer.orbitControler.enabled = true;
    if(mouseMonitor.startPoint && mouseMonitor.endPoint){
        // 确定经过的块位置
        let startPos = -1;
        let endPos = -1;
        for(let pos = 0; pos < rubikCube.cubeIndexMap.length; pos++){
            if(rubikCube.cubeIndexMap[pos] == mouseMonitor.startPoint.instanceIndex){
                startPos = pos;
            }else if(rubikCube.cubeIndexMap[pos] == mouseMonitor.endPoint.instanceIndex){
                endPos = pos;
            }
        }

        let startFacePos = -1;
        let endFacePos = -1;

        // 确定滑动的面
        let startCubeStatus = rubikCube.colorMap[startPos];
        for(let i = 0; i < startCubeStatus.length; i++){
            if(mouseMonitor.startPoint.face == startCubeStatus[i]){
                startFacePos = i;
                break;
            }
        }
        let endCubeStatus = rubikCube.colorMap[endPos];
        for(let i = 0; i < endCubeStatus.length; i++){
            if(mouseMonitor.endPoint.face == endCubeStatus[i]){
                endFacePos = i;
                break;
            }
        }

        // 确定最终要执行的动作
        if(startFacePos >= 0 && startFacePos == endFacePos && startPos >= 0 && endPos >= 0){
            let moveAction = [];
            let startCoordinate = decomposeCubeIndexToCoordinate(startPos);
            let endCoordinate = decomposeCubeIndexToCoordinate(endPos);
            let direction = new THREE.Vector3(endCoordinate.x - startCoordinate.x, endCoordinate.y - startCoordinate.y, endCoordinate.z - startCoordinate.z);
            for(let k in ActionGroup){
                let v = ActionGroup[k];
                if(v.permutation[startPos] > -1 && v.permutation[endPos] > -1
                    && v.colorPermutation[startFacePos] != startFacePos && v.colorPermutation[endFacePos] != endFacePos){

                    let fixedPoint = -1;
                    for(let i = 0; i < v.permutation.length; i++){
                        if(i == v.permutation[i]){
                            fixedPoint = i;
                            break;
                        }
                    }
                    let fixCoordinate = decomposeCubeIndexToCoordinate(fixedPoint);
                    let armV = new THREE.Vector3(startCoordinate.x - fixCoordinate.x, startCoordinate.y - fixCoordinate.y, startCoordinate.z - fixCoordinate.z);
                    // 求取叉集, 即满足右手定则的法向量, 并进行归一化
                    let axis = armV.cross(direction).normalize();
                    if(axis.x == v.axis.x && axis.y == v.axis.y && axis.z == v.axis.z){
                        moveAction = {
                            name: k,
                            action: v
                        };
                        break;
                    }
                }
            }
            
            if(moveAction){
                rubikCube.move([moveAction.action], moveAction.name);
            }
        }
    }
    mouseMonitor.startPoint = null;
    mouseMonitor.endPoint = null;
}

// 面索引, 每一个BoxGeometry都是由12个三角形面组成, 每个面由两个三角形构成, 这个数组功能, faceMap[faceIndex/2]可以确定所属的面
const faceMap = ["R", "L", "U", "D", "F", "B"];

//获取操作焦点以及该焦点所在平面
function getIntersect(event) {
    //触摸事件和鼠标事件获得坐标的方式有点区别
    var hand = event;
    if (event.touches) {
        hand = event.touches[0];
    }
    ThreeJsContainer.mouse.x = (hand.clientX / ThreeJsContainer.width) * 2 - 1;
    ThreeJsContainer.mouse.y = -(hand.clientY / ThreeJsContainer.height) * 2 + 1;
    ThreeJsContainer.raycaster.setFromCamera(ThreeJsContainer.mouse, ThreeJsContainer.camera);
    //Raycaster方式定位选取元素，可能会选取多个，以第一个为准
    var intersects = ThreeJsContainer.raycaster.intersectObjects(ThreeJsContainer.scene.children);
    if (intersects.length && intersects[0].object instanceof THREE.InstancedMesh) {
        return {
            instanceIndex : intersects[0].instanceId,
            face : rubikCube.getFaceNumber(faceMap[Math.floor(intersects[0].faceIndex / 2)])
        };
    }
    return null;
}