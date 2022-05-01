/**
 * 魔方还原两阶段算法(https://zhuanlan.zhihu.com/p/73054362)
 * 1. 还原至<U, R2, F2, D, L2, B2>生成群
 *     -- 调整所有角块色向、棱块色向至正确，将（夹在UD面间的）中层4个棱块还原至中层4个槽位内，不考虑相互顺序
 * 2. 还原魔方
 * 
 * 每阶段均采用广度优先进行结果搜索
 * 反复使用上述两个步骤, 找到最优解
 * 
 * reference:
 *   1. https://juejin.cn/post/6969150160907534343
 *   2. https://juejin.cn/post/6970700421035884558
 *   3. https://zhuanlan.zhihu.com/p/73054362
 * 
 * 魔方状态用如下方式表示:
 * {
    position: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    direction: [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5]
    ]
   }
 */

const PieceNoMove = [0, 1, 2, 3, 4, 5];
const PieceAction = {
    x: [3, 0, 1, 2, 4, 5],
    x_: [1, 2, 3, 0, 4, 5],
    x2: [2, 3, 0, 1, 4, 5],
    y:[0, 4, 2, 5, 3, 1],
    y_:[0, 5, 2, 4, 1, 3],
    y2: [0, 3, 2, 1, 5, 4],
    z:[4, 1, 5, 3, 2, 0],
    z_:[5, 1, 4, 3, 0, 2],
    z2: [2, 1, 0, 3, 5, 4]
};

const Action = {
    "R":{
        piece: PieceAction.x,
        layer: [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, 21, 18, 25, 22, 19, 26, 23, 20 ]
    },
    "R'":{
        piece: PieceAction.x_,
        layer: [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 20, 23, 26, 19, 22, 25, 18, 21, 24 ]
    },
    "R2":{
        piece: PieceAction.x2,
        layer: [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 26, 25, 24, 23, 22, 21, 20, 19, 18 ]
    },
    "L":{
        piece: PieceAction.x_,
        layer: [ 2, 5, 8, 1, 4, 7, 0, 3, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ]
    },
    "L'":{
        piece: PieceAction.x,
        layer: [ 6, 3, 0, 7, 4, 1, 8, 5, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
    },
    "L2":{
        piece: PieceAction.x2,
        layer: [ 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
    },
    "U":{
        piece: PieceAction.y,
        layer: [ -1, -1, -1, -1, -1, -1, 8, 17, 26, -1, -1, -1, -1, -1, -1, 7, 16, 25, -1, -1, -1, -1, -1, -1, 6, 15, 24 ]
    },
    "U'":{
        piece: PieceAction.y_,
        layer: [ -1, -1, -1, -1, -1, -1, 24, 15, 6, -1, -1, -1, -1, -1, -1, 25, 16, 7, -1, -1, -1, -1, -1, -1, 26, 17, 8 ]
    },
    "U2":{
        piece: PieceAction.y2,
        layer: [ -1, -1, -1, -1, -1, -1, 26, 25, 24, -1, -1, -1, -1, -1, -1, 17, 16, 15, -1, -1, -1, -1, -1, -1, 8, 7, 6 ]
    },
    "D":{
        piece: PieceAction.y_,
        layer: [ 18, 9, 0, -1, -1, -1, -1, -1, -1, 19, 10, 1, -1, -1, -1, -1, -1, -1, 20, 11, 2, -1, -1, -1, -1, -1, -1 ]
    },
    "D'":{
        piece: PieceAction.y,
        layer: [ 2, 11, 20, -1, -1, -1, -1, -1, -1, 1, 10, 19, -1, -1, -1, -1, -1, -1, 0, 9, 18, -1, -1, -1, -1, -1, -1 ]
    },
    "D2":{
        piece: PieceAction.y2,
        layer: [ 20, 19, 18, -1, -1, -1, -1, -1, -1, 11, 10, 9, -1, -1, -1, -1, -1, -1, 2, 1, 0, -1, -1, -1, -1, -1, -1 ]
    },
    "F":{
        piece: PieceAction.z,
        layer: [ -1, -1, 20, -1, -1, 11, -1, -1, 2, -1, -1, 23, -1, -1, 14, -1, -1, 5, -1, -1, 26, -1, -1, 17, -1, -1, 8 ]
    },
    "F'":{
        piece: PieceAction.z_,
        layer: [ -1, -1, 8, -1, -1, 17, -1, -1, 26, -1, -1, 5, -1, -1, 14, -1, -1, 23, -1, -1, 2, -1, -1, 11, -1, -1, 20 ]
    },
    "F2":{
        piece: PieceAction.z2,
        layer: [ -1, -1, 26, -1, -1, 23, -1, -1, 20, -1, -1, 17, -1, -1, 14, -1, -1, 11, -1, -1, 8, -1, -1, 5, -1, -1, 2 ]
    },
    "B":{
        piece: PieceAction.z_,
        layer: [ 6, -1, -1, 15, -1, -1, 24, -1, -1, 3, -1, -1, 12, -1, -1, 21, -1, -1, 0, -1, -1, 9, -1, -1, 18, -1, -1 ]
    },
    "B'":{
        piece: PieceAction.z,
        layer: [ 18, -1, -1, 9, -1, -1, 0, -1, -1, 21, -1, -1, 12, -1, -1, 3, -1, -1, 24, -1, -1, 15, -1, -1, 6, -1, -1 ]
    },
    "B2":{
        piece: PieceAction.z2,
        layer: [ 24, -1, -1, 21, -1, -1, 18, -1, -1, 15, -1, -1, 12, -1, -1, 9, -1, -1, 6, -1, -1, 3, -1, -1, 0, -1, -1 ]
    }
};

function multiplyPermutation(p1, p2){
    let result = [];
    for(let i = 0; i < p1.length; i++){
        let v2 = p2[i];
        if(v2 < 0){
            result.push(p1[i]);
        }else{
            result.push(p1[v2]);
        }
    }
    return result;
}

function applyAction(cube, action){
    let act = Action[action];

    let direction = [];
    let position = [];
    for(let i = 0; i < act.layer.length; i++){
        let from = act.layer[i];
        if(from < 0){
            position.push(cube.position[i]);
            direction.push(arrayClone(cube.direction[i]));
        }else{
            position.push(cube.position[from]);
            direction.push(multiplyPermutation(cube.direction[from], act.piece));
        }
    }
    return {
        position: position,
        direction: direction
    }
}

function arrayEquals(a1, a2){
    for(let i = 0; i < a1.length; i++){
        if(a1[i] != a2[i]){
            return false;
        }
    }
    return true;
}

function arrayClone(source){
    let arr = [];
    for(let i of source){
        arr.push(i);
    }
    return arr;
}

const recoveryDirectionCheckIngnore = [4, 12, 13, 14, 16, 22];  // 中心块不需要检查方向
/**
 * 判断魔方是否还原
 */
function isRecovery(cube){
    for(let i = 0; i < cube.position.length; i++){
        if(cube.position[i] != i){ return false; }
    }
    for(let i = 0; i < cube.direction.length; i++){
        if(recoveryDirectionCheckIngnore.indexOf(i) < 0 && !arrayEquals(PieceNoMove, cube.direction[i])){
            return false;
        }
    }
    return true;
}

const phase1MaxStepCount = 21;
const phase2MaxStepCount = 21;
const maxDepth = 21;
const phase1Action = [ "R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2" ];
const phase2Action = [ "U", "U'", "R2", "F2", "D", "D'", "L2", "B2" ];
const parallelActionPair = {
    'R':'L',
    'L':'R',
    'F':'B',
    'B':'F',
    'U':'D',
    'D':'U'
};

let skipCount = 0;
class Phase1Seacher{
    constructor(originCube){
        this.originCube = originCube;   // 原始魔方状态
        this.path = []; // 存储由根到当前位置所经历的所有action
        this.actionIndexPath = [0]; // 存储每一层深度上当前遍历到的动作索引
        this.statusPath = [];   // 存储深度搜索时,每一层深度上的魔方状态
        this.finish = false;
        this.foundIt = this.passPhase1(originCube);
        this.deep = 0;
    }

    init(deep){
        this.actionIndexPath = [0];
        this.statusPath = [this.originCube];
        this.deep = deep;
        this.finish = false;
    }

    // 尝试下一个动作
    tryNext(){
        let act = phase1Action[this.actionIndexPath[this.actionIndexPath.length - 1]];

        /**
         * 判断这个动作是否需要搜索
         * 1. 前一个动作是R,则不需要搜索R'和R2了
         * 2. 前一个动作是R, 当前动作是L,下一动作不需要搜索R,L一系列的动作了
         */
        if(this.path.length > 0){
            let prefix = act.charAt(0);
            let preAct = this.path[this.path.length - 1]; // 上一个动作
            let pPrefix = preAct.charAt(0);
            if(pPrefix == prefix){
                this.skipToNext();
                skipCount++;
                return;
            }
            if(this.path.length > 1){
                let ppPrefix = this.path[this.path.length - 2]; // 上上个动作
                if(ppPrefix == parallelActionPair[pPrefix] && ppPrefix == prefix){
                    skipCount++;
                    this.skipToNext();
                    return;
                }
            }
        }

        // 执行动作
        let newCube = applyAction(this.statusPath[this.statusPath.length - 1], act);

        let predictStep = this.predictMinStep(newCube);
        if(predictStep + this.path.length > this.deep){
            this.skipToNext();
            console.log("out of range.");
            return;
        }

        this.path.push(act);
        this.statusPath.push(newCube);

        if(this.passPhase1(newCube)){
            this.foundIt = true;
        }else{
            this.cursorToNext();
        }
    }

    skipToNext(){
        let cursor = this.actionIndexPath.pop() + 1;
        if(cursor < phase1Action.length){
            this.actionIndexPath.push(cursor);
        }else{
            while(this.actionIndexPath.length > 0){
                let cursor = this.actionIndexPath.pop() + 1;
                this.path.pop();
                this.statusPath.pop();
                if(cursor < phase1Action.length){
                    this.actionIndexPath.push(cursor);
                    break;
                }
            }
            this.finish = this.actionIndexPath.length == 0;
        }
    }

    upAndBottomLayer = [ 0, 1, 2, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 24, 25, 26 ];
    midLayer = [3, 4, 5, 12, 14, 21, 22, 23];
    
    passPhase1(cube){
        // 检查中间层的块是否都位于中间层
        for(let m of this.midLayer){
            if(this.midLayer.indexOf(cube.position[m]) < 0){
                return false;
            }
        }
        // 检查顶层和底层的块朝向是否满足(保证顶面和地面只有两种颜色,且是底面或者顶面中心块的颜色)
        for(let ub of this.upAndBottomLayer){
            let d = cube.direction[cube.position[ub]][0]
            if(d != 0 && d != 2){
                return false;
            }
        }
        return true;
    }

    // 索引移动到下一个位置
    cursorToNext(){
        if(this.actionIndexPath.length == this.deep){
            while(this.actionIndexPath.length > 0){
                let cursor = this.actionIndexPath.pop() + 1;
                this.path.pop();
                this.statusPath.pop();
                if(cursor < phase1Action.length){
                    this.actionIndexPath.push(cursor);
                    break;
                }
            }
            this.finish = this.actionIndexPath.length == 0;
        }else{
            this.actionIndexPath.push(0);
        }
    }

    // 判断是否完成所有情况的遍历 或者找到解了
    isFinish(){
        return this.finish || this.foundIt;
    }

    getAnswer(){
        if(this.foundIt){
            return this.path;
        }else{
            return null;
        }
    }

    checkForMidLayerCube(cube){
        return this.midLayer.indexOf(cube.position) >= 0;
    }

    checkForUpAndBottomLayer(cube){
        let d = cube.direction[0];
        if(d != 0 && d != 2){ return false; }
        return this.upAndBottomLayer.indexOf(cube.position) >= 0;
    }

    // 预测当前状态距离第一阶段完成最少需要的步数
    predictMinStep(cube){
        let maxStep = Number.MIN_VALUE;
        for(let m of this.midLayer){
            let step = this.searchForPredict(cube, m, cube => this.checkForMidLayerCube(cube));
            if(step > maxStep){
                maxStep = step;
            }
        }
        for(let ub of this.upAndBottomLayer){
            let step = this.searchForPredict(cube, ub, cube => this.checkForUpAndBottomLayer(cube));
            if(step > maxStep){
                maxStep = step;
            }
        }
        return maxStep; // 这里的最大步是整个魔方的最小步
    }

    searchForPredict(originCube, cubeIndex, checkFunction){
        let singleStatus = {
            position: originCube.position.indexOf(cubeIndex),
            direction: originCube.direction[cubeIndex]
        };
        let cursorCubeStatus = [singleStatus];
        let nextCubeStatus = [];
        let step = 0;
        while(true){
            step++;
            for(let act of phase1Action){
                let action = Action[act];
                for(let cubeStatus of cursorCubeStatus){
                    let newPos = action.layer.indexOf(cubeStatus.position);
                    if(newPos < 0){ // 说明这个动作不会移动这个块
                        continue;
                    }else{
                        let newStatus = {
                            position: newPos,
                            direction: multiplyPermutation(cubeStatus.direction, action.piece)
                        };
                        if(checkFunction(newStatus)){
                            return step;
                        }
                        nextCubeStatus.push(newStatus);
                    }
                }
            }
            cursorCubeStatus = nextCubeStatus;
            nextCubeStatus = [];
            if(step > 5){   // TODO 这个查找不对!!!
                console.log("oooooooooooo", originCube);
                break;
            }
        }
        return 0;
    }

}
/**
 * 第一阶段算法
 */
function phase1(cube){
    console.log(new Date());
    let searcher = new Phase1Seacher(cube);
    if(searcher.isFinish()){ return searcher.getAnswer(); }
    for(let deep = 1; deep <= phase1MaxStepCount; deep++){
        searcher.init(deep);
        while(!searcher.isFinish()){
            searcher.tryNext();
        }
    }
    console.log(new Date());
    console.log("skipCount", skipCount);
    return searcher.getAnswer();
}

export function solution(cube){
    return phase1(cube);
}

function twophasedebug(){
    let cube = {
        position: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
        direction: [
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5],
            [0, 1, 2, 3, 4, 5]
        ]
       };
    console.log(phase1(cube));
}