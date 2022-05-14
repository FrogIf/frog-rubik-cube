/**
 * 两阶段算法(HTM)
 * author: frogif
 * date: 2022-05-05
 */
// 面编号
const U1 = 0, U2 = 1, U3 = 2, U4 = 3, U5 = 4, U6 = 5, U7 = 6, U8 = 7, U9 = 8,
R1 = 9, R2 = 10, R3 = 11, R4 = 12, R5 = 13, R6 = 14, R7 = 15, R8 = 16, R9 = 17,
F1 = 18, F2 = 19, F3 = 20, F4 = 21, F5 = 22, F6 = 23, F7 = 24, F8 = 25, F9 = 26,
D1 = 27, D2 = 28, D3 = 29, D4 = 30, D5 = 31, D6 = 32, D7 = 33, D8 = 34, D9 = 35,
L1 = 36, L2 = 37, L3 = 38, L4 = 39, L5 = 40, L6 = 41, L7 = 42, L8 = 43, L9 = 44,
B1 = 45, B2 = 46, B3 = 47, B4 = 48, B5 = 49, B6 = 50, B7 = 51, B8 = 52, B9 = 53;

// 基本移动
const U = 0, R = 1, F = 2, D = 3, L = 4, B = 5;
// 角块
const URF = 0, UFL = 1, ULB = 2, UBR = 3, DFR = 4, DLF = 5, DBL = 6, DRB = 7;
// 棱块
const UR = 0, UF = 1, UL = 2, UB = 3, DR = 4, DF = 5, DL = 6, DB = 7, FR = 8, FL = 9, BL = 10, BR = 11;

// 角块移动变换. c(corner)表示要移动到当前位置的块; o(orientation)表示移动后, 块的朝向
const CornerCubieMove = [
    [{c:UBR,o:0},{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0}], // U
    [{c:DFR,o:2},{c:UFL,o:0},{c:ULB,o:0},{c:URF,o:1},{c:DRB,o:1},{c:DLF,o:0},{c:DBL,o:0},{c:UBR,o:2}], // R
    [{c:UFL,o:1},{c:DLF,o:2},{c:ULB,o:0},{c:UBR,o:0},{c:URF,o:2},{c:DFR,o:1},{c:DBL,o:0},{c:DRB,o:0}], // F
    [{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:UBR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0},{c:DFR,o:0}], // D
    [{c:URF,o:0},{c:ULB,o:1},{c:DBL,o:2},{c:UBR,o:0},{c:DFR,o:0},{c:UFL,o:2},{c:DLF,o:1},{c:DRB,o:0}], // L
    [{c:URF,o:0},{c:UFL,o:0},{c:UBR,o:1},{c:DRB,o:2},{c:DFR,o:0},{c:DLF,o:0},{c:ULB,o:2},{c:DBL,o:1}]  // B
];

/* 
 * 棱块移动变换. e(edge)表示要东到当前位置的块; o(orientation)表示移动后, 块的朝向
 *      定义: 上下 -- 高级面; 前后 -- 中级面; 左右 -- 低级面
 *      棱块中较高级的颜色位于较高级的面上, 称为朝向正确
 */
const EdgeCubieMove = [
    [{e:UB,o:0},{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:DR,o:0},{e:DF,o:0},{e:DL,o:0},{e:DB,o:0},{e:FR,o:0},{e:FL,o:0},{e:BL,o:0},{e:BR,o:0}], // U
    [{e:FR,o:0},{e:UF,o:0},{e:UL,o:0},{e:UB,o:0},{e:BR,o:0},{e:DF,o:0},{e:DL,o:0},{e:DB,o:0},{e:DR,o:0},{e:FL,o:0},{e:BL,o:0},{e:UR,o:0}], // R
    [{e:UR,o:0},{e:FL,o:1},{e:UL,o:0},{e:UB,o:0},{e:DR,o:0},{e:FR,o:1},{e:DL,o:0},{e:DB,o:0},{e:UF,o:1},{e:DF,o:1},{e:BL,o:0},{e:BR,o:0}], // F
    [{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:UB,o:0},{e:DF,o:0},{e:DL,o:0},{e:DB,o:0},{e:DR,o:0},{e:FR,o:0},{e:FL,o:0},{e:BL,o:0},{e:BR,o:0}], // D
    [{e:UR,o:0},{e:UF,o:0},{e:BL,o:0},{e:UB,o:0},{e:DR,o:0},{e:DF,o:0},{e:FL,o:0},{e:DB,o:0},{e:FR,o:0},{e:UL,o:0},{e:DL,o:0},{e:BR,o:0}], // L
    [{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:BR,o:1},{e:DR,o:0},{e:DF,o:0},{e:DL,o:0},{e:BL,o:1},{e:FR,o:0},{e:FL,o:0},{e:UB,o:1},{e:DB,o:1}]  // B
];

function cornerMultiply(a, b, result){
    let ori, oriA, oriB;
    for(let i = 0; i < 8; i++){
        result[i].c = a[b[i].c].c;
        oriA = a[b[i].c].o;
        oriB = b[i].o;
        if(oriA < 3 && oriB < 3){
            ori = (oriA + oriB) % 3;
        }else if(oriA < 3 && oriB >= 3){
            ori = oriA + oriB;
            if(ori >= 6){ ori = ori - 3; }
        }else if(oriA >= 3 && oriB < 3){    // 考虑到镜像对称的情况
            ori = oriA - oriB;
            if(ori < 3){ ori = ori + 3; }
        }else{
            ori = oriA - oriB;
            if(ori < 0){ ori = ori + 3; }
        }
        result[i].o = ori;
    }
}

function edgeMultiply(a, b, result){
    for(let i = 0; i < 12; i++){
        result[i].e = a[b[i].e].e;
        result[i].o = (a[b[i].e].o + b[i].o) & 1;
    }
}

class CubieCube{
    constructor(){
        this.corners = [{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:UBR,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0}];
        this.edges = [{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:UB,o:0},{e:DR,o:0},{e:DF,o:0},{e:DL,o:0},{e:DB,o:0},{e:FR,o:0},{e:FL,o:0},{e:BL,o:0},{e:BR,o:0}];
    }

    symMult(sym){
        this.cornerMult(sym.corner);
        this.edgeMult(sym.edge);
    }

    cornerMult(move){
        let corners = [{},{},{},{},{},{},{},{}];
        cornerMultiply(this.corners, move, corners);
        this.corners = corners;
    }

    edgeMult(move){
        let edges = [{},{},{},{},{},{},{},{},{},{},{},{}];
        edgeMultiply(this.edges, move, edges);
        this.edges = edges;
    }

    edgeReset(){
        for(let i = 0; i < 12; i++){
            this.edges[i].e = i;
            this.edges[i].o = 0;
        }
    }

    setEdgesByEdgeOrientationCoordinate(coordinate){
        let edgeOriSum = 0;
        let o = 0;
        for(let i = 10; i >= 0; i--){
            o = coordinate & 1;
            this.edges[i].o = o;
            edgeOriSum = edgeOriSum + o;
            coordinate = coordinate >> 1;
        }
        // 所有角块朝向之和一定能被2整除
        this.edges[BR].o = edgeOriSum & 1;
    }

    getEdgeOrientationCoordinate(){
        let result = 0;
        for(let i = 0; i < 11; i++){    // 最后一个不用计算, 前面11个确定之后, 最后一个也就确定了 
            result = 2 * result + this.edges[i].o;
        }
        return result;
    }

    setCornersByCornerOrientationCoordinate(coordinate){
        let cornerOriSum = 0;
        let o = 0;
        for(let i = 6; i >= 0; i--){
            o = coordinate % 3;
            this.corners[i].o = o;
            cornerOriSum = cornerOriSum + o;
            coordinate = Math.floor(coordinate / 3);
        }
        // 所有角块朝向之和一定能被3整除
        cornerOriSum = cornerOriSum % 3;
        this.corners[DRB].o = cornerOriSum ? (3 - cornerOriSum) : 0;
    }

    getCornerOrientationCoordinate(){
        let result = 0;
        for(let i = 0; i < 7; i++){ // 最后一个不用计算, 前7个确定之后, 最后一个也就确定了
            result = 3 * result + this.corners[i].o;
        }
        return result;
    }

    getCornerPermtationCoordinate(){
        let result = 0;
        for(let i = 7; i > 0; i--){
            let c = this.corners[i].c;
            let order = 0;
            for(let j = i - 1; j >= 0; j--){
                if(c < this.corners[j].c){
                    order++;
                }
            }
            result = (order + result) * i; 
        }
        return result;
    }

    setCornerByCornerPermtationCoordinate(coordinate){
        let order = new Array(8).fill(0);
        for(let c = 0; c < 8; c++){
            order[c] = coordinate % (c + 1);
            coordinate = Math.floor(coordinate / (c + 1));
        }
        let used = new Array(8).fill(0);
        for(let i = 7; i >= 0; i--){
            let k = 7;
            while(used[k] == 1){ k--; }
            while(order[i] > 0){
                order[i] = order[i] - 1;
                do{
                    k--;
                }while(used[k] == 1);
            }
            this.corners[i].c = k;
            used[k] = 1;
        }
    }

    getEdgePermtationCoordinate(){
        let result = 0;
        for(let i = 11; i > 0; i--){
            let e = this.edges[i].e;
            let order = 0;
            for(let j = i - 1; j >= 0; j--){
                if(e < this.edges[j].e){
                    order++;
                }
            }
            result = (order + result) * i;
        }
        return result;
    }

    setEdgesByEdgePermuationCoordinate(coordinate){
        let order = new Array(12).fill(0);
        for(let e = 0; e < 12; e++){
            order[e] = coordinate % (e + 1);
            coordinate = Math.floor(coordinate / (e + 1));
        }
        let used = new Array(12).fill(0);
        for(let i = 11; i >= 0; i--){
            let k = 11;
            while(used[k] == 1){ k--; }
            while(order[i] > 0){
                order[i] = order[i] - 1;
                do{
                    k--;
                }while(used[k] == 1);
            }
            this.edges[i].e = k;
            used[k] = 1;
        }
    }

    isCornerClean(){
        for(let c = 0; c < 8; c++){
            let corner = this.corners[c];
            if(corner.c != c || corner.o != 0){
                return false;
            }
        }
        return true;
    }
}

// 48个对称
const Symmetries = {
    edgeSymmetries: [],
    cornerSymmetries: [],
    invIdx: [], // 对称 -- 逆对称
    symMove: [],
    symMult: [],
    cubieLevel:{
        S_URF3: {
            edge: [{e:UF,o:1},{e:FR,o:0},{e:DF,o:1},{e:FL,o:0},{e:UB,o:1},{e:BR,o:0},{e:DB,o:1},{e:BL,o:0},{e:UR,o:1},{e:DR,o:1},{e:DL,o:1},{e:UL,o:1}],
            corner: [{c:URF,o:1},{c:DFR,o:2},{c:DLF,o:1},{c:UFL,o:2},{c:UBR,o:2},{c:DRB,o:1},{c:DBL,o:2},{c:ULB,o:1}]
        },
        S_F2: {
            edge: [{e:DL,o:0},{e:DF,o:0},{e:DR,o:0},{e:DB,o:0},{e:UL,o:0},{e:UF,o:0},{e:UR,o:0},{e:UB,o:0},{e:FL,o:0},{e:FR,o:0},{e:BR,o:0},{e:BL,o:0}],
            corner: [{c:DLF,o:0},{c:DFR,o:0},{c:DRB,o:0},{c:DBL,o:0},{c:UFL,o:0},{c:URF,o:0},{c:UBR,o:0},{c:ULB,o:0}]
        },
        S_U4: {
            edge: [{e:UB,o:0},{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:DB,o:0},{e:DR,o:0},{e:DF,o:0},{e:DL,o:0},{e:BR,o:1},{e:FR,o:1},{e:FL,o:1},{e:BL,o:1}],
            corner: [{c:UBR,o:0},{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:DRB,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0}]
        },
        S_LR2: {
            edge: [{e:UL,o:0},{e:UF,o:0},{e:UR,o:0},{e:UB,o:0},{e:DL,o:0},{e:DF,o:0},{e:DR,o:0},{e:DB,o:0},{e:FL,o:0},{e:FR,o:0},{e:BR,o:0},{e:BL,o:0}],
            corner: [{c:UFL,o:3},{c:URF,o:3},{c:UBR,o:3},{c:ULB,o:3},{c:DLF,o:3},{c:DFR,o:3},{c:DRB,o:3},{c:DBL,o:3}]
        }
    },
    init: function(){
        this.initSymGroup();
        this.initInvTable();
        this.initSymMove();
        this.initSymMult();
    },
    initSymGroup: function(){
        let cube = new CubieCube();
        for(let urf3 = 0; urf3 < 3; urf3++){
            for(let f2 = 0; f2 < 2; f2++){
                for(let u4 = 0; u4 < 4; u4++){
                    for(let lr2 = 0; lr2 < 2; lr2++){
                        // 棱块对称
                        let edgeSym = [];
                        this.edgeSymmetries.push(edgeSym);
                        for(let e = UR; e <= BR; e++){
                            edgeSym.push({
                                e: cube.edges[e].e,
                                o: cube.edges[e].o
                            });
                        }
                        // 角块对称
                        let cornerSym = [];
                        this.cornerSymmetries.push(cornerSym);
                        for(let c = URF; c <= DRB; c++){
                            cornerSym.push({
                                c: cube.corners[c].c,
                                o: cube.corners[c].o
                            });
                        }
                        cube.symMult(this.cubieLevel.S_LR2);
                    }
                    cube.symMult(this.cubieLevel.S_U4);
                }
                cube.symMult(this.cubieLevel.S_F2);
            }
            cube.symMult(this.cubieLevel.S_URF3);
        }

        this.edge = null;
        this.corner = null;
        this.face = null;
    },
    initInvTable: function(){
        let result = [{}, {}, {}, {}, {}, {}, {}, {}];
        for(let i = 0; i < 48; i++){
            for(let j = 0; j < 48; j++){
                cornerMultiply(this.cornerSymmetries[i], this.cornerSymmetries[j], result);
                if(result[URF].c == URF && result[UFL].c == UFL && result[ULB].c == ULB){
                    this.invIdx[i] = j;
                    break;
                }
            }
        }
    },
    initSymMove: function(){ // 生成基本移动的共轭移动
        let startCubie = new CubieCube();
        let resultCubie = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{}];
        this.symMove = new Array(48).fill(null);
        for(let m = U; m <= B; m++){
            for(let r = 0; r < 3; r++){
                startCubie.cornerMult(CornerCubieMove[m]);
                for(let s = 0; s < 48; s++){
                    cornerMultiply(this.cornerSymmetries[s], startCubie.corners, midProd);
                    cornerMultiply(midProd, this.cornerSymmetries[this.invIdx[s]], resultCubie.corners);
                    for(let m2 = U; m2 <= B; m2++){
                        for(let r2 = 0; r2 < 3; r2++){
                            resultCubie.cornerMult(CornerCubieMove[m2]);
                            if(resultCubie.isCornerClean()){
                                if(this.symMove[s] == null){
                                    this.symMove[s] = new Array(18).fill(0);
                                }
                                this.symMove[s][3 * m + r] = 3 * m2 + (2 - r2);
                            }
                        }
                        resultCubie.cornerMult(CornerCubieMove[m2]);
                    }
                }
            }
            startCubie.cornerMult(CornerCubieMove[m]);
        }
    },
    initSymMult: function(){
        let prod = [{},{},{},{},{},{},{},{}];
        for(let i = 0; i < 48; i++){
            let multArr = [];
            this.symMult.push(multArr);
            for(let j = 0; j < 48; j++){
                cornerMultiply(this.cornerSymmetries[i], this.cornerSymmetries[j], prod);
                for(let k = 0; k < 48; k++){
                    let sym = this.cornerSymmetries[k];
                    if(sym[URF].c == prod[URF].c && sym[UFL].c == prod[UFL].c && sym[ULB].c == prod[ULB].c){
                        multArr.push(k);
                        break;
                    }
                }
            }
        }
    },
    getConjugateMove: function(symIndex, move){
        return this.symMove[symIndex][move];
    },
    symMultiply: function(symIdx1, symIdx2){
        return this.symMult[symIdx1][symIdx2];
    }
};

const getClassIndexByRawCoordinate = (rawCoordinate, classIndexToRepresentantArray) => {  // 二分查找
    if(rawCoordinate <= classIndexToRepresentantArray[classIndexToRepresentantArray.length - 1]){
        let l = 0, r = classIndexToRepresentantArray.length - 1, mid = -1;
        while(l <= r){
            mid = (l + r) >> 1;
            let c = classIndexToRepresentantArray[mid];
            if(c > rawCoordinate){
                r = mid - 1;
            }else if(c < rawCoordinate){
                l = mid + 1;
            }else{
                return mid;
            }
        }
    }
    return -1;
}

// 角块朝向坐标(对称坐标)
const CornerOrientationSymCoordinate = {
    moveTable: null,
    classIndexToRepresentantArray: null,
    init: function(){
        this.initClassIndexToRepresentantArray();
        this.initMoveTable();
    },
    initClassIndexToRepresentantArray: function(){
        let len = (2187 >> 5) + 1; // 3^7 / 32
        let used = new Array(len).fill(0);
        this.classIndexToRepresentantArray = [];
        let startCubie = new CubieCube();
        let resultCubie = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{}];
        for(let c = 0; c < len; c++){
            for(let i = 0; i < 32; i++){
                if((used[c] & (1 << i)) == 0){ // 说明这个原始坐标在之前的等价类中没有出现过
                    let rawCoordinate = c << 5 | i; // c * 32 + i
                    if(rawCoordinate >= 2187){ return; }
                    this.classIndexToRepresentantArray.push(rawCoordinate);
                    startCubie.setCornersByCornerOrientationCoordinate(rawCoordinate);
                    for(let s = 0; s < 16; s++){  // 计算该等价类中的所有元素, 并将其位置标记为占用
                        cornerMultiply(Symmetries.cornerSymmetries[Symmetries.invIdx[s]], startCubie.corners, midProd);
                        cornerMultiply(midProd, Symmetries.cornerSymmetries[s], resultCubie.corners);
                        rawCoordinate = resultCubie.getCornerOrientationCoordinate();
                        used[rawCoordinate >> 5] = used[rawCoordinate >> 5] | (1 << (rawCoordinate & 31));
                    }
                }
            }
        }
    },
    initMoveTable: function(){
        this.moveTable = [];
        let cubie = new CubieCube();
        for(let classIdx = 0; classIdx < this.classIndexToRepresentantArray.length; classIdx++){
            let rawCoordinate = this.classIndexToRepresentantArray[classIdx];
            cubie.setCornersByCornerOrientationCoordinate(rawCoordinate);

            let odd = classIdx & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 16;
                moveEntries = this.moveTable[classIdx >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.moveTable.push(moveEntries);
            }
            let j = 0;
            for(let move = U; move <= B; move++){
                for(let r = 0; r < 3; r++){
                    cubie.cornerMult(CornerCubieMove[move]);
                    moveEntries[j] = moveEntries[j] | (this.getSymCoordinate(cubie) << offset);
                    j++;
                }
                cubie.cornerMult(CornerCubieMove[move]);
            }
        }
    },
    queryFromSymMoveTable: function(classIdx, move, moveI){
        let moveEntries = this.moveTable[classIdx >> 1];
        return (moveEntries[move * 3 + moveI] >> ((classIdx & 1) ? 16 : 0)) & 0xFFFF;
    },
    applySymMove: function(symCoordinate, move, moveI){
        let j = symCoordinate >> 4;
        let i = symCoordinate & 15;
        let conjMove = Symmetries.getConjugateMove(i, move * 3 + moveI);
        let moveEntries = this.moveTable[j >> 1];
        let conjCoord = (moveEntries[conjMove] >> ((j & 1) ? 16 : 0)) & 0xFFFF;
        let pair = this.getSymCoordinatePair(conjCoord);
        let i2 = Symmetries.symMultiply(pair.sym, i);
        return pair.clzIdx << 4 | i2;
    },
    getSymCoordinate: function(cubie){  // 根据原始坐标, 得到对称坐标
        let midProd = [{},{},{},{},{},{},{},{}];
        let resultCubie = new CubieCube();
        for(let i = 0; i < 16; i++){
            cornerMultiply(Symmetries.cornerSymmetries[i], cubie.corners, midProd);
            cornerMultiply(midProd, Symmetries.cornerSymmetries[Symmetries.invIdx[i]], resultCubie.corners);
            let rawCoordinate = resultCubie.getCornerOrientationCoordinate();
            let clzIndex = getClassIndexByRawCoordinate(rawCoordinate, this.classIndexToRepresentantArray);
            if(clzIndex != -1){
                return clzIndex << 4 | i;
            }
        }
        console.error("no sym coordinate find");
        return -1;
    },
    getSymCoordinatePair: function(symCoordinate){
        return {
            clzIdx : symCoordinate >> 4,
            sym: symCoordinate & 15
        }
    },
    queryRawRepresentantCoordinateByClassIndex: function(classIdx){
        return this.classIndexToRepresentantArray[classIdx];
    },
    isRepresentantCoordinate: function(rawCoordinate){
        return getClassIndexByRawCoordinate(rawCoordinate, this.classIndexToRepresentantArray) != -1;
    },
    getEquivalenceClassCount: function(){
        return this.classIndexToRepresentantArray.length;
    },
    getClassIdxByRawCoordinate: function(rawCoordinate){
        return getClassIndexByRawCoordinate(rawCoordinate, this.classIndexToRepresentantArray);
    }
};

// 棱块朝向坐标(原始坐标)
const EdgeOrientationCoordinate = {
    count: 2048, // 坐标数量: 2048 = 2 ^ 11
    moveTable: null,
    conjugateTable: null,
    init: function(){
        this.initMoveTable();
        this.initConjugateTable();
    },
    initMoveTable: function(){
        this.moveTable = [];
        let cubie = new CubieCube();
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            cubie.setEdgesByEdgeOrientationCoordinate(coordinate);
            let odd = coordinate & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 12;
                moveEntries = this.moveTable[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.moveTable.push(moveEntries);
            }
            let j = 0;
            for(let move = U; move <= B; move++){
                for(let r = 0; r < 3; r++){
                    cubie.edgeMult(EdgeCubieMove[move]);
                    moveEntries[j] = moveEntries[j] | (cubie.getEdgeOrientationCoordinate() << offset);
                    j++;
                }
                cubie.edgeMult(EdgeCubieMove[move]);
            }
        }
    },
    applyMove: function(coordinate, move, moveI){
        let moveEntries = this.moveTable[coordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((coordinate & 1) ? 12 : 0)) & 0xFFF;
    },
    initConjugateTable: function(){
        this.conjugateTable = [];
        let cubieStart = new CubieCube();
        let cubieProd = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            cubieStart.setEdgesByEdgeOrientationCoordinate(coordinate);

            let odd = coordinate & 1;
            let offset = 0;
            let symEntries;
            if(odd){
                offset = 12;
                symEntries = this.conjugateTable[coordinate >> 1];
            }else{
                symEntries = new Array(16).fill(0);
                this.conjugateTable.push(symEntries);
            }
            for(let s = 0; s < 16; s++){
                edgeMultiply(Symmetries.edgeSymmetries[s], cubieStart.edges, midProd);
                edgeMultiply(midProd, Symmetries.edgeSymmetries[Symmetries.invIdx[s]], cubieProd.edges);
                symEntries[s] = symEntries[s] | (cubieProd.getEdgeOrientationCoordinate() << offset);
            }
        }
    },
    getConjugate: function(coordinate, symIndex){
        let symEntries = this.conjugateTable[coordinate >> 1];
        return (symEntries[symIndex] >> ((coordinate & 1) ? 12 : 0)) & 0xFFF;
    },
    exceuteConjugate: function(coordinate, symIndex){
        let cubieStart = new CubieCube();
        let cubieProd = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{},{},{},{},{}];
        cubieStart.setEdgesByEdgeOrientationCoordinate(coordinate);
        edgeMultiply(Symmetries.edgeSymmetries[symIndex], cubieStart.edges, midProd);
        edgeMultiply(midProd, Symmetries.edgeSymmetries[Symmetries.invIdx[symIndex]], cubieProd.edges);
        return cubieProd.getEdgeOrientationCoordinate();
    }
};

// UD中间层棱块位置(FR, FL, BL, BR)(对称坐标)
const UDSliceCoordinate = {
    count: 495, // C(12,4)=12*11*10*9/4!=495
    rawMoveTable: null,
    symMoveTable: null,
    classIndexToRepresentantArray: null,
    conjugateTable: null,
    init: function(){
        this.initClassIndexToRepresentantArray();
        this.initSymCoordMoveTable();
        this.initRawCoordMoveTable();
        this.initConjugateTable();
    },
    initClassIndexToRepresentantArray: function(){
        let len = (this.count >> 5) + 1; // 495 / 32
        let used = new Array(len).fill(0);
        this.classIndexToRepresentantArray = [];
        let startCubie = new CubieCube();
        let resultCubie = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let c = 0; c < len; c++){
            for(let i = 0; i < 32; i++){
                if((used[c] & (1 << i)) == 0){ // 说明这个原始坐标在之前的等价类中没有出现过
                    let rawCoordinate = c << 5 | i; // c * 32 + i
                    if(rawCoordinate >= this.count){ return; }
                    this.classIndexToRepresentantArray.push(rawCoordinate);
                    this.invUDSliceCoordinate(startCubie, rawCoordinate);
                    for(let s = 0; s < 16; s++){  // 计算该等价类中的所有元素, 并将其位置标记为占用
                        edgeMultiply(Symmetries.edgeSymmetries[Symmetries.invIdx[s]], startCubie.edges, midProd);
                        edgeMultiply(midProd, Symmetries.edgeSymmetries[s], resultCubie.edges);
                        rawCoordinate = this.getUDSliceCoordinate(resultCubie);
                        used[rawCoordinate >> 5] = used[rawCoordinate >> 5] | (1 << (rawCoordinate & 31));
                    }
                }
            }
        }
    },
    initSymCoordMoveTable: function(){
        this.symMoveTable = [];
        let cubie = new CubieCube();
        for(let classIdx = 0; classIdx < this.classIndexToRepresentantArray.length; classIdx++){
            let rawCoordinate = this.classIndexToRepresentantArray[classIdx];
            this.invUDSliceCoordinate(cubie, rawCoordinate);

            let odd = classIdx & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 12;
                moveEntries = this.symMoveTable[classIdx >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.symMoveTable.push(moveEntries);
            }
            let j = 0;
            for(let move = U; move <= B; move++){
                for(let r = 0; r < 3; r++){
                    cubie.edgeMult(EdgeCubieMove[move]);
                    moveEntries[j] = moveEntries[j] | (this.getSymCoordinate(cubie) << offset);
                    j++;
                }
                cubie.edgeMult(EdgeCubieMove[move]);
            }
        }
    },
    initRawCoordMoveTable: function(){
        this.rawMoveTable = [];
        let cubie = new CubieCube();
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            this.invUDSliceCoordinate(cubie, coordinate);
            let odd = coordinate & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 12;
                moveEntries = this.rawMoveTable[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.rawMoveTable.push(moveEntries);
            }
            let j = 0;
            for(let move = U; move <= B; move++){
                for(let r = 0; r < 3; r++){
                    cubie.edgeMult(EdgeCubieMove[move]);
                    moveEntries[j] = moveEntries[j] | (this.getUDSliceCoordinate(cubie) << offset);
                    j++;
                }
                cubie.edgeMult(EdgeCubieMove[move]);
            }
        }
    },
    applyRawMove: function(rawCoordinate, move, moveI){
        let moveEntries = this.rawMoveTable[rawCoordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((rawCoordinate & 1) ? 12 : 0)) & 0xFFF;
    },
    getUDSliceCoordinate: function(cubie){
        let used = new Array(12);
        for(let i = 0; i < 12; i++){
            used[i] = cubie.edges[i].e >= FR;
        }
        let k = 3;
        let i = 11;
        let s = 0;
        while(k >= 0){
            if(used[i]){
                k--;
            }else{
                s += C(i, k);
            }
            i--;
        }
        return s;
    },
    invUDSliceCoordinate: function(cubie, rawCoordinate){
        let k = 3, n = 11;
        let v = 0;
        let used = new Array(12);
        while(k >= 0){
            v = C(n, k);
            if(rawCoordinate < v){
                k--;
                used[n] = true;
            }else{
                rawCoordinate -= v;
                used[n] = false;
            }
            n--;
        }

        let udSliceEdge = FR;
        for(let i = UR; i <= BR; i++){
            if(used[i]){
                for(let j = UR; j <= BR; j++){
                    if(cubie.edges[j].e == udSliceEdge){
                        cubie.edges[j].e = cubie.edges[i].e;
                        break;
                    }
                }
                cubie.edges[i].e = udSliceEdge;
                udSliceEdge++;
            }
        }
    },
    applySymMove: function(symCoordinate, move, moveI){
        let j = symCoordinate >> 4;
        let i = symCoordinate & 15;
        let conjMove = Symmetries.getConjugateMove(i, move * 3 + moveI);
        let moveEntries = this.symMoveTable[j];
        let conjCoord = (moveEntries[conjMove] >> ((j & 1) ? 12 : 0)) & 0xFFFF;
        let j1 = conjCoord >> 4;
        let i1 = conjCoord & 15;
        let i2 = Symmetries.symMultiply(i1, i);
        return j1 << 4 | i2;
    },
    getSymCoordinate: function(cubie){  // 根据原始坐标, 得到对称坐标
        let midProd = [{},{},{},{},{},{},{},{},{},{},{},{}];
        let resultCubie = new CubieCube();
        for(let i = 0; i < 16; i++){
            edgeMultiply(Symmetries.edgeSymmetries[i], cubie.edges, midProd);
            edgeMultiply(midProd, Symmetries.edgeSymmetries[Symmetries.invIdx[i]], resultCubie.edges);
            let rawCoordinate = this.getUDSliceCoordinate(resultCubie);
            let clzIndex = getClassIndexByRawCoordinate(rawCoordinate, this.classIndexToRepresentantArray);
            if(clzIndex != -1){
                return clzIndex << 4 | i;
            }
        }
        console.error("no sym coordinate find");
        return -1;
    },
    queryFromSymMoveTable: function(classIdx, move, moveI){
        let moveEntries = this.symMoveTable[classIdx >> 1];
        return (moveEntries[move * 3 + moveI] >> ((classIdx & 1) ? 12 : 0)) & 0xFFF;
    },
    queryRawRepresentantCoordinateByClassIndex: function(classIdx){
        return this.classIndexToRepresentantArray[classIdx];
    },
    isRepresentantCoordinate: function(rawCoordinate){
        return getClassIndexByRawCoordinate(rawCoordinate, this.classIndexToRepresentantArray) != -1;
    },
    getEquivalenceClassCount: function(){
        return this.classIndexToRepresentantArray.length;
    },
    getSymCoordinatePair: function(symCoordinate){
        return {
            clzIdx : symCoordinate >> 4,
            sym: symCoordinate & 15
        }
    },
    initConjugateTable: function(){
        this.conjugateTable = [];
        let cubieStart = new CubieCube();
        let cubieProd = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            this.invUDSliceCoordinate(cubieStart, coordinate);

            let odd = coordinate & 1;
            let offset = 0;
            let symEntries;
            if(odd){
                offset = 10;
                symEntries = this.conjugateTable[coordinate >> 1];
            }else{
                symEntries = new Array(16).fill(0);
                this.conjugateTable.push(symEntries);
            }
            for(let s = 0; s < 16; s++){
                edgeMultiply(Symmetries.edgeSymmetries[s], cubieStart.edges, midProd);
                edgeMultiply(midProd, Symmetries.edgeSymmetries[Symmetries.invIdx[s]], cubieProd.edges);
                symEntries[s] = symEntries[s] | (this.getUDSliceCoordinate(cubieProd) << offset);
            }
        }
    },
    getConjugate: function(coordinate, symIndex){
        let symEntries = this.conjugateTable[coordinate >> 1];
        return (symEntries[symIndex] >> ((coordinate & 1) ? 10 : 0)) & 0x1FF;
    }
};

// 剪枝表(阶段一): 角块朝向(对称坐标) + 棱块朝向 : 2048 * 角块朝向 + 棱块朝向
const TwistSymFlipPruningTable = {
    table: null,
    init: function(){
        let eqlClassCount = CornerOrientationSymCoordinate.getEquivalenceClassCount();
        // 记录对称坐标到原始坐标的映射情况, 如果某一处的值大于1, 说明该处有多个对称坐标对应同一个代表元
        let symState = new Array(eqlClassCount).fill(0);
        let startCubie = new CubieCube();
        let cubieProd = new CubieCube();
        let prod = [{},{},{},{},{},{},{},{}];
        for(let i = 0; i < eqlClassCount; i++){
            let rawCoordinate = CornerOrientationSymCoordinate.queryRawRepresentantCoordinateByClassIndex(i);
            startCubie.setCornersByCornerOrientationCoordinate(rawCoordinate);
            for(let s = 0; s < 16; s++){
                cornerMultiply(Symmetries.cornerSymmetries[Symmetries.invIdx[s]], startCubie.corners, prod);
                cornerMultiply(prod, Symmetries.cornerSymmetries[s], cubieProd.corners);
                let coord = cubieProd.getCornerOrientationCoordinate();
                if(coord == rawCoordinate){
                    symState[i] = symState[i] | (1 << s);
                }
            }
        }

        let total = eqlClassCount * EdgeOrientationCoordinate.count;
        let len =  (total >> 4) + ((total & 15) > 0 ? 1 : 0); // 32位中, 每两位存储一个步数记录
        this.table = new Array(len).fill(0xFFFFFFFF);
        this.setPrunValue(0, 0);
        let done = 1;
        let realDepth = -1;
        let depth = -1;
        while(done < total){
            let backward = realDepth > 8;   // 深度大于8时, 采用反向搜索
            realDepth++;
            depth = realDepth % 3;
            for(let i = 0; i < total; i++){
                let p = this.getPrunValue(i);
                let match = backward ? (p == 0b11) : (p == depth);
                if(match){
                    let cornerOrientationClzIdx = i >> 11;
                    let edgeOrientationCoord = i & 2047;
                    for(let m = U; m <= B; m++){
                        for(let r = 0; r < 3; r++){
                            let edgeOriCoord = EdgeOrientationCoordinate.applyMove(edgeOrientationCoord, m, r);
                            let cornOriCoord = CornerOrientationSymCoordinate.queryFromSymMoveTable(cornerOrientationClzIdx, m, r);
                            let symCoordPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornOriCoord);
                            edgeOriCoord = EdgeOrientationCoordinate.getConjugate(edgeOriCoord, symCoordPair.sym);
                            let index = this.makePrunIndex(symCoordPair.clzIdx, edgeOriCoord);
                            if(backward){
                                if(this.getPrunValue(index) == depth){
                                    this.setPrunValue(i, (depth + 1) % 3);
                                    done++;
                                }
                            }else{
                                if(this.getPrunValue(index) == 0b11){
                                    let d = (depth + 1) % 3;
                                    this.setPrunValue(index, d);
                                    done++;
    
                                    let sym = symState[symCoordPair.clzIdx];
                                    if(sym != 1){
                                        let altEdgeOriCoord;
                                        for(let s = 1; s < 16; s++){
                                            sym = sym >> 1;
                                            if((sym & 1) == 1){
                                                altEdgeOriCoord = EdgeOrientationCoordinate.getConjugate(edgeOriCoord, s);
                                                index = this.makePrunIndex(symCoordPair.clzIdx, altEdgeOriCoord);
                                                if(this.getPrunValue(index) == 0b11){
                                                    this.setPrunValue(index, d);
                                                    done++;
                                                }
                                            }else if(sym == 0){ break; }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    getPrunValue: function(index){
        return (this.table[index >> 4] >> ((index & 15) << 1)) & 0b11;
    },
    setPrunValue: function(index, value){
        let base = index >> 4;
        let offset = index & 15;
        this.table[base] = this.table[base] & (~(0b11 << (offset << 1))) | (value << (offset << 1));
    },
    makePrunIndex: function(twist, flip){
        return (twist << 11) | flip;
    },
    getDistance: function(cubie){
        let cornerOriSymCoord = CornerOrientationSymCoordinate.getSymCoordinate(cubie);
        let symPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornerOriSymCoord);
        let cornerOriClzIdx = symPair.clzIdx;
        let edgeRawOriCoord = cubie.getEdgeOrientationCoordinate();
        edgeRawOriCoord = EdgeOrientationCoordinate.getConjugate(edgeRawOriCoord, symPair.sym);

        let depth = 0;
        let depthMod3 = 0;
        while(cornerOriClzIdx != 0 || edgeRawOriCoord != 0){
            let idx = this.makePrunIndex(cornerOriClzIdx, edgeRawOriCoord);
            depthMod3 = this.getPrunValue(idx);
            let expectDepth = depthMod3 == 0 ? 2 : (depthMod3 - 1);
            let find = false;
            for(let m = U; (m <= B && !find); m++){
                for(let r = 0; (r < 3 && !find); r++){
                    let edgeOriCoord1 = EdgeOrientationCoordinate.applyMove(edgeRawOriCoord, m, r);
                    let cornOriCoord1 = CornerOrientationSymCoordinate.queryFromSymMoveTable(cornerOriClzIdx, m, r);
                    symPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornOriCoord1);
                    edgeOriCoord1 = EdgeOrientationCoordinate.getConjugate(edgeOriCoord1, symPair.sym);
                    let index = this.makePrunIndex(symPair.clzIdx, edgeOriCoord1);
                    if(this.getPrunValue(index) == expectDepth){
                        depth++;
                        edgeRawOriCoord = edgeOriCoord1;
                        cornerOriClzIdx = symPair.clzIdx;
                        find = true;
                    }
                }
            }
            if(!find || depth > 20){
                console.error("no action find.", idx, depth);
                depth = -1;
                break;
            }
        }
        return depth;
    }
}

// 剪枝表(阶段一): udSlice(对称坐标) + 棱块朝向 : 2048 * udSlice + 棱块朝向
const UDSliceFlipPruningTable = {
    table: null,
    init: function(){
        let eqlClassCount = UDSliceCoordinate.getEquivalenceClassCount();
        // 记录对称坐标到原始坐标的映射情况, 如果某一处的值大于1, 说明该处有多个对称坐标对应同一个代表元
        let symState = new Array(eqlClassCount).fill(0);
        let startCubie = new CubieCube();
        let cubieProd = new CubieCube();
        let prod = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let i = 0; i < eqlClassCount; i++){
            let rawCoordinate = UDSliceCoordinate.queryRawRepresentantCoordinateByClassIndex(i);
            UDSliceCoordinate.invUDSliceCoordinate(startCubie, rawCoordinate);
            for(let s = 0; s < 16; s++){
                edgeMultiply(Symmetries.edgeSymmetries[Symmetries.invIdx[s]], startCubie.edges, prod);
                edgeMultiply(prod, Symmetries.edgeSymmetries[s], cubieProd.edges);
                let coord = UDSliceCoordinate.getUDSliceCoordinate(cubieProd);
                if(coord == rawCoordinate){
                    symState[i] = symState[i] | (1 << s);
                }
            }
        }

        let total = eqlClassCount * EdgeOrientationCoordinate.count;
        let len =  (total >> 4) + ((total & 15) > 0 ? 1 : 0); // 32位中, 每两位存储一个步数记录
        this.table = new Array(len).fill(0xFFFFFFFF);
        this.setPrunValue(0, 0);
        let done = 1;
        let realDepth = -1;
        let depth = -1;
        while(done < total){
            let backward = realDepth > 8;   // 深度大于8时, 采用反向搜索
            realDepth++;
            depth = realDepth % 3;
            for(let i = 0; i < total; i++){
                let p = this.getPrunValue(i);
                let match = backward ? (p == 0b11) : (p == depth);
                if(match){
                    let udSliceClzIdx = i >> 11;
                    let edgeOrientationCoord = i & 2047;
                    for(let m = U; m <= B; m++){
                        for(let r = 0; r < 3; r++){
                            let edgeOriCoord = EdgeOrientationCoordinate.applyMove(edgeOrientationCoord, m, r);
                            let udSliceSymCoord = UDSliceCoordinate.queryFromSymMoveTable(udSliceClzIdx, m, r);
                            let symCoordPair = UDSliceCoordinate.getSymCoordinatePair(udSliceSymCoord);
                            edgeOriCoord = EdgeOrientationCoordinate.getConjugate(edgeOriCoord, symCoordPair.sym);
                            let index = this.makePrunIndex(symCoordPair.clzIdx, edgeOriCoord);
                            if(backward){
                                if(this.getPrunValue(index) == depth){
                                    this.setPrunValue(i, (depth + 1) % 3);
                                    done++;
                                }
                            }else{
                                if(this.getPrunValue(index) == 0b11){
                                    let d = (depth + 1) % 3;
                                    this.setPrunValue(index, d);
                                    done++;
    
                                    let sym = symState[symCoordPair.clzIdx];
                                    if(sym != 1){
                                        let altEdgeOriCoord;
                                        for(let s = 1; s < 16; s++){
                                            sym = sym >> 1;
                                            if((sym & 1) == 1){
                                                altEdgeOriCoord = EdgeOrientationCoordinate.getConjugate(edgeOriCoord, s);
                                                index = this.makePrunIndex(symCoordPair.clzIdx, altEdgeOriCoord);
                                                if(this.getPrunValue(index) == 0b11){
                                                    this.setPrunValue(index, d);
                                                    done++;
                                                }
                                            }else if(sym == 0){ break; }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    getPrunValue: function(index){
        return (this.table[index >> 4] >> ((index & 15) << 1)) & 0b11;
    },
    setPrunValue: function(index, value){
        let base = index >> 4;
        let offset = index & 15;
        this.table[base] = this.table[base] & (~(0b11 << (offset << 1))) | (value << (offset << 1));
    },
    makePrunIndex: function(udSlice, flip){
        return (udSlice << 11) | flip;
    },
    getDistance: function(cubie){
        let prod = [{},{},{},{},{},{},{},{},{},{},{},{}];
        let prodCubie = new CubieCube();
        edgeMultiply(Symmetries.edgeSymmetries[Symmetries.invIdx[2]], cubie.edges, prod);
        edgeMultiply(prod, Symmetries.edgeSymmetries[2], prodCubie.edges);
        console.log(prodCubie);
        let udSliceCoord = UDSliceCoordinate.getSymCoordinate(cubie);
        let symPair = UDSliceCoordinate.getSymCoordinatePair(udSliceCoord);
        let udSliceClzIdx = symPair.clzIdx;
        let edgeOriRawCoord = cubie.getEdgeOrientationCoordinate();
        // edgeOriRawCoord = EdgeOrientationCoordinate.getConjugate(edgeOriRawCoord, symPair.sym);
        edgeOriRawCoord = EdgeOrientationCoordinate.exceuteConjugate(edgeOriRawCoord, symPair.sym);
        let vCubie = new CubieCube();
        vCubie.setEdgesByEdgeOrientationCoordinate(edgeOriRawCoord);
        UDSliceCoordinate.invUDSliceCoordinate(vCubie, UDSliceCoordinate.queryRawRepresentantCoordinateByClassIndex(udSliceClzIdx));
        console.log("start", vCubie);

        let depth = 0;
        let depthMod3 = 0;
        while(udSliceClzIdx != 0 || edgeOriRawCoord != 0){
            let idx = this.makePrunIndex(udSliceClzIdx, edgeOriRawCoord);
            depthMod3 = this.getPrunValue(idx);
            let expectDepth = depthMod3 == 0 ? 2 : (depthMod3 - 1);
            let find = false;
            for(let m = U; (m <= B && !find); m++){
                for(let r = 0; (r < 3 && !find); r++){
                    if(m == F){
                        console.log("reach");
                    }
                    let edgeOriRawCoord1 = EdgeOrientationCoordinate.applyMove(edgeOriRawCoord, m, r);
                    let udSliceCoord1 = UDSliceCoordinate.queryFromSymMoveTable(udSliceClzIdx, m, r);
                    symPair = UDSliceCoordinate.getSymCoordinatePair(udSliceCoord1);
                    edgeOriRawCoord1 = EdgeOrientationCoordinate.getConjugate(edgeOriRawCoord1, symPair.sym);
                    if(m == F){
                        let tCubie = new CubieCube();
                        tCubie.setEdgesByEdgeOrientationCoordinate(edgeOriRawCoord1);
                        UDSliceCoordinate.invUDSliceCoordinate(tCubie, UDSliceCoordinate.queryRawRepresentantCoordinateByClassIndex(symPair.clzIdx));
                        console.log("move", tCubie);
                    }
                    let index = this.makePrunIndex(symPair.clzIdx, edgeOriRawCoord1);
                    if(this.getPrunValue(index) == expectDepth){
                        depth++;
                        edgeOriRawCoord = edgeOriRawCoord1;
                        udSliceClzIdx = symPair.clzIdx;
                        find = true;
                    }
                }
            }
            if(!find || depth > 20){
                console.error("no action find.", idx, depth);
                depth = -1;
                break;
            }
        }
        return depth;
    }
};

// 剪枝表(阶段一): 角块朝向(对称坐标) + udSlice : 495 * 角块朝向 + udSlice
const TwistUDSlicePruningTable = {
    table: null,
    init: function(){
        let eqlClassCount = CornerOrientationSymCoordinate.getEquivalenceClassCount();
        // 记录对称坐标到原始坐标的映射情况, 如果某一处的值大于1, 说明该处有多个对称坐标对应同一个代表元
        let symState = new Array(eqlClassCount).fill(0);
        let startCubie = new CubieCube();
        let cubieProd = new CubieCube();
        let prod = [{},{},{},{},{},{},{},{}];
        for(let i = 0; i < eqlClassCount; i++){
            let rawCoordinate = CornerOrientationSymCoordinate.queryRawRepresentantCoordinateByClassIndex(i);
            startCubie.setCornersByCornerOrientationCoordinate(rawCoordinate);
            for(let s = 0; s < 16; s++){
                cornerMultiply(Symmetries.cornerSymmetries[Symmetries.invIdx[s]], startCubie.corners, prod);
                cornerMultiply(prod, Symmetries.cornerSymmetries[s], cubieProd.corners);
                let coord = cubieProd.getCornerOrientationCoordinate();
                if(rawCoordinate == coord){
                    symState[i] = symState[i] | (1 << s);
                }
            }
        }

        let total = eqlClassCount * UDSliceCoordinate.count;
        let len =  (total >> 4) + ((total & 15) > 0 ? 1 : 0); // 32位中, 每两位存储一个步数记录
        this.table = new Array(len).fill(0xFFFFFFFF);
        this.setPrunValue(0, 0);
        let done = 1;
        let realDepth = -1;
        let depth = -1;
        while(done < total){
            let backward = realDepth > 8;   // 深度大于8时, 采用反向搜索
            realDepth++;
            depth = realDepth % 3;
            for(let i = 0; i < total; i++){
                let p = this.getPrunValue(i);
                let match = backward ? (p == 0b11) : (p == depth);
                if(match){
                    let cornerOrientationClzIdx = Math.floor(i / UDSliceCoordinate.count);
                    let udSliceCoordinate = i % UDSliceCoordinate.count;
                    for(let m = U; m <= B; m++){
                        for(let r = 0; r < 3; r++){
                            let udSliceCoord = UDSliceCoordinate.applyRawMove(udSliceCoordinate, m, r);
                            let cornOriCoord = CornerOrientationSymCoordinate.queryFromSymMoveTable(cornerOrientationClzIdx, m, r);
                            let symCoordPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornOriCoord);
                            udSliceCoord = UDSliceCoordinate.getConjugate(udSliceCoord, symCoordPair.sym);
                            let index = this.makePrunIndex(symCoordPair.clzIdx, udSliceCoord);
                            if(backward){
                                if(this.getPrunValue(index) == depth){
                                    this.setPrunValue(i, (depth + 1) % 3);
                                    done++;
                                }
                            }else{
                                if(this.getPrunValue(index) == 0b11){
                                    let d = (depth + 1) % 3;
                                    this.setPrunValue(index, d);
                                    done++;
    
                                    let sym = symState[symCoordPair.clzIdx];
                                    if(sym != 1){
                                        let altUdSliceCoord;
                                        for(let s = 1; s < 16; s++){
                                            sym = sym >> 1;
                                            if((sym & 1) == 1){
                                                altUdSliceCoord = UDSliceCoordinate.getConjugate(udSliceCoord, s);
                                                index = this.makePrunIndex(symCoordPair.clzIdx, altUdSliceCoord);
                                                if(this.getPrunValue(index) == 0b11){
                                                    this.setPrunValue(index, d);
                                                    done++;
                                                }
                                            }else if(sym == 0){ break; }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    getPrunValue: function(index){
        return (this.table[index >> 4] >> ((index & 15) << 1)) & 0b11;
    },
    setPrunValue: function(index, value){
        let base = index >> 4;
        let offset = index & 15;
        this.table[base] = this.table[base] & (~(0b11 << (offset << 1))) | (value << (offset << 1));
    },
    makePrunIndex: function(twist, udSlice){
        return twist * UDSliceCoordinate.count + udSlice;
    },
    getDistance: function(cubie){
        let cornerOriSymCoord = CornerOrientationSymCoordinate.getSymCoordinate(cubie);
        let symPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornerOriSymCoord);
        let cornerOriClzIdx = symPair.clzIdx;
        let udSliceRawCoord = UDSliceCoordinate.getUDSliceCoordinate(cubie);
        udSliceRawCoord = UDSliceCoordinate.getConjugate(udSliceRawCoord, symPair.sym);

        let depth = 0;
        let depthMod3 = 0;
        while(cornerOriClzIdx != 0 || udSliceRawCoord != 0){
            let idx = this.makePrunIndex(cornerOriClzIdx, udSliceRawCoord);
            depthMod3 = this.getPrunValue(idx);
            let expectDepth = depthMod3 == 0 ? 2 : (depthMod3 - 1);
            let find = false;
            for(let m = U; (m <= B && !find); m++){
                for(let r = 0; (r < 3 && !find); r++){
                    let udSliceCoord1 = UDSliceCoordinate.applyRawMove(udSliceRawCoord, m, r);
                    let cornOriCoord1 = CornerOrientationSymCoordinate.queryFromSymMoveTable(cornerOriClzIdx, m, r);
                    symPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornOriCoord1);
                    udSliceCoord1 = UDSliceCoordinate.getConjugate(udSliceCoord1, symPair.sym);
                    let index = this.makePrunIndex(symPair.clzIdx, udSliceCoord1);
                    if(this.getPrunValue(index) == expectDepth){
                        depth++;
                        udSliceRawCoord = udSliceCoord1;
                        cornerOriClzIdx = symPair.clzIdx;
                        find = true;
                    }
                }
            }
            if(!find || depth > 20){
                console.error("no action find.", idx, depth);
                depth = -1;
                break;
            }
        }
        return depth;
    }
};

// 一阶段剪枝表
const Phase1PruningTable = {
    udSliceSymFlipPrun: null, 
    init: function(){
        TwistSymFlipPruningTable.init();
        UDSliceFlipPruningTable.init();
        TwistUDSlicePruningTable.init();
    },
    getStepLowerBound: function(cubie){
        let t_ud = TwistUDSlicePruningTable.getDistance(cubie);
        console.log("about t_ud", t_ud);
        return TwistSymFlipPruningTable.getDistance(cubie);
    }
};

var initState = 0;
function init(){
    if(initState == 0){
        initState = 1;
        Symmetries.init();

        CornerOrientationSymCoordinate.init();
        EdgeOrientationCoordinate.init();
        UDSliceCoordinate.init();
        
        Phase1PruningTable.init();
        
        initState = 2;
    }
}

/**
 * 求解魔方, 输入魔方状态格式为一个数组:
 * U1, U2, U3,
 * U4, U5, U6,
 * U7, U8, U9,
 * R1, R2, R3,
 * R4, R5, R6,
 * R7, R8, R9,
 * F1, F2, F3,
 * F4, F5, F6,
 * F7, F8, F9,
 * D1, D2, D3,
 * D4, D5, D6,
 * D7, D8, D9,
 * L1, L2, L3,
 * L4, L5, L6,
 * L7, L8, L9,
 * B1, B2, B3,
 * B4, B5, B6,
 * B7, B8, B9
 */
function solve(cube){
    var cubie = getCubieCubeForFaceCube(cube);
    phase1(cubie);
}

function phase1(cubie){
    console.log("min step", Phase1PruningTable.getStepLowerBound(cubie));
}

export function debug(cube){
    init();
    solve(cube);
}

const FaceletToEdge = [
    [-1, UR, UF, -1, UL, UB],
    [UR, -1, FR, DR, -1, BR],
    [UF, FR, -1, DF, FL, -1],
    [-1, DR, DF, -1, DL, DB],
    [UL, -1, FL, DL, -1, BL],
    [UB, BR, -1, DB, BL, -1]
];
const FaceletToCorner = [
    [
        [-1, -1, -1, -1, -1, -1],[-1, -1, URF, -1, -1, UBR],[-1, URF, -1, -1, UFL, -1],[-1, -1, -1, -1, -1, -1],[-1, -1, UFL, -1, -1, ULB],[-1, UBR, -1, -1, ULB, -1]
    ],[
        [-1, -1, URF, -1, -1, UBR],[-1, -1, -1, -1, -1, -1],[URF, -1, -1, DFR, -1, -1],[-1, -1, DFR, -1, -1, DRB],[-1, -1, -1, -1, -1, -1],[UBR, -1, -1, DRB, -1, -1]
    ],[
        [-1, URF, -1, -1, UFL, -1],[URF, -1, -1, DFR, -1, -1],[-1, -1, -1, -1, -1, -1],[-1, DFR, -1, -1, DLF, -1],[UFL, -1, -1, DLF, -1, -1],[-1, -1, -1, -1, -1, -1]
    ],[
        [-1, -1, -1, -1, -1, -1],[-1, -1, DFR, -1, -1, DRB],[-1, DFR, -1, -1, DLF, -1],[-1, -1, -1, -1, -1, -1],[-1, -1, DLF, -1, -1, DBL],[-1, DRB, -1, -1, DBL, -1]
    ],[
        [-1, -1, UFL, -1, -1, ULB],[-1, -1, -1, -1, -1, -1],[UFL, -1, -1, DLF, -1, -1],[-1, -1, DLF, -1, -1, DBL],[-1, -1, -1, -1, -1, -1],[ULB, -1, -1, DBL, -1, -1]
    ],[
        [-1, UBR, -1, -1, ULB, -1],[UBR, -1, -1, DRB, -1, -1],[-1, -1, -1, -1, -1, -1],[-1, DRB, -1, -1, DBL, -1],[ULB, -1, -1, DBL, -1, -1],[-1, -1, -1, -1, -1, -1]
    ]
];
const FaceScore = [ 3/*U*/, 1/*R*/, 2/*F*/, 3/*D*/, 1/*L*/, 2/*B*/, ];
function getCubieCubeForFaceCube(cube){
    var cubie = new CubieCube();

    let centerMap = new Map();
    centerMap.set(cube[U5], U);
    centerMap.set(cube[R5], R);
    centerMap.set(cube[F5], F);
    centerMap.set(cube[D5], D);
    centerMap.set(cube[L5], L);
    centerMap.set(cube[B5], B);

    // 棱块
    let edges = [
        [cube[U6], cube[R2]],
        [cube[U8], cube[F2]],
        [cube[U4], cube[L2]],
        [cube[U2], cube[B2]],
        [cube[D6], cube[R8]],
        [cube[D2], cube[F8]],
        [cube[D4], cube[L8]],
        [cube[D8], cube[B8]],
        [cube[F6], cube[R4]],
        [cube[F4], cube[L6]],
        [cube[B6], cube[L4]],
        [cube[B4], cube[R6]]
    ];
    for(let i = 0; i < 12; i++){
        let edge = edges[i];
        let first = edge[0];
        let firstFace = centerMap.get(first);
        let secondFace = centerMap.get(edge[1]);
        cubie.edges[i].e = FaceletToEdge[firstFace][centerMap.get(edge[1])];

        if(FaceScore[firstFace] > FaceScore[secondFace]){
            cubie.edges[i].o = 0;
        }else{
            cubie.edges[i].o = 1;
        }
    }

    let corners = [
        [cube[U9], cube[R1], cube[F3]],
        [cube[U7], cube[F1], cube[L3]],
        [cube[U1], cube[L1], cube[B3]],
        [cube[U3], cube[B1], cube[R3]],
        [cube[D3], cube[F9], cube[R7]],
        [cube[D1], cube[L9], cube[F7]],
        [cube[D7], cube[B9], cube[L7]],
        [cube[D9], cube[R9], cube[B7]]
    ];
    for(let i = 0; i < 8; i++){
        let corner = corners[i];
        let c1 = corner[0];
        let c2 = corner[1];
        let firstFace = centerMap.get(c1);
        let secondFace = centerMap.get(c2);
        let ori;
        if(firstFace == U || firstFace == D){
            ori = 0;
        }else{
            if(secondFace == U || secondFace == D){
                ori = 1;
            }else{
                ori = 2;
            }
        }
        cubie.corners[i].o = ori;
        cubie.corners[i].c = FaceletToCorner[firstFace][secondFace][centerMap.get(corner[2])];
    }

    return cubie;
}

// 求组合数
function C(n, m){
    let result = 1;
    for(let i = n, l = n - m; i > l; i--){
        result *= i;
    }
    for(let i = 2; i <= m; i++){
        result /= i;
    }
    return Math.floor(result);
}