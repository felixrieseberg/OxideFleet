var extractZip = require('extract-zip');
var Download = require('download');
var exec = require('child_process').exec;
var NW_VERSION = '0.12.0';
var os = require('os');
var fs = require('fs');

runNw('./node_modules/nw/bin/nw');

function runNw(nwPath){
    var nw;
    if(os.platform() === 'linux'){
        // TODO - What happens to folks running a linux desktop?
        nw = exec('./travis_runner.sh ' + nwPath + ' ./dist/tests');
    }
    else{
        nw = exec(nwPath + ' ./dist/tests');    
    }
    
    nw.stdout.on('data', function (data) {
        process.stdout.write(data);
    });
    var onError = false;
    nw.stderr.on('data', function (data) {
        if(data.indexOf('DEBUG:') === -1 &&
            data.indexOf('DEPRECATION:') === -1 &&
            data.indexOf('(file:') === -1){
            data = data.replace(/\[.*\]/g, "");
            data = data.replace(/\, source.*/g, "");
            data = data.replace(/\"/g, "");
            
            
            if (data.match(/ok \d+/) !== null && data.match(/not ok/) === null)
            {
                onError = false;
            }

            if(data.trim().length > 0){
                if(!onError){
                    process.stdout.write(TrimBeginningWhiteSpace(data));    
                    if(data.match(/not ok/) !== null){
                        onError = true;
                    }
                }
                else{
                    process.stderr.write(TrimBeginningWhiteSpace(data));
                }
            }
        }
    });
    nw.on('exit', function (code) {
        setTimeout(function(){
            process.exit(code);
        }, 2000);
    });   
}

function TrimBeginningWhiteSpace(str){  
  while(str.charAt(0) == (" ") ){str = str.substring(1);}
  while(str.charAt(str.length-1) ==" " ){str = str.substring(0,str.length-1);}
  return str;
}