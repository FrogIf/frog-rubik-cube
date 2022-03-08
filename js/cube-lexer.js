const commands = {
    "R": ["R", "R_", "R2"], 
    "U": ["U", "U_", "U2"], 
    "F": ["F", "F_", "F2"], 
    "D": ["D", "D_", "D2"], 
    "L": ["L", "L_", "L2"], 
    "B":["B", "B_", "B2"],
    "E":["E", "E_", "E2"],
    "M":["M", "M_", "M2"],
    "S":["S", "S_", "S2"],
    "r":["r", "r_", "r2"], 
    "u":["u", "u_", "u2"],
    "f":["f", "f_", "f2"],
    "l":["l", "l_", "l2"],
    "d":["d", "d_", "d2"],
    "b":["b", "b_", "b2"],
    "x":["x", "x_", "x2"],
    "y":["y", "y_", "y2"],
    "z":["z", "z_", "z2"]
};

export function parse(commandStr, exceptionCallback){
    if(commandStr == null || commandStr.length == 0){
        return [];
    }
    commandStr = commandStr.replace(/'/g, "_");
    let actions = [];
    for(let i = 0, len = commandStr.length; i < len; ){
        let c = commandStr[i];
        if(isWhitespace(c)){ i++; continue; }
        let cmdSet = commands[c];
        let match = false;
        if(!cmdSet){
            reportException(exceptionCallback, cmdSet);
            return;
        }else{
            match = cmdSet.indexOf(c) >= 0;
            while(i < len){
                i++;
                let n = commandStr[i];
                if(isWhitespace(n)){
                    break;
                }
                let cm = c + n;
                if(cmdSet.indexOf(cm) < 0){
                    break;
                }else{
                    match = true;
                }
                c = c + n;
            }
            if(match){
                actions.push(c);
            }else{
                reportException(exceptionCallback, c);
                return;
            }
        }
    }
    return actions;
}

function reportException(exceptionCallback, cmd){
    if(exceptionCallback){
        exceptionCallback("unrecognized command " + cmd);
    }else{
        console.warn("unrecognized command " + cmd)
    }
}

function isWhitespace(c){
    return c == ' ' || c == '\n' || c == '\r' || c == '\t';
}