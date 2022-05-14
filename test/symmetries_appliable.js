/**
 * kociemba two phase算法, 对称对各种坐标的适用性验证, 这里仅验证角块朝向坐标和棱块朝向坐标:
 * 依据: S(i)^-1 * H * S(i) = H 如果满足这个公式, 说明就是可以应用对称的.
 */

export function test(){
    Symmetries.init();
    testCornerOrientation();
    testEdgeOrientation();
}

function testCornerOrientation(){
    console.log("test corner orientation start...");
    let cubie = new CubieCube();
    let result = [{}, {}, {}, {}, {}, {}, {}, {}];
    let process = 1;
    for(let c = 0; c < 40320; c++){ // 8! = 40320
        cubie.setCornerByCornerPermtationCoordinate(c);
        if(c != cubie.getCornerPermtationCoordinate()){
            console.log("error", c, cubie.getCornerPermtationCoordinate());
            return;
        }
        if(c / 403 == process){ 
            console.log("process --> " + process + "%"); 
            process++;
        }
        let cubieProd = new CubieCube();
        for(let i = 0; i < 16; i++){
            cornerMultiply(Symmetries.cornerSymmetries[Symmetries.invIdx[i]], cubie.corners, result);
            cornerMultiply(result, Symmetries.cornerSymmetries[i], cubieProd.corners);
            let c = cubieProd.getCornerOrientationCoordinate();
            if(c != 0){
                console.log("find", c, cubie, cubieProd);
                return;
            }
        }
    }
    console.log("check finish.");
}

function testEdgeOrientation(){
    console.log("test edge orientation start...");
    let cubie = new CubieCube();
    let result = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    let process = 1;
    for(let i = 0; i < 479001600; i++){ // 12! = 479001600
        cubie.setEdgePermuationCoordinate(i);
        if(i != cubie.getEdgePermtationCoordinate()){
            console.log("error", i, cubie.getEdgePermtationCoordinate());
            return;
        }
        if(i / 4790016 == process){ 
            console.log("process --> " + process + "%"); 
            process++;
        }
        let cubieProd = new CubieCube();
        for(let i = 0; i < 16; i++){
            edgeMultiply(Symmetries.edgeSymmetries[Symmetries.invIdx[i]], cubie.edges, result);
            edgeMultiply(result, Symmetries.edgeSymmetries[i], cubieProd.edges);
            let c = cubieProd.getEdgeOrientationCoordinate();
            if(c != 0){
                console.log("find", c, cubie, cubieProd, Symmetries.edgeSymmetries[i], i);
                return;
            }
        }
    }
    console.log("check finish.");
}

// 角块
const URF = 0, UFL = 1, ULB = 2, UBR = 3, DFR = 4, DLF = 5, DBL = 6, DRB = 7;
// 棱块
const UR = 0, UF = 1, UL = 2, UB = 3, DR = 4, DF = 5, DL = 6, DB = 7, FR = 8, FL = 9, BL = 10, BR = 11;

function cornerMultiply(a, b, result){
    let ori, oriA, oriB;
    for(let i = 0; i < 8; i++){
        result[i].c = a[b[i].c].c;
        oriA = a[b[i].c].o;
        oriB = b[i].o;
        if(oriA == 6 || oriB == 6){ // 非法朝向
            ori = 6;
            console.log("illegal ori");
        }else if(oriA < 3 && oriB < 3){
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
        result[i].o = (a[b[i].e].o + b[i].o) % 2;
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

    getCornerOrientationCoordinate(){
        let result = 0;
        for(let i = 0; i < 7; i++){ // 最后一个不用计算, 前7个确定之后, 最后一个也就确定了
            result = 3 * result + this.corners[i].o;
        }
        return result;
    }

    getEdgeOrientationCoordinate(){
        let result = 0;
        for(let i = 0; i < 11; i++){    // 最后一个不用计算, 前面11个确定之后, 最后一个也就确定了 
            result = 2 * result + this.edges[i].o;
        }
        return result;
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

    setEdgePermuationCoordinate(coordinate){
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
}