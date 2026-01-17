var fs = require('fs');
const { uuid } = require('uuidv4');
//const {test} = require('./js/test');
//const {scormGeny} = require('./js/scormGeny');

const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld('fs', {
    mkdirSync: (...args) => fs.mkdirSync(...args),
    existsSync: (...args) => fs.existsSync(...args),
    writeFile: (...args) => fs.writeFile(...args),
    readFileSync: (...args) => fs.readFileSync(...args),
});

contextBridge.exposeInMainWorld('uuid', {
    generate: () => uuid(),
});

contextBridge.exposeInMainWorld('process', {
    platform: process.platform,
    chdir: (...args) => process.chdir(...args),
});


/*contextBridge.exposeInMainWorld('test', {
    create : (...args) => {
        
        return new test(...args);
    },
    hasChanged :()=> { return test.hasChanged },     //static variable
    setHasChanged:(v)=> test.hasChanged=v,
    setTestPath :(p)=> test.testPath=p,
    getTestPath : ()=> { return test.testPath; },
    getTestData : ()=> {return test.testData; },
});*/


/*
contextBridge.exposeInMainWorld('scoModule', {
    generateSco: () => {
        let sc = new scormGeny(test.testData, test.testPath);
        sc.generate();
    }
});
*/