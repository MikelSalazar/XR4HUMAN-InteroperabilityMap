// Electron JS file.

// Provides an environment for the tests
const { app, BrowserWindow } = require('electron');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
function createWindow () {
	const win = new BrowserWindow({ width: 800, height: 600,
		show: false,			// Start hidden
		fullScreen: true,		// Fullscreen mode
		darkTheme: true,		// Dark theme
		autoHideMenuBar: true,	// Hide the menu bar
		webPreferences: { devTools:true, nodeIntegration: false }
	});
	win.loadFile('../tests/index.html');
	win.webContents.openDevTools();
	win.once('ready-to-show', () => { win.maximize();win.show(); });
}

// Create a window
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { app.quit() });
app.on('activate', () => { 
	if (BrowserWindow.getAllWindows().length === 0) { createWindow();}});