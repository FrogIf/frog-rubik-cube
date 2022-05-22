const zh = {
    "rebase": "变基",
    "reset": "重置",
    "home": "归位",
    "run": "运行",
    "color.edit.tip":"按'ctrl'多选",
    "scramble":"打乱",
    "solve": "还原",
    "two-phase": "两阶段算法",
    "not-exec": "不执行",
    "basic-scramble": "基础"
};

const en = {
    "rebase": "rebase",
    "reset": "reset",
    "home": "home",
    "run": "run",
    "color.edit.tip":"press 'ctrl' to multi-select",
    "scramble": "scramble",
    "solve": "solve",
    "two-phase": "Two-Phase Algorithm",
    "not-exec":"not execute",
    "basic-scramble": "basic"
};

export function translate(key, lang){
    let t;
    if(lang == 'zh'){
        t = zh[key];
    }else{
        t = en[key];
    }
    if(!t){
        t = key;
    }
    return t;
}