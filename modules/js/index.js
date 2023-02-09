import AppWindow from './app.js';
import Pull from './requests.js';
import UI from './UI.js';
import { installSW } from './pwa.js';
import initEvents from './controls.js';
import { LocalStorage } from './storage.js';
import { fetcher } from './tools.js';

let app;

console.log("Index loaded");
installSW()
.then(directAuthenticaction)
.catch(err => {
	console.error(err);
	UI.erreur("Navigateur non compatible", "Un problème est survenu lors du chargement de l'application, mettez à jour votre navigateur")
});


// Auth
document.querySelector('form.signup').onsubmit = e => {
	e.preventDefault();
	const form = e.target;
	fetcher({
		method: "POST",
		url: "serveur/auth.php",
		body: { 
			inscription: true, 
			mail: form.email.value, 
			pass: form.password.value, 
			passConf: form.passwordVer.value, 
			nom: form.nom.value 
		}
	}).then(res => {
		if (res.status == 200 && res.payload){
		UI.message(res.payload.message);

		} else {
			UI.erreur(res.payload.message);
		}
	}).catch(err => {
		console.log(err);
	});
}

document.querySelector('form.login').onsubmit = e => {
	e.preventDefault();
	const form = e.target;
	fetcher({
		method: "POST",
		url: "serveur/auth.php",
		body: { connect: true, mail: form.email.value, pass: form.password.value }
	})
	.then(res => {
		if(res && res.status == 200) {
			LocalStorage.setItem('userId', res.payload.userId);
			return cssReady().then(() => startApp(res.payload.userId));
		} else UI.erreur(res.payload ? res.payload.message : null);
	});
}

async function cssReady(){
	if(document.body.classList.contains("cssReady")){
		document.getElementById('authContainer').classList.remove('opened');

		Promise.resolve();
	} else {
		// let timer = setTimeout(() => {window.location.reload()}, 10000); TO UNCOMMENT
		document.addEventListener("cssReady", () => {
			timer.clearTimeout();
			document.getElementById('authContainer').classList.remove('opened');
			
			Promise.resolve();
		});
	}
}

function startApp(user, offline = false){
	document.getElementById('authContainer').classList.remove('opened');
	if(!app){
		customElements.define("app-window", AppWindow);
		app = document.querySelector("app-window");
		app.initiate(user, offline);
		initEvents(app);
	}
}

async function directAuthenticaction(){
	const userId = LocalStorage.getItem('userId');
	if(userId){
		await cssReady();
		return startApp(userId, true);
	}
	document.getElementById("preload").children[1].innerHTML = "Connection ...";
	try{
		let userId = await Pull.authRequest();
		LocalStorage.setItem('userId', userId);
		await cssReady()
		return startApp(userId);
	} catch(err) {
		console.log(err);
		if(err.action && err.action == "authenticate") document.getElementById('authContainer').classList.add('opened');
		else window.location = "/courses/offline.html";
	}
}