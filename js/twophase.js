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

    copy(that){
        for(let i = 0; i < 12; i++){
            this.edges[i].o = that.edges[i].o;
            this.edges[i].e = that.edges[i].e;
        }
        for(let i = 0; i < 8; i++){
            this.corners[i].o = that.corners[i].o;
            this.corners[i].e = that.corners[i].e;
        }
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

    edgePermutationReset(){
        for(let i = 0; i < 12; i++){
            this.edges[i].e = i;
        }
    }

    setEdgesByEdgeOrientationCoordinate(coordinate){
        EdgeOrientationRawCoordinate._invEdgeOrientationCoordinate(this.edges, coordinate);
    }

    getEdgeOrientationCoordinate(){
        return EdgeOrientationRawCoordinate._edgeOrientationCoordinate(this.edges);
    }

    setCornersByCornerOrientationCoordinate(coordinate){
        CornerOrientationRawCoordinate._invCornerOrientationCoordinate(this.corners, coordinate);
    }

    getCornerOrientationCoordinate(){
        return CornerOrientationRawCoordinate._cornerOrientationCoordinate(this.corners);
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
    }
};


const CornerOrientationRawCoordinate = {    // 角块朝向原始坐标
    count: 2187, // 3^7
    moveTable: null,
    init: function(){
        this.initMoveTable();
    },
    initMoveTable: function(){
        this.moveTable = [];
        let cubie = new CubieCube();
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            cubie.setCornersByCornerOrientationCoordinate(coordinate);

            let offset = 0;
            let moveEntries;
            if((coordinate & 1) == 1){
                offset = 12;
                moveEntries = this.moveTable[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.moveTable.push(moveEntries);
            }
            let j = 0;
            for(let m = U; m <= B; m++){
                for(let i = 0; i < 3; i++){
                    cubie.cornerMult(CornerCubieMove[m]);
                    moveEntries[j] = moveEntries[j] | (cubie.getCornerOrientationCoordinate() << offset);
                    j++;
                }
                cubie.cornerMult(CornerCubieMove[m]);
            }
        }
    },
    applyRawMove: function(coordinate, move, moveI){
        let moveEntries = this.moveTable[coordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((coordinate & 1) ? 12 : 0)) & 0xFFF;
    },
    _invCornerOrientationCoordinate: function(corners, coordinate){
        let cornerOriSum = 0;
        let o = 0;
        for(let i = 6; i >= 0; i--){
            o = coordinate % 3;
            corners[i].o = o;
            cornerOriSum = cornerOriSum + o;
            coordinate = Math.floor(coordinate / 3);
        }
        // 所有角块朝向之和一定能被3整除
        cornerOriSum = cornerOriSum % 3;
        corners[DRB].o = cornerOriSum ? (3 - cornerOriSum) : 0;
    },
    _cornerOrientationCoordinate: function(corners){
        let result = 0;
        for(let i = 0; i < 7; i++){ // 最后一个不用计算, 前7个确定之后, 最后一个也就确定了
            result = 3 * result + corners[i].o;
        }
        return result;
    }
};

const CornerOrientationSymCoordinate = {    // 角块朝向对称坐标
    moveTable: null,
    classIndexToRepresentantArray: null,
    rawToSymIdxTable: null, // 原始坐标到对称i映射表
    symmetryTable: null,
    init: function(){
        this.initSymmetryTable();
        this.initClassIndexToRepresentantArray();
        this.initMoveTable();
    },
    initSymmetryTable: function(){
        this.symmetryTable = new Array(CornerOrientationRawCoordinate.count >> 1).fill(null);
        let corners = [{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:UBR,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0}];
        let midProd = [{},{},{},{},{},{},{},{}];
        let prod = [{},{},{},{},{},{},{},{}];
        for(let coordinate = 0; coordinate < CornerOrientationRawCoordinate.count; coordinate++){
            CornerOrientationRawCoordinate._invCornerOrientationCoordinate(corners, coordinate);
            let symEntries;
            let offset = 0;
            if((coordinate & 1) == 1){
                offset = 12;
                symEntries = this.symmetryTable[coordinate >> 1];
            }else{
                symEntries = new Array(16).fill(0);
                this.symmetryTable[coordinate >> 1] = symEntries;
            }
            symEntries[0] = symEntries[0] | (coordinate << offset);
            for(let s = 1; s < 16; s++){
                cornerMultiply(Symmetries.cornerSymmetries[Symmetries.invIdx[s]], corners, midProd);
                cornerMultiply(midProd, Symmetries.cornerSymmetries[s], prod);
                symEntries[s] = symEntries[s] | (CornerOrientationRawCoordinate._cornerOrientationCoordinate(prod) << offset);
            }
        }
    },
    initClassIndexToRepresentantArray: function(){
        let len = (CornerOrientationRawCoordinate.count >> 5) + 1; // 3^7 / 32
        let used = new Array(len).fill(0);
        this.classIndexToRepresentantArray = [];
        this.rawToSymIdxTable = new Array(len >> 2).fill(0);
        for(let c = 0; c < len; c++){
            for(let i = 0; i < 32; i++){
                if((used[c] & (1 << i)) == 0){ // 说明这个原始坐标在之前的等价类中没有出现过
                    let rawCoordinate = c << 5 | i; // c * 32 + i
                    let representant = rawCoordinate;
                    if(rawCoordinate >= CornerOrientationRawCoordinate.count){ return; }
                    this.classIndexToRepresentantArray.push(rawCoordinate);
                    for(let s = 0; s < 16; s++){  // 计算该等价类中的所有元素, 并将其位置标记为占用
                        rawCoordinate = this.rawToRawBySymmetry(representant, s);
                        let u = used[rawCoordinate >> 5];
                        if((u & (1 << (rawCoordinate & 31))) == 0){
                            used[rawCoordinate >> 5] = u | (1 << (rawCoordinate & 31));
                            // this.rawToSymIdxTable[rawCoordinate / 8] = this.rawToSymIdxTable[rawCoordinate / 8] | (s << ((rawCoordinate % 8) * 4))
                            this.rawToSymIdxTable[rawCoordinate >> 3] = this.rawToSymIdxTable[rawCoordinate >> 3] | (s << ((rawCoordinate & 7) << 2));
                        }
                    }
                }
            }
        }
    },
    initMoveTable: function(){
        this.moveTable = [];
        for(let classIdx = 0; classIdx < this.classIndexToRepresentantArray.length; classIdx++){
            let rawCoordinate = this.classIndexToRepresentantArray[classIdx];
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
                    let coord = CornerOrientationRawCoordinate.applyRawMove(rawCoordinate, move, r);
                    moveEntries[j] = moveEntries[j] | (this.getSymCoordinateByRawCoordinate(coord) << offset);
                    j++;
                }
            }
        }
    },
    rawToRawBySymmetry: function(rawCoordinate, symIdx){ // 求一个原始坐标经过对称后的原始坐
        let symEntries = this.symmetryTable[rawCoordinate >> 1];
        return (symEntries[symIdx] >> ((rawCoordinate & 1) ? 12 : 0)) & 0xFFF;
    },
    applySymMove: function(classIdx, move, moveI){
        let moveEntries = this.moveTable[classIdx >> 1];
        return (moveEntries[move * 3 + moveI] >> ((classIdx & 1) ? 16 : 0)) & 0xFFFF;
    },
    getSymCoordinate: function(cubie){  // 根据原始坐标, 得到对称坐标
        return this.getSymCoordinateByRawCoordinate(cubie.getCornerOrientationCoordinate());
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
        return binarySearch(rawCoordinate, this.classIndexToRepresentantArray) != -1;
    },
    getEquivalenceClassCount: function(){
        return this.classIndexToRepresentantArray.length;
    },
    getClassIdxByRawCoordinate: function(rawCoordinate){
        return this.getSymCoordinateByRawCoordinate(rawCoordinate) >> 4;
    },
    getSymCoordinateByRawCoordinate: function(rawCoordinate){
        let symIdx = ((this.rawToSymIdxTable[rawCoordinate >> 3]) >> ((rawCoordinate & 7) << 2)) & 0xF;
        if(symIdx > 0){
            rawCoordinate = this.rawToRawBySymmetry(rawCoordinate, Symmetries.invIdx[symIdx]);
        }
        let clzIdx = binarySearch(rawCoordinate, this.classIndexToRepresentantArray);
        if(clzIdx == -1){
            console.warn("not find", rawCoordinate);
        }
        return clzIdx << 4 | symIdx;
    }
};

const EdgeOrientationRawCoordinate = {  // 棱块朝向原始坐标
    count: 2048, // 2^11
    moveTable: null,
    init: function(){
        this.initMoveTable();
    },
    initMoveTable: function(){
        this.moveTable = [];
        let cubie = new CubieCube();
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            cubie.setEdgesByEdgeOrientationCoordinate(coordinate);

            let offset = 0;
            let moveEntries;
            if((coordinate & 1) == 1){
                offset = 11;
                moveEntries = this.moveTable[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.moveTable.push(moveEntries);
            }
            let j = 0;
            for(let m = U; m <= B; m++){
                for(let i = 0; i < 3; i++){
                    cubie.edgeMult(EdgeCubieMove[m]);
                    moveEntries[j] = moveEntries[j] | (cubie.getEdgeOrientationCoordinate() << offset);
                    j++;
                }
                cubie.edgeMult(EdgeCubieMove[m]);
            }
        }
    },
    applyRawMove: function(coordinate, move, moveI){
        let moveEntries = this.moveTable[coordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((coordinate & 1) ? 11 : 0)) & 0x7FF;
    },
    _invEdgeOrientationCoordinate: function(edges, coordinate){
        let edgeOriSum = 0;
        let o = 0;
        for(let i = 10; i >= 0; i--){
            o = coordinate & 1;
            edges[i].o = o;
            edgeOriSum = edgeOriSum + o;
            coordinate = coordinate >> 1;
        }
        // 所有角块朝向之和一定能被2整除
        edges[BR].o = edgeOriSum & 1;
    },
    _edgeOrientationCoordinate: function(edges){
        let result = 0;
        for(let i = 0; i < 11; i++){    // 最后一个不用计算, 前面11个确定之后, 最后一个也就确定了 
            result = 2 * result + edges[i].o;
        }
        return result;
    }

};

const UDSliceRawCoordinate = { // ud-slice原始坐标
    count: 495, // 12 * 11 * 10 * 9 / 4!
    moveTable: null,
    init: function(){
        this.initMoveTable();
    },
    initMoveTable: function(){
        this.moveTable = [];
        let cubie = new CubieCube();
        for(let coordinate = 0; coordinate < this.count; coordinate++){
            this.invUDSliceCoordinate(cubie, coordinate);
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
                    moveEntries[j] = moveEntries[j] | (this.getUDSliceCoordinate(cubie) << offset);
                    j++;
                }
                cubie.edgeMult(EdgeCubieMove[move]);
            }
        }
    },
    applyRawMove: function(rawCoordinate, move, moveI){
        let moveEntries = this.moveTable[rawCoordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((rawCoordinate & 1) ? 12 : 0)) & 0xFFF;
    },
    getUDSliceCoordinate: function(cubie){
        return this._UDSliceCoordinate(cubie.edges);
    },
    invUDSliceCoordinate: function(cubie, rawCoordinate){
        this._invUDSliceCoordinate(cubie.edges, rawCoordinate);
    },
    _UDSliceCoordinate: function(edges){
        let used = new Array(12);
        for(let i = 0; i < 12; i++){
            used[i] = edges[i].e >= FR;
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
    _invUDSliceCoordinate: function(edges, rawCoordinate){
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
                    if(edges[j].e == udSliceEdge){
                        edges[j].e = edges[i].e;
                        break;
                    }
                }
                edges[i].e = udSliceEdge;
                udSliceEdge++;
            }
        }
    }
};

const UDSliceSymCoordinate = {  // ud-slice对称坐标
    rawMoveTable: null,
    symMoveTable: null,
    classIndexToRepresentantArray: null,
    conjugateTable: null,
    init: function(){
        this.initConjugateTable();
    },
    initConjugateTable: function(){
        this.conjugateTable = [];
        let cubieStart = new CubieCube();
        let cubieProd = new CubieCube();
        let midProd = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let coordinate = 0; coordinate < UDSliceRawCoordinate.count; coordinate++){
            UDSliceRawCoordinate.invUDSliceCoordinate(cubieStart, coordinate);

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
                symEntries[s] = symEntries[s] | (UDSliceRawCoordinate.getUDSliceCoordinate(cubieProd) << offset);
            }
        }
    },
    getConjugate: function(coordinate, symIndex){
        let symEntries = this.conjugateTable[coordinate >> 1];
        return (symEntries[symIndex] >> ((coordinate & 1) ? 10 : 0)) & 0x1FF;
    }
};

const FlipUDSliceRawCoordinate = {  // flip + ud-slice 原始坐标
    getCoordinate: function(cubie){
        return (UDSliceRawCoordinate.getUDSliceCoordinate(cubie) << 11) | cubie.getEdgeOrientationCoordinate();
    },
    invFlipUDSliceCoordinate: function(cubie, rawCoordinate){
        UDSliceRawCoordinate.invUDSliceCoordinate(cubie, rawCoordinate >> 11);
        cubie.setEdgesByEdgeOrientationCoordinate(rawCoordinate & 2047);
    },
    splitCoordinate: function(coordinate){
        return {
            udSlice: coordinate >> 11,
            flip: coordinate & 2047
        };
    },
    combine: function(flip, udSlice){
        return udSlice << 11 | flip;
    },
    _invFlipUDSliceCoordinate: function(edges, rawCoordinate){
        UDSliceRawCoordinate._invUDSliceCoordinate(edges, rawCoordinate >> 11);
        EdgeOrientationRawCoordinate._invEdgeOrientationCoordinate(edges, rawCoordinate & 2047);
    },
    _flipUDSliceCoordinate: function(edges){
        return (UDSliceRawCoordinate._UDSliceCoordinate(edges) << 11) | EdgeOrientationRawCoordinate._edgeOrientationCoordinate(edges);
    }
};

// 棱块朝向+中间层棱块位置  -- 对称坐标(FlipUDSliceCoordinate = UDSliceCoordinate * 2048 + EdgeOrientationCoordinate)
const FlipUDSliceSymCoordinate = {
    moveTable: [],
    classIndexToRepresentantArray: null,
    rawToSymIdxTable: null,
    init: function(){
        this.initClassIndexToRepresentantArray();
        this.initMoveTable();
    },
    initClassIndexToRepresentantArray: function(){
        let used = new Array((UDSliceRawCoordinate.count * EdgeOrientationRawCoordinate.count) >> 5).fill(0); // 495 * 2048 / 32
        let cubie = new CubieCube();
        let cubieP = new CubieCube();
        this.classIndexToRepresentantArray = [];
        this.rawToSymIdxTable = new Array((UDSliceRawCoordinate.count * EdgeOrientationRawCoordinate.count) >> 3).fill(0); // 495 * 2048 / 8
        let symResult = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let ud = 0; ud < 495; ud++){
            UDSliceRawCoordinate.invUDSliceCoordinate(cubie, ud);
            for(let e = 0; e < 64; e++){ // 64 = 2048 / 32
                let byteOffset = ud << 6 | e;
                for(let k = 0; k < 32; k++){
                    if((used[byteOffset] & (1 << k)) == 0){ // 说明这个原始坐标在之前的等价类中没有出现过
                        this.classIndexToRepresentantArray.push(byteOffset << 5 | k);
                        cubie.setEdgesByEdgeOrientationCoordinate(e << 5 | k);
                        for(let s = 0; s < 16; s++){ // 计算该等价类中的所有元素, 并将其位置标记为占用
                            edgeMultiply(Symmetries.edgeSymmetries[Symmetries.invIdx[s]], cubie.edges, symResult);
                            edgeMultiply(symResult, Symmetries.edgeSymmetries[s], cubieP.edges);
                            let rawCoordinate = FlipUDSliceRawCoordinate.getCoordinate(cubieP);
                            let u = used[rawCoordinate >> 5];
                            if((u & (1 << (rawCoordinate & 31))) == 0){
                                used[rawCoordinate >> 5] = u | (1 << (rawCoordinate & 31));
                                // this.rawToSymIdxTable[rawCoordinate / 8] = this.rawToSymIdxTable[rawCoordinate / 8] | (s << ((rawCoordinate % 8) * 4))
                                this.rawToSymIdxTable[rawCoordinate >> 3] = this.rawToSymIdxTable[rawCoordinate >> 3] | (s << ((rawCoordinate & 7) << 2));
                            }
                        }
                    }
                }
            }
        }
    },
    initMoveTable: function(){
        this.moveTable = [];
        for(const coordinate of this.classIndexToRepresentantArray){ // 共有64430个等价类
            let info = FlipUDSliceRawCoordinate.splitCoordinate(coordinate);
            let moveEntries = new Array(18).fill(0);
            this.moveTable.push(moveEntries);
            let j = 0;
            for(let move = U; move <= B; move++){
                for(let r = 0; r < 3; r++){
                    let coord = FlipUDSliceRawCoordinate.combine(
                        EdgeOrientationRawCoordinate.applyRawMove(info.flip, move, r),
                        UDSliceRawCoordinate.applyRawMove(info.udSlice, move, r)
                    );
                    moveEntries[j] = this.getSymCoordinateByRawCoordinate(coord);
                    j++;
                }
            }
        }
    },
    applySymMove: function(clzIdx, move, moveI){
        return this.moveTable[clzIdx][move * 3 + moveI];
    },
    getClassIdxByRawCoordinate: function(rawCoordinate){
        return this.getSymCoordinateByRawCoordinate(rawCoordinate) >> 4;
    },
    getSymCoordinateByRawCoordinate: function(rawCoordinate){
        let symIdx = ((this.rawToSymIdxTable[rawCoordinate >> 3]) >> ((rawCoordinate & 7) << 2)) & 0xF;
        let clzIdx = -1;
        if(symIdx == 0){
            clzIdx = binarySearch(rawCoordinate, this.classIndexToRepresentantArray);
        }else{
            let edges = [{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:UB,o:0},{e:DR,o:0},{e:DF,o:0},{e:DL,o:0},{e:DB,o:0},{e:FR,o:0},{e:FL,o:0},{e:BL,o:0},{e:BR,o:0}];
            FlipUDSliceRawCoordinate._invFlipUDSliceCoordinate(edges, rawCoordinate);
            let midResult = [{},{},{},{},{},{},{},{},{},{},{},{}];
            let prod = [{e:UR,o:0},{e:UF,o:0},{e:UL,o:0},{e:UB,o:0},{e:DR,o:0},{e:DF,o:0},{e:DL,o:0},{e:DB,o:0},{e:FR,o:0},{e:FL,o:0},{e:BL,o:0},{e:BR,o:0}];
            edgeMultiply(Symmetries.edgeSymmetries[symIdx], edges, midResult);
            edgeMultiply(midResult, Symmetries.edgeSymmetries[Symmetries.invIdx[symIdx]], prod);
            let representant = FlipUDSliceRawCoordinate._flipUDSliceCoordinate(prod);
            clzIdx = binarySearch(representant, this.classIndexToRepresentantArray);
        }
        if(clzIdx == -1){
            console.warn("not find", rawCoordinate);
        }
        return clzIdx << 4 | symIdx;
    },
    getSymCoordinate: function(cubie){
        return this.getSymCoordinateByRawCoordinate(FlipUDSliceRawCoordinate.getCoordinate(cubie));
    },
    getSymCoordinatePair: function(symCoordinate){
        return {
            clzIdx : symCoordinate >> 4,
            sym: symCoordinate & 15
        };
    },
    queryRawRepresentantCoordinateByClassIndex: function(classIndex){
        return this.classIndexToRepresentantArray[classIndex];
    },
    getEquivalenceClassCount : function(){
        return this.classIndexToRepresentantArray.length;
    }
}

const FlipUDSlicePruningTable = {
    table: null,
    init: function(){
        let total = FlipUDSliceSymCoordinate.getEquivalenceClassCount();
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
                    for(let m = U; m <= B; m++){
                        for(let r = 0; r < 3; r++){
                            let flipUdSlice = FlipUDSliceSymCoordinate.applySymMove(i, m, r);
                            let symCoordPair = FlipUDSliceSymCoordinate.getSymCoordinatePair(flipUdSlice);
                            let index = symCoordPair.clzIdx;
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
    getDistance: function(cubie){
        let flipUDSliceCoordinate = FlipUDSliceSymCoordinate.getSymCoordinate(cubie);
        let symCoordIdx = FlipUDSliceSymCoordinate.getSymCoordinatePair(flipUDSliceCoordinate).clzIdx;
        let depth = 0;
        let depthMod3 = 0;
        while(symCoordIdx != 0){
            depthMod3 = this.getPrunValue(symCoordIdx);
            let expectDepth = depthMod3 == 0 ? 2 : (depthMod3 - 1);
            let find = false;
            for(let m = U; (m <= B && !find); m++){
                for(let r = 0; (r < 3 && !find); r++){
                    let symCoord1 = FlipUDSliceSymCoordinate.applySymMove(symCoordIdx, m, r);
                    let symPair = FlipUDSliceSymCoordinate.getSymCoordinatePair(symCoord1);
                    if(this.getPrunValue(symPair.clzIdx) == expectDepth){
                        depth++;
                        symCoordIdx = symPair.clzIdx;
                        find = true;
                    }
                }
            }
            if(!find || depth > 20){
                console.error("no action find.", symCoordIdx, depth);
                depth = -1;
                break;
            }
        }
        return depth;
    },
    getMod3Distance: function(flipRaw, udSlice){
        let flipUdSliceRaw = FlipUDSliceRawCoordinate.combine(flipRaw, udSlice);
        return this.getPrunValue(FlipUDSliceSymCoordinate.getClassIdxByRawCoordinate(flipUdSliceRaw));
    }
}

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

        let total = eqlClassCount * UDSliceRawCoordinate.count;
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
                    let cornerOrientationClzIdx = Math.floor(i / UDSliceRawCoordinate.count);
                    let udSliceCoordinate = i % UDSliceRawCoordinate.count;
                    for(let m = U; m <= B; m++){
                        for(let r = 0; r < 3; r++){
                            let udSliceCoord = UDSliceRawCoordinate.applyRawMove(udSliceCoordinate, m, r);
                            let cornOriCoord = CornerOrientationSymCoordinate.applySymMove(cornerOrientationClzIdx, m, r);
                            let symCoordPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornOriCoord);
                            udSliceCoord = UDSliceSymCoordinate.getConjugate(udSliceCoord, symCoordPair.sym);
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
                                                altUdSliceCoord = UDSliceSymCoordinate.getConjugate(udSliceCoord, s);
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
        this.table[base] = this.table[base] & (~(0b11 << (offset << 1))) | (value << (offset << 1))
    },
    makePrunIndex: function(twist, udSlice){
        return twist * UDSliceRawCoordinate.count + udSlice;
    },
    getMod3Distance: function(cornerRawOri, udSliceRaw){
        let cornerSymOri = CornerOrientationSymCoordinate.getSymCoordinateByRawCoordinate(cornerRawOri);
        let pair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornerSymOri);
        return this.getPrunValue(this.makePrunIndex(pair.clzIdx, UDSliceSymCoordinate.getConjugate(udSliceRaw, pair.sym)));
    },
    getDistance: function(cubie){
        let cornerOriSymCoord = CornerOrientationSymCoordinate.getSymCoordinate(cubie);
        let symPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornerOriSymCoord);
        let cornerOriClzIdx = symPair.clzIdx;
        let udSliceRawCoord = UDSliceRawCoordinate.getUDSliceCoordinate(cubie);
        udSliceRawCoord = UDSliceSymCoordinate.getConjugate(udSliceRawCoord, symPair.sym);

        let depth = 0;
        let depthMod3 = 0;
        while(cornerOriClzIdx != 0 || udSliceRawCoord != 0){
            let idx = this.makePrunIndex(cornerOriClzIdx, udSliceRawCoord);
            depthMod3 = this.getPrunValue(idx);
            let expectDepth = depthMod3 == 0 ? 2 : (depthMod3 - 1);
            let find = false;
            for(let m = U; (m <= B && !find); m++){
                for(let r = 0; (r < 3 && !find); r++){
                    let udSliceCoord1 = UDSliceRawCoordinate.applyRawMove(udSliceRawCoord, m, r);
                    let cornOriCoord1 = CornerOrientationSymCoordinate.applySymMove(cornerOriClzIdx, m, r);
                    symPair = CornerOrientationSymCoordinate.getSymCoordinatePair(cornOriCoord1);
                    udSliceCoord1 = UDSliceSymCoordinate.getConjugate(udSliceCoord1, symPair.sym);
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
        TwistUDSlicePruningTable.init();
        FlipUDSlicePruningTable.init();
    },
    getStepLowerBound: function(cubie){
        let twistUDSliceDistance = TwistUDSlicePruningTable.getDistance(cubie);
        let flipUDSliceDistance = FlipUDSlicePruningTable.getDistance(cubie);
        return [ twistUDSliceDistance, flipUDSliceDistance ];
    },
    estimateStep: function(cornerRawOri, edgeRawOri, udSliceRaw, baseSteps){
        let m1 = TwistUDSlicePruningTable.getMod3Distance(cornerRawOri, udSliceRaw);
        let m2 = FlipUDSlicePruningTable.getMod3Distance(edgeRawOri, udSliceRaw);
        return [ adjustStep(baseSteps[0], m1), adjustStep(baseSteps[1], m2) ];
    }
};

const StepByStep = [
    [0, 1, -1],
    [-1, 0, 1],
    [1, -1, 0]
];
function adjustStep(baseStep, mod3){
    return baseStep + StepByStep[baseStep % 3][mod3];
}

var initState = 0;
function init(){
    if(initState == 0){
        initState = 1;
        Symmetries.init();

        EdgeOrientationRawCoordinate.init();
        CornerOrientationRawCoordinate.init();
        UDSliceRawCoordinate.init();

        CornerOrientationSymCoordinate.init();
        UDSliceSymCoordinate.init();
        FlipUDSliceSymCoordinate.init();
        
        Phase1PruningTable.init();

        initState = 2;
    }
}

function search(cubie){
    return phase1(cubie);
}

const MAX_DEPTH_PHASE1 = 20;
const MAC_DEPTH_PHASE2 = 18;
function phase1(cubie){
    let distanceArr = Phase1PruningTable.getStepLowerBound(cubie);
    let distance = max(distanceArr);
    if(distance == 0){
        return [];
    }
    console.log("estimate distance : ", distance);

    let cornerRawOri = cubie.getCornerOrientationCoordinate();
    let edgeRawOri = cubie.getEdgeOrientationCoordinate();
    let udSliceRaw = UDSliceRawCoordinate.getUDSliceCoordinate(cubie);

    let depth = distance;
    while(depth <= MAX_DEPTH_PHASE1){
        let result = phase1DFSAStar(cornerRawOri, edgeRawOri, udSliceRaw, distanceArr, depth);
        if(result){
            return buildPath(result);
        }
        depth++;
    }
    return [];
}

const SYM_MOVE = [
    D, /* U --> D */ L, /* R --> L */ B, /* F --> B */ U, /* D --> U */ R, /* L --> R */ F /* B --> F */
];
function phase1DFSAStar(cornerRawOri, edgeRawOri, udSliceRaw, distanceArr, maxDepth){
    let stack = [];
    let root = new Node(0, -1, 0, null, [ cornerRawOri, edgeRawOri, udSliceRaw ]);
    root.distanceArr = distanceArr;
    stack.push(root);
    while(stack.length > 0){
        let parent = stack.pop();
        for(let m = B; m >= R; m--){
            if(m == parent.move 
                || (parent.parent != null && parent.parent.move == m && parent.move != -1 && parent.parent.move == SYM_MOVE[parent.move])){ 
                    continue; 
            }
            for(let r = 2; r >= 0; r--){
                cornerRawOri = CornerOrientationRawCoordinate.applyRawMove(parent.coordinate[0], m, r);
                edgeRawOri = EdgeOrientationRawCoordinate.applyRawMove(parent.coordinate[1], m, r);
                udSliceRaw = UDSliceRawCoordinate.applyRawMove(parent.coordinate[2], m, r);
                let node = new Node(parent.depth + 1, m, r, parent, [ cornerRawOri, edgeRawOri, udSliceRaw ]);
                if(cornerRawOri == 0 && edgeRawOri == 0 && udSliceRaw == 0){
                    return node;
                }else{
                    let newDistanceArr = Phase1PruningTable.estimateStep(cornerRawOri, edgeRawOri, udSliceRaw, parent.distanceArr);
                    node.distanceArr = newDistanceArr;
                    if(node.depth + max(newDistanceArr) < maxDepth){
                        stack.push(node);
                    }
                }
            }
        }
    }
    return null;
}

class Node{
    constructor(depth, move, moveRepeat, parent, coordinate){
        this.depth = depth; // 当前已经行进的深度
        this.move = move;
        this.moveRepeat = moveRepeat;
        this.parent = parent;
        this.coordinate = coordinate;
        this.distanceArr = null;   // 距离目标的预估深度
    }
}

const STEP_MAP = [
    ["U", "U2", "U'"],
    ["R", "R2", "R'"],
    ["F", "F2", "F'"],
    ["D", "D2", "D'"],
    ["L", "L2", "L'"],
    ["B", "B2", "B'"]
];
function buildPath(node){
    let path = [];
    let cursor = node;
    while(cursor.depth > 0){
        path.unshift(STEP_MAP[cursor.move][cursor.moveRepeat]);
        cursor = cursor.parent;
    }
    return path;
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
export function solve(cube){
    console.time("totalInit");
    init();
    console.timeEnd("totalInit");
    var cubie = getCubieCubeForFaceCube(cube);
    console.time("search");
    let solution = search(cubie);
    console.timeEnd("search");
    return solution;
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

    // TODO 魔方状态合法性校验

    return cubie;
}

/**
 * 求数组最大值, 仅适用于正整数
 */
function max(arr){
    let m = 0;
    for(let a of arr){
        if(m < a){
            m = a;
        }
    }
    return m;
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

// 二分查找
function binarySearch(target, array){
    if(target <= array[array.length - 1]){
        let l = 0, r = array.length - 1, mid = -1;
        while(l <= r){
            mid = (l + r) >> 1;
            let c = array[mid];
            if(c > target){
                r = mid - 1;
            }else if(c < target){
                l = mid + 1;
            }else{
                return mid;
            }
        }
    }
    return -1;
}