
import chalk from 'chalk';
import fetch from 'node-fetch';
import fs from 'fs';
import zipdir from 'zip-dir';
import path from 'path';
import projectName from 'project-name';
import { promisify } from 'util';


const access = promisify(fs.access);

const API_ENDPT_URL = 'https://api.designengine.ai/playground.php';



const cacheDir = ()=> {
	const plat = process.platform;
	const appName = [...projectName().split('/')].pop();
	const homeDir = process.env[(plat === 'win32') ? 'USERPROFILE' : 'HOME'];

	return ((plat === 'win32') ? path.join(homeDir, 'AppData', appName) : path.join(homeDir, `.${appName}`));
};


const getCache = async(key)=> {
	const cachePath = path.join(cacheDir(), 'caches');

	if (!fs.existsSync(cachePath)) {
		fs.readFile(cachePath, 'utf8', (err, contents)=> {
			return (contents);
		});

	} else {
		return (null);
	}
};


const writeCache = async(key, val)=> {
	const cachePath = path.join(cacheDir(), 'caches');
	const appPath = path.join(cachePath, '..', '..');

	if (!fs.existsSync(appPath)) {
		fs.mkdir(appDir, (err)=> {
			fs.writeFile(cachePath, JSON.stringify({ [key] : val }), (err)=> {});
		})

	} else {
		fs.writeFile(cachePath, JSON.stringify({ [key] : val }), (err)=> {});
	}
};


async function createZip(srcPath, playgroundID) {
	console.log('createZip', srcPath);

	zipdir(srcPath, {
		saveTo : path.join(cacheDir(), `build_${playgroundID}.zip`)

	}, (err, buffer)=> {
		console.log('>>>>>> ZIPPED');
	});
}

async function sendZip(filepath, playgroundID) {
	console.log('sendZip', filepath, playgroundID);

	let formData = new FormData();
	formData.append('file', )
}


async function queryPlayground(playgroundID) {
	let response = await fetch(API_ENDPT_URL, {
		method  : 'POST',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify({
			action        : 'PLAYGROUND',
			playground_id : playgroundID,
			title         : projectName()
		})
	});

	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
	}

//  console.log('PLAYGROUND -->>', response);
	return (response);
}

export async function syncPlayground(options) {
	try {
		await access(path.join(process.cwd(), 'build'), fs.constants.R_OK);

	} catch (e) {
		console.log('%s Couldn\'t find build dir! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	console.log('%s Queueing playground…', chalk.cyan.bold('INFO'));

	let response = null;
	try {
		response = await queryPlayground(1);

	} catch (e) {
		console.log('%s Error querying server! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	const playground = { ...response.playground,
		id  : response.playground.id << 0,
		new : response.playground.is_new
	};

//	console.log(response, '-->', playground);

	await writeCache('playground_id', playground.id);


	console.log('%s Compressing files…', chalk.cyan.bold('INFO'));
	await createZip(path.join(process.cwd(), 'build'), playground.id);


	console.log('%s Sending zip…', chalk.cyan.bold('INFO'));


	console.log('%s Playground %s! %s', chalk.green.bold('DONE'), (playground), `https://playground.designengine.ai/${playground.id}`);
	return (true);
}
