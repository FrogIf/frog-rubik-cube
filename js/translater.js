const zh = {
    "rebase": "变基",
    "reset": "重置",
    "home": "归位",
    "run": "运行"
};

const en = {
    "rebase": "rebase",
    "reset": "reset",
    "home": "home",
    "run": "run"
};

export function translate(key, lang){
    if(lang == 'zh'){
        return zh[key];
    }else{
        return en[key];
    }
}