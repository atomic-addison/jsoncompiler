const dash = require('dashargs');
const fs = require('fs');

var command = process.argv.splice(2, process.argv.length).join(" ");
const args = dash.parse(command);

if (!args.f && !args.file) {
	console.log("Please specify a file you want to compile using -f path/to/file.json");
	return;
}

const outputFile = args.o || args.output || './compiled.js';
var jsDoc = "";
var imports = [];

function prepareVariables(list, callback){
	var variable = list.shift();

    jsDoc += `${variable.type || 'var'} ${variable.name}${variable.value?' = '+variable.value:''};\n`;

    if (list.length > 0) prepareVariables(list, callback);
    else{
    	jsDoc += `\n`;
    	if (callback && typeof callback == 'function') callback();
	}
}

function execOps(list, complete = true) {
	var operation = list.shift();
    //console.log(operation, list);

    switch(operation.type){
        case "loop":
            if (operation.repeats && typeof operation.repeats == "number") {
                jsDoc += `for (var i = 0; i < ${operation.repeats}; i++) {\n`;
                if (operation.operations && typeof operation.operations == "object") execOps(operation.operations, false);
                jsDoc += `}\n`;
            }
            break;
    	case "input":
    		if (!imports.includes("readline-sync")) {
    			jsDoc = `const readlineSync = require('readline-sync');\n` + jsDoc;
				imports.push("readline-sync");
    		}
    		
			jsDoc += `${operation.variable} = readlineSync.question('${operation.prompt || ""} ');\n`;
    		break;
    	case "output":
    		var compiledOutput = [];

    		for (var i = 0; i < operation.values.length; i++) {
	    		if (typeof operation.values[i] == 'array') {
		    		compiledOutput.push(`\`${operation.values[i]}\``);
	    		}
	    		else if (typeof operation.values[i] == 'string') {
		    		compiledOutput.push(`\`${operation.values[i]}\``);
	    		}
	    		else if (typeof operation.values[i] == 'object') {
	    			compiledOutput.push(`${operation.values[i].variable}`);
	    		}
	    		else return console.log("Error whilte compiling, unknown value type");
	    	}

	    	jsDoc += `console.log(${compiledOutput.join()});\n`;

    		break;
    	default:
    		console.log("Hit default");
    }

    if (list.length > 0) execOps(list);
    else{
        if (!complete) return;
    	fs.writeFile(outputFile, jsDoc, function (err) {
  			if (err) return console.log(err);

		  	console.log('Successfully compiled file to ' + outputFile);
		});
	}
}

const workingFile = args.f || args.file;

fs.readFile(workingFile, (err, data) => {
    if (err) return console.log(err);

    var list = JSON.parse(data);

    prepareVariables(list.variables, function(){
    	execOps(list.operations);
    });
});