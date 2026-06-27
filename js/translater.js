(function(){
const zh = {
    "rebase": "变基",
    "reset": "重置",
    "home": "视角归位",
    "run": "运行",
    "scramble":"打乱",
    "solve": "还原",
    "two-phase": "两阶段算法",
    "not-exec": "不执行",
    "basic-scramble": "基础"
};

const en = {
    "rebase": "rebase",
    "reset": "reset",
    "home": "perspective restored",
    "run": "run",
    "scramble": "scramble",
    "solve": "solve",
    "two-phase": "Two-Phase Algorithm",
    "not-exec":"not execute",
    "basic-scramble": "basic"
};

function translateText(key, lang){
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

window.trans = { translate: translateText };

})();
