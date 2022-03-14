const zh = {
    "rebase": "变基",
    "reset": "重置",
    "home": "归位",
    "run": "运行",
    "color.edit.tip":"按'ctrl'多选"
};

const en = {
    "rebase": "rebase",
    "reset": "reset",
    "home": "home",
    "run": "run",
    "color.edit.tip":"press 'ctrl' to multi-select"
};

export function translate(key, lang){
    if(lang == 'zh'){
        return zh[key];
    }else{
        return en[key];
    }
}