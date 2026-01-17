const path = require('path');
const { app, BrowserWindow, ipcMain, dialog, Menu, webContents } = require('electron');

//import path from 'path';
//import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';


let win;

//import { fileURLToPath } from 'url';
//const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  // Cree la fenetre du navigateur.
  win = new BrowserWindow({
    width: 800,
    height: 1100,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
  //win.removeMenu();

}

ipcMain.on('OpenTest', (event, arg) => {   // OUvrir un TEST

  let options = {
    title: "Ouvrir un Test",
    defaultPath: '/',
    properties: ["openDirectory"]
  };
  let m = dialog.showOpenDialogSync(options);
  win.webContents.send("testFolder", m);
});

ipcMain.on('NewTest', (event, arg) => {   // Creer un nouveau TEST

  let m = dialog.showSaveDialogSync(null, {
    title: "Enregistrer un test QCM",
    defaultPath: '/',
    properties: [""]
  });
  win.webContents.send("newFolder", m);
});





const isMac = process.platform === 'darwin'
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
//Menu.setApplicationMenu(null)



app.whenReady()
  .then(createWindow)
  .catch(e => {

  });