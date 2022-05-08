/**
 * 两阶段算法
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

// 面移动变换
// const FaceMove = {
//     U: [U3,U6,U9,U2,U5,U8,U1,U4,U7,F1,F2,F3,R4,R5,R6,R7,R8,R9,L1,L2,L3,F4,F5,F6,F7,F8,F9,D1,D2,D3,D4,D5,D6,D7,D8,D9,B1,B2,B3,L4,L5,L6,L7,L8,L9,R1,R2,R3,B4,B5,B6,B7,B8,B9],
//     R: [U1,U2,B7,U4,U5,B4,U7,U8,B1,R3,R6,R9,R2,R5,R8,R1,R4,R7,F1,F2,U3,F4,F5,U6,F7,F8,U9,D1,D2,F3,D4,D5,F6,D7,D8,F9,L1,L2,L3,L4,L5,L6,L7,L8,L9,D9,B2,B3,D6,B5,B6,D3,B8,B9],
//     F: [U1,U2,U3,U4,U5,U6,R1,R4,R7,D3,R2,R3,D2,R5,R6,D1,R8,R9,F3,F6,F9,F2,F5,F8,F1,F4,F7,L3,L6,L9,D4,D5,D6,D7,D8,D9,L1,L2,U9,L4,L5,U8,L7,L8,U7,B1,B2,B3,B4,B5,B6,B7,B8,B9],
//     D: [U1,U2,U3,U4,U5,U6,U7,U8,U9,R1,R2,R3,R4,R5,R6,B7,B8,B9,F1,F2,F3,F4,F5,F6,R7,R8,R9,D3,D6,D9,D2,D5,D8,D1,D4,D7,L1,L2,L3,L4,L5,L6,F7,F8,F9,B1,B2,B3,B4,B5,B6,L7,L8,L9],
//     L: [F1,U2,U3,F4,U5,U6,F7,U8,U9,R1,R2,R3,R4,R5,R6,R7,R8,R9,D1,F2,F3,D4,F5,F6,D7,F8,F9,B9,D2,D3,B6,D5,D6,B3,D8,D9,L3,L6,L9,L2,L5,L8,L1,L4,L7,B1,B2,U7,B4,B5,U4,B7,B8,U1],
//     B: [L7,L4,L1,U4,U5,U6,U7,U8,U9,R1,R2,U1,R4,R5,U2,R7,R8,U3,F1,F2,F3,F4,F5,F6,F7,F8,F9,D1,D2,D3,D4,D5,D6,R9,R6,R3,D7,L2,L3,D8,L5,L6,D9,L8,L9,B3,B6,B9,B2,B5,B8,B1,B4,B7]
// };
// 角块移动变换. c(corner)表示要移动到当前位置的块; o(orientation)表示移动后, 块的朝向
const CornerCubieMove = [
    [{c:UBR,o:0},{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0}], // U
    [{c:DFR,o:2},{c:UFL,o:0},{c:ULB,o:0},{c:URF,o:1},{c:DRB,o:1},{c:DLF,o:0},{c:DBL,o:0},{c:UBR,o:2}], // R
    [{c:UFL,o:1},{c:DLF,o:2},{c:ULB,o:0},{c:UBR,o:0},{c:URF,o:2},{c:DFR,o:1},{c:DBL,o:0},{c:DRB,o:0}], // F
    [{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:UBR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0},{c:DFR,o:0}], // D
    [{c:URF,o:0},{c:ULB,o:1},{c:DBL,o:2},{c:UBR,o:0},{c:DFR,o:0},{c:UFL,o:2},{c:DLF,o:1},{c:DRB,o:0}], // L
    [{c:URF,o:0},{c:UFL,o:0},{c:UBR,o:1},{c:DRB,o:2},{c:DFR,o:0},{c:DLF,o:0},{c:ULB,o:2},{c:DBL,o:1}]  // B
];

// 棱块移动变换. e(edge)表示要东到当前位置的块; o(orientation)表示移动后, 块的朝向
const EdgeCubieMove = [
    [{e:UB,o:0,oA:1},{e:UR,o:0,oA:1},{e:UF,o:0,oA:1},{e:UL,o:0,oA:1},{e:DR,o:0,oA:0},{e:DF,o:0,oA:0},{e:DL,o:0,oA:0},{e:DB,o:0,oA:0},{e:FR,o:0,oA:0},{e:FL,o:0,oA:0},{e:BL,o:0,oA:0},{e:BR,o:0,oA:0}], // U
    [{e:FR,o:0,oA:1},{e:UF,o:0,oA:0},{e:UL,o:0,oA:0},{e:UB,o:0,oA:0},{e:BR,o:0,oA:1},{e:DF,o:0,oA:0},{e:DL,o:0,oA:0},{e:DB,o:0,oA:0},{e:DR,o:0,oA:1},{e:FL,o:0,oA:0},{e:BL,o:0,oA:0},{e:UR,o:0,oA:1}], // R
    [{e:UR,o:0,oA:0},{e:FL,o:1,oA:1},{e:UL,o:0,oA:0},{e:UB,o:0,oA:0},{e:DR,o:0,oA:0},{e:FR,o:1,oA:1},{e:DL,o:0,oA:0},{e:DB,o:0,oA:0},{e:UF,o:1,oA:1},{e:DF,o:1,oA:1},{e:BL,o:0,oA:0},{e:BR,o:0,oA:0}], // F
    [{e:UR,o:0,oA:0},{e:UF,o:0,oA:0},{e:UL,o:0,oA:0},{e:UB,o:0,oA:0},{e:DF,o:0,oA:1},{e:DL,o:0,oA:1},{e:DB,o:0,oA:1},{e:DR,o:0,oA:1},{e:FR,o:0,oA:0},{e:FL,o:0,oA:0},{e:BL,o:0,oA:0},{e:BR,o:0,oA:0}], // D
    [{e:UR,o:0,oA:0},{e:UF,o:0,oA:0},{e:BL,o:0,oA:1},{e:UB,o:0,oA:0},{e:DR,o:0,oA:0},{e:DF,o:0,oA:0},{e:FL,o:0,oA:1},{e:DB,o:0,oA:0},{e:FR,o:0,oA:0},{e:UL,o:0,oA:1},{e:DL,o:0,oA:1},{e:BR,o:0,oA:0}], // L
    [{e:UR,o:0,oA:0},{e:UF,o:0,oA:0},{e:UL,o:0,oA:0},{e:BR,o:1,oA:1},{e:DR,o:0,oA:0},{e:DF,o:0,oA:0},{e:DL,o:0,oA:0},{e:BL,o:1,oA:1},{e:FR,o:0,oA:0},{e:FL,o:0,oA:0},{e:UB,o:1,oA:1},{e:DB,o:1,oA:1}]  // B
];

function cornerMultiply(a, b, result){
    let ori, oriA, oriB;
    for(let i = 0; i < 8; i++){
        result[i].c = a[b[i].c].c;
        oriA = a[b[i].c].o;
        oriB = b[i].o;
        if(oriA < 3 && oriB < 3){
            ori = (oriA + oriB) % 3;
        }else if(oriA >= 3 && oriB < 3){    // 考虑到镜像对称的情况
            ori = oriA + oriB;
            if(ori >= 6){ ori = ori - 3; }
        }else if(oriA < 3 && oriB >= 3){
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
        result[i].o = (a[b[i].e].o + b[i].o) % 2;
    }
}

// function faceMoveMultiple(a, b){
//     let result = new Array(54).fill(-1);
//     for(let i = 0; i < 54; i++){
//         result[b[i]] = a[i];
//     }
//     return result;
// }

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
            this.edges[i] = {
                o: o
            };
            cornerOriSum = cornerOriSum + o;
            coordinate = Math.floor(coordinate / 3);
        }
        // 所有角块朝向之和一定能被3整除
        cornerOriSum = cornerOriSum % 3;
        this.edges[DRB] = {
            o: cornerOriSum ? (3 - cornerOriSum) : 0
        };
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

    getEdgePermtationCoordinate(){
        let result = 0;
        for(let i = 11; i > 0; i--){
            let e = this.edges.e;
            let order = 0;
            for(let j = i - 1; j >= 0; j--){
                if(e < this.edges[j].c){
                    order++;
                }
            }
            result = (order + result) * i;
        }
        return result;
    }
    
    getUDSliceSortedCoordinate(){
        let arr = [];
        for(let i = 0; i < 12; i++){
            let edge = this.edges[i];
            if(edge.e >= FR){
                arr.push(edge.e);
            }
        }
    
        let x = 0;
        for(let i = 3; i > 0; i--){
            let s = 0;
            for(let k = i - 1; k >= 0; k--){
                if(arr[k] > arr[i]){ s++; }
            }
            x = (x + s) * i;
        }
        return this.getUDSliceCoordinate() * 24 + x;
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
    // faceletLevel: {
    //     S_URF3: [R9,R8,R7,R6,R5,R4,R3,R2,R1,F3,F6,F9,F2,F5,F8,F1,F4,F7,U3,U6,U9,U2,U5,U8,U1,U4,U7,L1,L2,L3,L4,L5,L6,L7,L8,L9,B7,B4,B1,B8,B5,B2,B9,B6,B3,D3,D6,D9,D2,D5,D8,D1,D4,D7],
    //     S_F2:   [D9,D8,D7,D6,D5,D4,D3,D2,D1,L9,L8,L7,L6,L5,L4,L3,L2,L1,F9,F8,F7,F6,F5,F4,F3,F2,F1,U9,U8,U7,U6,U5,U4,U3,U2,U1,R9,R8,R7,R6,R5,R4,R3,R2,R1,B9,B8,B7,B6,B5,B4,B3,B2,B1],
    //     S_U4:   [U3,U6,U9,U2,U5,U8,U1,U4,U7,F1,F2,F3,F4,F5,F6,F7,F8,F9,L1,L2,L3,L4,L5,L6,L7,L8,L9,D7,D4,D1,D8,D5,D2,D9,D6,D3,B1,B2,B3,B4,B5,B6,B7,B8,B9,R1,R2,R3,R4,R5,R6,R7,R8,R9],
    //     S_LR2:  [U3,U2,U1,U6,U5,U4,U9,U8,U7,L3,L2,L1,L6,L5,L4,L9,L8,L7,F3,F2,F1,F6,F5,F4,F9,F8,F7,D3,D2,D1,D6,D5,D4,D9,D8,D7,R3,R2,R1,R6,R5,R4,R9,R8,R7,B3,B2,B1,B6,B5,B4,B9,B8,B7]
    // },
    init: function(){
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

        this.edge = null;
        this.corner = null;
        this.face = null;
    }
};


// ----移动表----
/**
 * 一阶段:
 * 1. 角块方向移动表;
 * 2. 棱块方向移动表;
 * 3. 中间层棱块位置移动表.
 * 二阶段:
 * 
 */
/**
 * 角块朝向移动表
 * 对于V8引擎, Number小于32位的整数为小整数, 会使用32位进行存储
 */
const CornerOrientationMoveTable = {
    table: [],
    init: function(){
        let cubieCube = new CubieCube();
        for(let coordinate = 0; coordinate < 2187; coordinate++){
            cubieCube.setCornersByCornerOrientationCoordinate(coordinate);
            let odd = coordinate & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 12;
                moveEntries = this.table[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.table.push(moveEntries);
            }
            let j = 0;
            for(let move = U; move <= B; move++){
                for(let i = 0; i < 3; i++){
                    cubieCube.cornerMult(CornerCubieMove[move]);
                    let oc = cubieCube.getCornerOrientationCoordinate();
                    moveEntries[j] = moveEntries[j] | (oc << offset);
                    j++;
                }
                cubieCube.cornerMult(CornerCubieMove[move]);
            }
        }
    },
    applyMove: function(coordinate, move, moveI){
        let moveEntries = this.table[coordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((coordinate & 1) ? 12 : 0)) & 0xFFF;
    }
}

// UD中间层棱块位置(FR, FL, BL, BR)
const UDSlice = {
    getUDSliceCoordinate: function(cubie /* CubieCube */){
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
    invUDSliceCoordinate: function(cubie /* CubieCube */, coordinate){
        let k = 3, n = 11;
        let v = 0;
        let used = new Array(12);
        while(k >= 0){
            v = C(n, k);
            if(coordinate < v){
                k--;
                used[n] = true;
            }else{
                coordinate -= v;
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
    }
};

// 棱块朝向+中间层棱块位置(对称坐标)(FlipUDSliceCoordinate = UDSliceCoordinate * 2048 + EdgeOrientationCoordinate)
const FlipUDSlice = {
    moveTable: [],
    classIndexToRepresentantArray: null,
    init: function(){
        this.initClassIndexToRepresentantArray();
        this.initMoveTable();
    },
    initClassIndexToRepresentantArray: function(){
        let len = 31680; //495 * 2048 / 32;
        let used = new Array(len).fill(0);
        let cubie = new CubieCube();
        let cubieP = new CubieCube();
        this.classIndexToRepresentantArray = [];
        /**
         * 一个对称坐标对应多个原始坐标, 这里通过原始坐标转换为对称坐标, 然后按自然顺序存储到数组中
         */
        let symResult = [{},{},{},{},{},{},{},{},{},{},{},{}];
        for(let ud = 0; ud < 495; ud++){
            UDSlice.invUDSliceCoordinate(cubie, ud);
            for(let e = 0; e < 64; e++){ // 64 = 2048 / 32
                let byteOffset = ud << 6 | e;
                for(let k = 0; k < 32; k++){
                    if((used[byteOffset] & (1 << k)) == 0){ // 说明这个原始坐标在之前的等价类中没有出现过
                        this.classIndexToRepresentantArray.push(byteOffset << 5 | k);
                        cubie.setEdgesByEdgeOrientationCoordinate(e << 5 | k);
                        for(let s = 0; s < 16; s++){ // 计算该等价类中的所有元素, 并将其位置标记为占用
                            edgeMultiply(Symmetries.edgeSymmetries[Symmetries.invIdx[s]], cubie.edges, symResult);
                            edgeMultiply(symResult, Symmetries.edgeSymmetries[s], cubieP.edges);
                            let rawCoordinate = this.getRawCoordinate(cubieP);
                            used[rawCoordinate >> 5] = used[rawCoordinate >> 5] | (1 << (rawCoordinate & 31));
                        }
                    }
                }
            }
        }
    },
    initMoveTable: function(){
        let cubie = new CubieCube();
        for(let coordinate = 0; coordinate < 64430; coordinate++){ // 共有64430个等价类
            let n = this.classIndexToRepresentantArray[coordinate]; // 获取代表元的原始坐标
            UDSlice.invUDSliceCoordinate(cubie, Math.floor(n >> 11));
            cubie.setEdgesByEdgeOrientationCoordinate(n & 2047);

            let odd = coordinate & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 16;
                moveEntries = this.moveTable[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.moveTable.push(moveEntries);
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
    applyMove: function(coordinate, move, moveI){
        let moveEntries = this.table[coordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((coordinate & 1) ? 16 : 0)) & 0xFFFF;
    },
    getClassIndexByRawCoordinate: function(rawCoordinate){  // 二分查找
        if(rawCoordinate <= this.classIndexToRepresentantArray[64429]){
            let l = 0, r = 64429, mid = -1;
            while(l <= r){
                mid = (l + r) >> 1;
                let c = this.classIndexToRepresentantArray[mid];
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
    },
    getRawCoordinate: function(cubie /* CubieCube */){
        return (UDSlice.getUDSliceCoordinate(cubie) << 11) | cubie.getEdgeOrientationCoordinate();
    },
    getSymCoordinate: function(cubie /* CubieCube */){
        // 原始坐标转对称坐标
        let result = [{},{},{},{},{},{},{},{},{},{},{},{}];
        let prodCubie = new CubieCube();
        let trace = [];
        for(let i = 0; i < 16; i++){
            edgeMultiply(Symmetries.edgeSymmetries[i], cubie.edges, result);
            edgeMultiply(result, Symmetries.edgeSymmetries[Symmetries.invIdx[i]], prodCubie.edges);
            let rawCoordinate = this.getRawCoordinate(prodCubie);
            trace.push(rawCoordinate);
            let clzIndex = this.getClassIndexByRawCoordinate(rawCoordinate);
            if(clzIndex != -1){
                return clzIndex << 4 | i;
            }
        }
        console.error("no sym coordinate find");
        return -1;
    }
}

// 棱块朝向移动表
const EdgeOrientationMove = {
    table: [],
    init: function(){
        let cubieCube = new CubieCube();
        for(let coordinate = 0; coordinate < 2048; coordinate++){
            cubieCube.setEdgesByEdgeOrientationCoordinate(coordinate);
            let odd = coordinate & 1;
            let offset = 0;
            let moveEntries;
            if(odd){
                offset = 11;
                moveEntries = this.table[coordinate >> 1];
            }else{
                moveEntries = new Array(18).fill(0);
                this.table.push(moveEntries);
            }

            let j = 0;
            for(let move = U; move <= B; move++){
                for(let i = 0; i < 3; i++){
                    cubieCube.edgeMult(EdgeCubieMove[move]);
                    let oc = cubieCube.getEdgeOrientationCoordinate();
                    moveEntries[j] = moveEntries[j] | (oc << offset);
                    j++;
                }
                cubieCube.edgeMult(EdgeCubieMove[move]);
            }
        }
    },
    applyMove: function(coordinate, move, moveI){
        let moveEntries = this.table[coordinate >> 1];
        return (moveEntries[move * 3 + moveI] >> ((coordinate & 1) ? 11 : 0)) & 0x7FF;
    }
}

// 角块对称移动表, 记录一个对称在某个移动下的共轭
const CornerSymMove = {
    table: [],
    init: function(){
        let result = [{}, {}, {}, {}, {}, {}, {}, {}];
        let c1 = [{}, {}, {}, {}, {}, {}, {}, {}];
        for(let i = U; i <= B; i++){
            cornerMoveMultiple(c1, CornerCubieMove[i], result);
            console.log(result);
        }
    }
};

function init(){
    CornerOrientationMoveTable.init();
    Symmetries.init();
    FlipUDSlice.init();
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
    console.log(cubie);
    // let dist = getPhase1MinStepLowerBound(cube);
    // let cornerOrientation = getCornerOrientation(cube);
    // let edgeOrientation = getEdgeOrientation(cube);
    // let udSliceSorted = getUDSliceSorted(cube);
    
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
        [cube[D2], cube[F2]],
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
        cubie.edges[i].e = FaceletToEdge[firstFace][centerMap.get(edge[1])];
        if(firstFace == R || firstFace == L){
            cubie.edges[i].o = 1;
        }else{
            cubie.edges[i].o = 0;
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

// 获取阶段1最小步下界
function getPhase1MinStepLowerBound(cube){
    return 10;
}

export function debug(cube){
    init();
    solve(cube);
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