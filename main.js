const path = require("path");
const {
    app,
    BrowserWindow,
    Menu
} = require("electron");

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'development'

// create main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev ? 1000 : 500,
        height: 700,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // open devtools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    // loading file or url like twitter in desktop app
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: "About Image Resizer",
        width: 300,
        height: 300
    });
    // open devtools if in dev env
    if (isDev) {
        aboutWindow.webContents.openDevTools();
    }
    // loading file or url like twitter in desktop app
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}
//starting the app when ready
app.whenReady().then(() => {
    createMainWindow();

    // Menu Implementation
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    // check if any windows are open for this app and if not start a new window 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })
})

//menu template
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : [])
]

// quit the app if the device is not mac
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})