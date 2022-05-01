const U1 = 0, U2 = 1, U3 = 2, U4 = 3, U5 = 4, U6 = 5, U7 = 6, U8 = 7, U9 = 8,
R1 = 9, R2 = 10, R3 = 11, R4 = 12, R5 = 13, R6 = 14, R7 = 15, R8 = 16, R9 = 17,
F1 = 18, F2 = 19, F3 = 20, F4 = 21, F5 = 22, F6 = 23, F7 = 24, F8 = 25, F9 = 26,
D1 = 27, D2 = 28, D3 = 29, D4 = 30, D5 = 31, D6 = 32, D7 = 33, D8 = 34, D9 = 35,
L1 = 36, L2 = 37, L3 = 38, L4 = 39, L5 = 40, L6 = 41, L7 = 42, L8 = 43, L9 = 44,
B1 = 45, B2 = 46, B3 = 47, B4 = 48, B5 = 49, B6 = 50, B7 = 51, B8 = 52, B9 = 53;

const URF = 0, UFL = 1, ULB = 2, UBR = 3, DFR = 4, DLF = 5, DBL = 6, DRB = 7;

const UR = 0, UF = 1, UL = 2, UB = 3, DR = 4, DF = 5, DL = 6, DB = 7, FR = 8, FL = 9, BL = 10, BR = 11;

// 面移动 -- 移动表示法
const faceMove = {
    U: [U3,U6,U9,U2,U5,U8,U1,U4,U7,F1,F2,F3,R4,R5,R6,R7,R8,R9,L1,L2,L3,F4,F5,F6,F7,F8,F9,D1,D2,D3,D4,D5,D6,D7,D8,D9,B1,B2,B3,L4,L5,L6,L7,L8,L9,R1,R2,R3,B4,B5,B6,B7,B8,B9],
    R: [U1,U2,B7,U4,U5,B4,U7,U8,B1,R3,R6,R9,R2,R5,R8,R1,R4,R7,F1,F2,U3,F4,F5,U6,F7,F8,U9,D1,D2,F3,D4,D5,F6,D7,D8,F9,L1,L2,L3,L4,L5,L6,L7,L8,L9,D9,B2,B3,D6,B5,B6,D3,B8,B9],
    F: [U1,U2,U3,U4,U5,U6,R1,R4,R7,D3,R2,R3,D2,R5,R6,D1,R8,R9,F3,F6,F9,F2,F5,F8,F1,F4,F7,L3,L6,L9,D4,D5,D6,D7,D8,D9,L1,L2,U9,L4,L5,U8,L7,L8,U7,B1,B2,B3,B4,B5,B6,B7,B8,B9],
    D: [U1,U2,U3,U4,U5,U6,U7,U8,U9,R1,R2,R3,R4,R5,R6,B7,B8,B9,F1,F2,F3,F4,F5,F6,R7,R8,R9,D3,D6,D9,D2,D5,D8,D1,D4,D7,L1,L2,L3,L4,L5,L6,F7,F8,F9,B1,B2,B3,B4,B5,B6,L7,L8,L9],
    L: [F1,U2,U3,F4,U5,U6,F7,U8,U9,R1,R2,R3,R4,R5,R6,R7,R8,R9,D1,F2,F3,D4,F5,F6,D7,F8,F9,B9,D2,D3,B6,D5,D6,B3,D8,D9,L3,L6,L9,L2,L5,L8,L1,L4,L7,B1,B2,U7,B4,B5,U4,B7,B8,U1],
    B: [L7,L4,L1,U4,U5,U6,U7,U8,U9,R1,R2,U1,R4,R5,U2,R7,R8,U3,F1,F2,F3,F4,F5,F6,F7,F8,F9,D1,D2,D3,D4,D5,D6,R9,R6,R3,D7,L2,L3,D8,L5,L6,D9,L8,L9,B3,B6,B9,B2,B5,B8,B1,B4,B7]
};

/**
 * 面对称
 * 
 */
const faceSymmetry = {
    S_URF3: [R9,R8,R7,R6,R5,R4,R3,R2,R1,F3,F6,F9,F2,F5,F8,F1,F4,F7,U3,U6,U9,U2,U5,U8,U1,U4,U7,L1,L2,L3,L4,L5,L6,L7,L8,L9,B7,B4,B1,B8,B5,B2,B9,B6,B3,D3,D6,D9,D2,D5,D8,D1,D4,D7],
    S_F2: [D9,D8,D7,D6,D5,D4,D3,D2,D1,L9,L8,L7,L6,L5,L4,L3,L2,L1,F9,F8,F7,F6,F5,F4,F3,F2,F1,U9,U8,U7,U6,U5,U4,U3,U2,U1,R9,R8,R7,R6,R5,R4,R3,R2,R1,B9,B8,B7,B6,B5,B4,B3,B2,B1],
    S_U4: [U3,U6,U9,U2,U5,U8,U1,U4,U7,F1,F2,F3,F4,F5,F6,F7,F8,F9,L1,L2,L3,L4,L5,L6,L7,L8,L9,D7,D4,D1,D8,D5,D2,D9,D6,D3,B1,B2,B3,B4,B5,B6,B7,B8,B9,R1,R2,R3,R4,R5,R6,R7,R8,R9],
    S_LR2: [U3,U2,U1,U6,U5,U4,U9,U8,U7,L3,L2,L1,L6,L5,L4,L9,L8,L7,F3,F2,F1,F6,F5,F4,F9,F8,F7,D3,D2,D1,D6,D5,D4,D9,D8,D7,R3,R2,R1,R6,R5,R4,R9,R8,R7,B3,B2,B1,B6,B5,B4,B9,B8,B7]
};

function faceMoveMultiple(a, b){
    let result = new Array(54).fill(-1);
    for(let i = 0; i < 54; i++){
        result[b[i]] = a[i];
    }
    return result;
}

/*
 * 移动时, 角块变化
 * 替换表示法, 基本位置依次为: URL,UFL,ULB,UBR,DFR,DLF,DBL,DRB
 * c(corner)表示要移动到当前位置的块
 * o(orientation)表示移动后, 块的朝向
 * 移动的公式:
 * 1. (A*B)(x).c = A(B(x).c).c
 * 2. (A*B)(x).o = A(B(x).c).o + B(x).o
 */
const cornerCubieMove = {
    U: [{c:UBR,o:0},{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0}],
    R: [{c:DFR,o:2},{c:UFL,o:0},{c:ULB,o:0},{c:URF,o:1},{c:DRB,o:1},{c:DLF,o:0},{c:DBL,o:0},{c:UBR,o:2}],
    F: [{c:UFL,o:1},{c:DLF,o:2},{c:ULB,o:0},{c:UBR,o:0},{c:URF,o:2},{c:DFR,o:1},{c:DBL,o:0},{c:DRB,o:0}],
    D: [{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:UBR,o:0},{c:DLF,o:0},{c:DBL,o:0},{c:DRB,o:0},{c:DFR,o:0}],
    L: [{c:URF,o:0},{c:ULB,o:1},{c:DBL,o:2},{c:UBR,o:0},{c:DFR,o:0},{c:UFL,o:2},{c:DLF,o:1},{c:DRB,o:0}],
    B: [{c:URF,o:0},{c:UFL,o:0},{c:UBR,o:1},{c:DRB,o:2},{c:DFR,o:0},{c:DLF,o:0},{c:ULB,o:2},{c:DBL,o:1}]
};

/**
 * 角块对称
 */
const cornerCubieSymmetry = {
    S_URF3: [{c:URF,o:1},{c:DFR,o:2},{c:DLF,o:1},{c:UFL,o:2},{c:UBR,o:2},{c:DRB,o:1},{c:DBL,o:2},{c:ULB,o:1}],
    S_F2: [{c:DLF,o:0},{c:DFR,o:0},{c:DRB,o:0},{c:DBL,o:0},{c:UFL,o:0},{c:URF,o:0},{c:UBR,o:0},{c:ULB,o:0}],
    S_U4: [{c:UBR,o:0},{c:URF,o:0},{c:UFL,o:0},{c:ULB,o:0},{c:DRB,o:0},{c:DFR,o:0},{c:DLF,o:0},{c:DBL,o:0}],
    S_LR: [{c:UFL,o:3},{c:URF,o:3},{c:UBR,o:3},{c:ULB,o:3},{c:DLF,o:3},{c:DFR,o:3},{c:DRB,o:3},{c:DBL,o:3}]
};

/*
 * 移动时, 棱块变化
 * 替换表示法, 基本位置按顺序依次是UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR
 * e(edge)表示要东到当前位置的块
 * o(orientation)表示移动后, 块的朝向
 * oA
 * 移动的公式:
 * 1. (A*B)(x).e = A(B(x).e).e
 * 2. (A*B)(x).o = A(B(x).e).o + B(x).o
 */
const edgeCubieMove = {
    U: [{e:UB,o:0,oA:1},{e:UR,o:0,oA:1},{e:UF,o:0,oA:1},{e:UL,o:0,oA:1},{e:DR,o:0,oA:0},{e:DF,o:0,oA:0},{e:DL,o:0,oA:0},{e:DB,o:0,oA:0},{e:FR,o:0,oA:0},{e:FL,o:0,oA:0},{e:BL,o:0,oA:0},{e:BR,o:0,oA:0}],
    R: [{e:FR,o:0,oA:1},{e:UF,o:0,oA:0},{e:UL,o:0,oA:0},{e:UB,o:0,oA:0},{e:BR,o:0,oA:1},{e:DF,o:0,oA:0},{e:DL,o:0,oA:0},{e:DB,o:0,oA:0},{e:DR,o:0,oA:1},{e:FL,o:0,oA:0},{e:BL,o:0,oA:0},{e:UR,o:0,oA:1}],
    F: [{e:UR,o:0,oA:0},{e:FL,o:1,oA:1},{e:UL,o:0,oA:0},{e:UB,o:0,oA:0},{e:DR,o:0,oA:0},{e:FR,o:1,oA:1},{e:DL,o:0,oA:0},{e:DB,o:0,oA:0},{e:UF,o:1,oA:1},{e:DF,o:1,oA:1},{e:BL,o:0,oA:0},{e:BR,o:0,oA:0}],
    D: [{e:UR,o:0,oA:0},{e:UF,o:0,oA:0},{e:UL,o:0,oA:0},{e:UB,o:0,oA:0},{e:DF,o:0,oA:1},{e:DL,o:0,oA:1},{e:DB,o:0,oA:1},{e:DR,o:0,oA:1},{e:FR,o:0,oA:0},{e:FL,o:0,oA:0},{e:BL,o:0,oA:0},{e:BR,o:0,oA:0}],
    L: [{e:UR,o:0,oA:0},{e:UF,o:0,oA:0},{e:BL,o:0,oA:1},{e:UB,o:0,oA:0},{e:DR,o:0,oA:0},{e:DF,o:0,oA:0},{e:FL,o:0,oA:1},{e:DB,o:0,oA:0},{e:FR,o:0,oA:0},{e:UL,o:0,oA:1},{e:DL,o:0,oA:1},{e:BR,o:0,oA:0}],
    B: [{e:UR,o:0,oA:0},{e:UF,o:0,oA:0},{e:UL,o:0,oA:0},{e:BR,o:1,oA:1},{e:DR,o:0,oA:0},{e:DF,o:0,oA:0},{e:DL,o:0,oA:0},{e:BL,o:1,oA:1},{e:FR,o:0,oA:0},{e:FL,o:0,oA:0},{e:UB,o:1,oA:1},{e:DB,o:1,oA:1}]
};

/**
 * 棱块对称
 */
const edgeCubieSymmetry = {
    S_URF3: [{e:UF,o:1,oA:0},{e:FR,o:0,oA:0},{e:DF,o:1,oA:0},{e:FL,o:0,oA:0},{e:UB,o:1,oA:0},{e:BR,o:0,oA:0},{e:DB,o:1,oA:0},{e:BL,o:0,oA:0},{e:UR,o:1,oA:0},{e:DR,o:1,oA:0},{e:DL,o:1,oA:0},{e:UL,o:1,oA:0}],
    S_F2: [{e:DL,o:0,oA:0},{e:DF,o:0,oA:0},{e:DR,o:0,oA:0},{e:DB,o:0,oA:0},{e:UL,o:0,oA:0},{e:UF,o:0,oA:0},{e:UR,o:0,oA:0},{e:UB,o:0,oA:0},{e:FL,o:0,oA:0},{e:FR,o:0,oA:0},{e:BR,o:0,oA:0},{e:BL,o:0,oA:0}],
    S_U4: [{e:UB,o:0,oA:1},{e:UR,o:0,oA:1},{e:UF,o:0,oA:1},{e:UL,o:0,oA:1},{e:DB,o:0,oA:1},{e:DR,o:0,oA:1},{e:DF,o:0,oA:1},{e:DL,o:0,oA:1},{e:BR,o:1,oA:1},{e:FR,o:1,oA:1},{e:FL,o:1,oA:1},{e:BL,o:1,oA:1}],
    S_LR2: [{e:UL,o:0,oA:0},{e:UF,o:0,oA:0},{e:UR,o:0,oA:0},{e:UB,o:0,oA:0},{e:DL,o:0,oA:0},{e:DF,o:0,oA:0},{e:DR,o:0,oA:0},{e:DB,o:0,oA:0},{e:FL,o:0,oA:0},{e:FR,o:0,oA:0},{e:BR,o:0,oA:0},{e:BL,o:0,oA:0}]
};

function edgeMoveMultiple(a, b){
    let result = [];
    for(let i = 0; i < 12; i++){
        result.push({
            e: a[b[i].e].e,
            o: a[b[i].e].o + b[i].o
        });
    }
    return result;
}

function cornerMoveMultiple(a, b){
    let result = [];
    for(let i = 0; i < 8; i++){
        result.push({
            c: a[b[i].c].c,
            o: a[b[i].c].o + b[i].o
        });
    }
    return result;
}

/**
 * 角块朝向坐标
 * input: cornerCubieMove类似结构
 * 值域: [0, 3^7-1]
 */
export function getCornerOrientationCoordinate(cornerInfo){
    let result = 0;
    for(let i = 0; i < 7; i++){ // 最后一个不用计算, 前7个确定之后, 最后一个也就确定了
        result = 3 * result + cornerInfo[i].o;
    }
    return result;
}

/**
 * 棱块朝向坐标 
 * input: edgeCubieMove类似结构
 * 值域: [0, 2^11-1]
 */
function getEdgeOrientationCoordinate(edgeInfo){
    let result = 0;
    for(let i = 0; i < 11; i++){    // 最后一个不用计算, 前面11个确定之后, 最后一个也就确定了 
        result = 2 * result + edgeInfo[i].o;
    }
    return result;
}

/**
 * 角块置换坐标
 * input: cornerCubieMove类似结构
 * 值域: [0, 8! - 1]
 */
export function getCornerPermtationCoordinate(cornerInfo){
    let result = 0;
    for(let i = 7; i > 0; i--){
        let c = cornerInfo[i].c;
        let order = 0;
        for(let j = i - 1; j >= 0; j--){
            if(c < cornerInfo[j].c){
                order++;
            }
        }
        result = (order + result) * i; 
    }
    return result;
}

/**
 * 棱块置换坐标
 * input: edgeCubieMove类似结构
 * 值域: [0, 12! - 1]
 */
function getEdgePermtationCoordinate(edgeInfo){
    let result = 0;
    for(let i = 11; i > 0; i--){
        let e = edgeInfo.e;
        let order = 0;
        for(let j = i - 1; j >= 0; j--){
            if(e < edgeInfo[j].c){
                order++;
            }
        }
        result = (order + result) * i;
    }
    return result;
}