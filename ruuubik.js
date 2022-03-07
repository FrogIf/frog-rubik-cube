import * as THREE from 'three';
import { OrbitControls } from './js/threejs/jsm/controls/OrbitControls.js';

// 场景背景色
const SCENE_BACKGROUND_COLOR = 0xFFFFFF;
// 魔方颜色
const CubeColor = {
    WHITE: 0,
    BLUE: 1,
    YELLOW: 2,
    GREEN: 3,
    RED: 4,
    ORANGE: 5,
    properties: {
        0: { name: "white", value: "#FFFFFF" },
        1: { name: "blue", value: "#0051BA" },
        2: { name: "yellow", value: "#FFD500" },
        3: { name: "green", value: "#009E60" },
        4: { name: "red", value: "#C41E3A" },
        5: { name: "orange", value: "#FF5800" }
    }
};

// 3d图像相关
const ThreeJsContainer = {
    camera : new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000), // 相机
    scene : new THREE.Scene(), // 场景
    orbitControler : null, // 轨道控制器, 用于鼠标拖动时, 控制相机进行角度切换
    renderer : new THREE.WebGLRenderer({  // 渲染器
        antialias: true    // 抗锯齿
    }),
    init : function(parentDom, rubikCube, isDebug){
        // 初始化渲染器
        this.renderer.setClearColor(SCENE_BACKGROUND_COLOR, 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        parentDom.appendChild(renderer.domElement);

        // 初始化轨道控制器
        orbitControler = new OrbitControls(this.camera, this.renderer.domElement);
        orbitControler.rotateSpeed = 0.5;

        // 初始化魔方模型
        rubikCube.init(this.renderer);
        scene.add(rubikCube.cubes);

        // 创建透明方块, 用于捕捉鼠标位置
        scene.add(createCoverCube());

        if (isDebug === true) {
            let helper = new THREE.AxesHelper(20);
            helper.setColors(
                0xFF0000, // x r
                0x00FF00, // y g
                0x0000FF // z b
            );
            scene.add(helper);
        }

        // 设置灯光
        const light = new THREE.AmbientLight(0xFEFEFE);
        scene.add(light);

        // 设置相机位置
        camera.position.set(10, 10, 15);
        rubikCube.resetCallback = () => {
            camera.position.set(10, 10, 15);
        };
        orbitControler.update();

        // 循环指定的动画回调
        function animate() {
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
            orbitControler.update();
            rubikCube.animation();
        }
        animate();
    }
};

// 鼠标控制相关
const raycaster = new THREE.Raycaster();//光线碰撞检测器
var mouse = new THREE.Vector2();//存储鼠标坐标或者触摸坐标

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
    if(isStartWith(source, target)){
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
                if(isStartWith(newStatus, target)){
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
        if(isStartWith(p, rotateStatus)){
            return p;
        }
    }
    for(let i = 0; i < 24; i++){
        for(let status of currentStatusArr){
            for(let k in RotatePermutationGroup.generateElement){
                let v = RotatePermutationGroup.generateElement[k];
                let newStatus = multiplyRotatePermutation(status, v);
                if(isStartWith(newStatus, rotateStatus)){ 
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
        let exceptPosIndex = illegalRotateSequence[i];
        let illegalValue = illegalRotateSequence[s];
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
 * 判断一个数组是否以某一个子数组开头
 */
function isStartWith(array, subArray){
    for(let i = 0; i < subArray.length; i++){
        if(array[i] != subArray[i]){
            return false;
        }
    }
    return true;
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

export function doAction(notation){
    let action = StandardCubeAction[notation];
    rubikCube.move(action, notation);
}

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
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE],
        [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE]
    ],
    threeJsRender : null,   // 渲染器
    init : function(render){  // 初始化
        this.threeJsRender = render;
        const geometry = new THREE.BoxGeometry();
        const m1 = generateMaterial(CubeColor.RED);
        const m2 = generateMaterial(CubeColor.ORANGE);
        const m3 = generateMaterial(CubeColor.YELLOW);
        const m4 = generateMaterial(CubeColor.WHITE);
        const m5 = generateMaterial(CubeColor.BLUE);
        const m6 = generateMaterial(CubeColor.GREEN);
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
        let offset = (rank - 1) / 2;
        return {
            x : x - offset,
            y : y - offset,
            z : z - offset
        };
    },
    permute: function(action){
        // 根据定义的置换, 对cubeIndexMap进行置换操作
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
        this.threeJsRender.render(scene, camera);
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
         * │18│9 │0 │
         * ├──┼──┼──┤
         * │19│10│1 │
         * ├──┼──┼──┤
         * │20│11│2 │
         * └──┴──┴──┘
         * 如果输入(D, 0), 即底面的第一个块, 根据上图, 可以确定在立方体中编号为18, 再根据CubeAction注释图, 可以确定位置在(x, y, z) = (3, 0, 0)位置
         */
        "D":[18, 9, 0, 19, 10, 1, 20, 11, 2], // 底面
        "F":[8, 17, 26, 5, 14, 23, 2, 11, 20], // 前面
        "U":[6, 15, 24, 7, 16, 25, 8, 17, 26], // 上面
        "B":[0, 9, 18, 3, 12, 21, 6, 15, 24],// 后面
        "R":[24, 21, 18, 25, 22, 19, 26, 23, 20], // 右面
        "L":[0, 3, 6, 1, 4, 7, 2, 5, 8] // 左面
    },
    getFaceNumber: function(face){
        let faceNo = -1;
        if(face == 'D'){
            faceNo = 0;
        }else if(face == 'F'){
            faceNo = 1;
        }else if(face == 'U'){
            faceNo = 2;
        }else if(face == 'B'){
            faceNo = 3;
        }else if(face == 'R'){
            faceNo = 4;
        }else if(face == 'L'){
            faceNo = 5;
        }else{
            console.warn("unrecognized face");
        }
        return faceNo;
    },
    getColorByInfo: function(face /*所在面*/, pos/*在指定面上的编号, 按照标准魔方展开图, 每个面进行编号, 1 -- 9*/){
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
        camera.getWorldQuaternion(cameraQuaternion);
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
                let xAngle = 0;
                let yAngle = 0;
                let zAngle = 0;
                for(let rotate of rotatePath){
                    if(rotate.name == 'x'){ xAngle -= Math.PI / 2; }
                    else if(rotate.name == 'x_'){ xAngle += Math.PI / 2; }
                    else if(rotate.name == 'y'){ yAngle -= Math.PI / 2; }
                    else if(rotate.name == 'y_'){ yAngle += Math.PI / 2; }
                    else if(rotate.name == 'z'){ zAngle -= Math.PI / 2; }
                    else if(rotate.name == 'z_'){ zAngle += Math.PI / 2; }
                    let action = this.action[rotate.name];
                    this.doMove(action, Math.PI / 2);
                    this.finishMove(action);
                    newBaseInfo = multiplyRotatePermutation(newBaseInfo, rotate.permutation);
                }
                camera.position.applyAxisAngle(new THREE.Vector3( 1, 0, 0 ), xAngle);
                camera.position.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), yAngle);
                camera.position.applyAxisAngle(new THREE.Vector3( 0, 0, 1 ), zAngle);
                camera.updateProjectionMatrix();
                this.baseInfo = newBaseInfo;
            }
        }
    },
    resetCallback:null,     // 重置完成后回调
    reset: function(){
        this.baseInfo = RotatePermutationGroup.identity;
        let standardColor = [CubeColor.WHITE, CubeColor.BLUE, CubeColor.YELLOW, CubeColor.GREEN, CubeColor.RED, CubeColor.ORANGE];
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
        if(this.resetCallback){
            this.resetCallback();
        }
    }
};

export function init(domContainer, debug) {
    ThreeJsContainer.init(domContainer, rubikCube, debug);
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