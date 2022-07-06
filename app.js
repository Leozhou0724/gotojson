const input = document.querySelector("#gocodes");
const form = document.querySelector(".input-form");
const output = document.querySelector("#output");

String.prototype.trim = function (char, type) {
    if (char) {
      if (type == 'left') {
        return this.replace(new RegExp('^\\'+char+'+', 'g'), '');
      } else if (type == 'right') {
        return this.replace(new RegExp('\\'+char+'+$', 'g'), '');
      }
      return this.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
}

let text = input.value;
input.addEventListener("input", (e) => {
    text = e.target.value;
});
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let lines = parseLines(text)
    let structsLines=parseStructLines(lines)
    structsMap={}
    structs=[]
    console.log(structsLines)
    structsLines.forEach(function(structLines){
        struct=parseStruct(structLines)
        structsMap[struct.name]=struct
        structs.push(struct)
    })
    jsons=[]
    console.log(structs)
    structs.forEach(function(struct){
        if (structsMap[struct.name].used!=undefined){
            return 
        }
        json=structToJson(struct,structsMap)
        jsons.push(json)
    })
    let show=""
    jsons.forEach(function(json){
        show=JSON.stringify(json,null,2)+"\n"
    })
    output.innerHTML=show
});

function structToJson(struct,structsMap){
    let json=JSON.parse("{}")
    struct.params.forEach(function(param){
        json[param.name]=genValue(param.type,structsMap)
    })
    return json
}

function genValue(type,structsMap){
    if( type.includes("[]")){
        return genArray(type,structsMap)
    }
    if(type.includes("int")){
        return 123
    } 
    if(type.includes("float")){
        return 12.3
    }
    if( type.includes("string")){
        return "hi"
    }
    if( type.includes("bool")){
        return false
    }
    if (structsMap[type]==undefined){
        return {}
    }
    structsMap[type]["used"]=true
    inside=structToJson(structsMap[type],structsMap)
    return inside
}


function genArray(type,structsMap){
    type=type.trim("[]")
    type=type.trim("*")
    if(type.includes("int")){
        return [1]
    } 
    if(type.includes("float")){
        return [1.1]
    }
    if( type.includes("string")){
        return ["hi"]
    }
    if( type.includes("bool")){
        return [false]
    }
    if (structsMap[type]==undefined){
        return [{}]
    }
    structsMap[type]["used"]=true
    inside=structToJson(structsMap[type],structsMap)
    return [inside]
}

function neww(v){
    return JSON.parse(JSON.stringify(v));
}

function parseStruct(structLines){
    defaultStruct={
        "name":"",
        "params":[],
    }
    ori=JSON.stringify(defaultStruct)
    struct=JSON.parse(ori)
    struct.name =parseStructName(structLines.start)
    structLines.params.forEach(function(paramLine){
        param=parseParamLine(paramLine)
        if (!param){
            return 
        }
        struct.params.push(neww(param))
    })
    return struct
}

function parseStructName(line){
    line=line.trim()
    line=line.trim("{")
    line=line.trim()
    elems=line.split(" ")
    items=[]
    elems.forEach(function(elem){
        if (elem.trim()!=""){
            items.push(elem.trim())
        }
    })
    return items[1]
}

function parseParamLine(line){
    elems=line.split(" ")
    var items=[]
    elems.forEach(function(elem){
        trimedElem=elem.trim()
        if (trimedElem==""){
            return
        }
        items.push(trimedElem)
    })
    let jsonTag=""
    if (items.length>=3){
        jsonTag=getJsonTag(items[items.length-1])
    }
    param={
        "name":jsonTag,
        "type":items[1].trim("*"),
    }
    if (jsonTag=="-"){
        return null
    }
    if (jsonTag==""){
        param.name=underline(items[0])
    }
    return param
}

function underline(str){
    return str.replace(/\B([A-Z])/g, '_$1').toLowerCase()
}  

function getJsonTag(line){
    const jsonTagIgnore='json:"-"'
    const jsonPrefix='json:"'
    if (line.includes(jsonTagIgnore)){
        return "-"
    }
    if (line.includes(jsonPrefix)){
        leftIndex=line.indexOf(jsonPrefix)
        line=line.slice(leftIndex+jsonPrefix.length)
        rightIndex=line.indexOf(",")
        line=line.slice(0,rightIndex)
        return line
    }
    return ""
}

function parseStructLines(lines){
    var structs=[]
    var empty={
        "start":"",
        "params":[],
        "end":""
    }
    ori=JSON.stringify(empty)
    var struct=JSON.parse(ori)
    lines.forEach(function(line){
        lineType=checkLineType(line)
        if (lineType==lineTypeStructStart){
            struct=JSON.parse(ori)
            struct.start=line
        }
        if (lineType==lineTypeStructParam){
            struct.params.push(line)
        }
        if (lineType==lineTypeStructEnd){
            struct.end=line
            structs.push(JSON.parse(JSON.stringify(struct)))
            struct=JSON.parse(ori)
        }
    });
    return structs
}

function parseLines(text){  
    let lines = text.split("\n")
    return lines
}

const lineTypeUnknow= 0
const lineTypeStructStart = 1
const lineTypeStructParam = 2
const lineTypeStructEnd = 3

function checkLineType(line){
    if (line.includes("{")){
        return lineTypeStructStart
    }
    if (line.includes("}")){
        return lineTypeStructEnd
    }
    if (line.trim()!=""){
        return lineTypeStructParam
    }
    return lineTypeUnknow
}