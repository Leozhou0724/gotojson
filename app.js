const input = document.querySelector("#gocodes");
const form = document.querySelector(".input-form");

let text = "";
input.addEventListener("input", (e) => {
    text = e.target.value;
});
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let lines = parseLines(text)
    let structs=parseStructs(lines)
    console.log(structs)
});

function structToJson(struct){
    
}

function parseStructs(lines){
    var structs=[]
    var empty={
        "start":"",
        "params":[],
        "end":""
    }
    var struct=empty
    lines.forEach(function(line){
        lineType=checkLineType(line)
        if (lineType==lineTypeStructStart){
            struct=empty
            struct.start=line
        }
        if (lineType==lineTypeStructParam){
            struct.params.push(line)
        }
        if (lineType==lineTypeStructEnd){
            struct.end=line
            structs.push(struct)
            struct=empty
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