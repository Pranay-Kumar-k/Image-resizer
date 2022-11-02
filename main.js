const path = require("path");
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell
} = require("electron");
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

process.env.NODE_ENV = 'production';
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production'
let mainWindow;
// create main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    // Show devtools automatically if in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
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

    // Remove main window from memory on close
    mainWindow.on('closed', () => (mainWindow = null))
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

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options);
})

async function resizeImage({
    imgPath,
    height,
    width,
    dest
}) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        })
        const filename = path.basename(imgPath);

        // Create destination folder
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        // Write file to destination
        fs.writeFileSync(path.join(dest, filename), newPath);
        // Send success msg to renderer
        mainWindow.webContents.send('image:done')

        //open destination folder
        shell.openPath(dest)
    } catch (error) {
        console.log(error)
    }
}

// quit the app if the device is not mac
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})

// check if any windows are open for this app and if not start a new window 
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
})