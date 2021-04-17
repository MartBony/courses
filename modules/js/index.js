import App from './app.js';
import Pull from './requests.js';
import UI from './UI.js';
import { installSW } from './pwa.js';
import initEvents from './controls.js';
import { IndexedDbStorage, LocalStorage } from './storage.js';
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
document.querySelector('form.inscipt').onsubmit = e => {
	e.preventDefault();
	let mail = document.querySelector('#iEmail').value,
		pass = document.querySelector('#iPass').value,
		passConf = document.querySelector('#iPassConf').value,
		nom = document.querySelector('#iNom').value;
	fetcher({
		method: "POST",
		url: "serveur/auth.php",
		data: { inscript: true, mail: mail, pass: pass, passConf: passConf, nom: nom }
	}).then(data => {
		if (data.status == 200){
			if(data.sent){
				alert("Votre compte à été créé, un email de confirmation à été envoyé à votre adresse email");
			} else {
				alert("Il y a eu un problème");
			}
		} else if((data.status == 400 || data.status == 401) && data.err){
			switch(data.err){
				case "manquant":
					alert('Il faut remplir tous les champs');
					break;
				case "mail":
					alert('L\'email renseigné est incorrect');
					break;
				case "pass":
					alert('Le mot de passe doit faire au moins 6 caractères');
					break;
				case "diff":
					alert('Les mots de passe ne correspondent pas');
					break;
				case "nom":
					alert('Le nom doit contenir entre 2 et 20 lettres, majuscules ou minuscules');
					break;
				case "exists":
					alert('Un compte relié à cette email existe déja, essayez de vous connecter');
					break;
			}
		}
	}).catch(err => {
		console.log(err);
	});
}

document.querySelector('form.connect').onsubmit = e => {
	e.preventDefault();
	let mail = document.querySelector('#cEmail').value,
		pass = document.querySelector('#cPass').value;
	fetcher({
		method: "POST",
		url: "serveur/auth.php",
		data: { connect: true, mail: mail, pass: pass }
	})
	.then(res => {
		if(res && res.status == 200) {
			LocalStorage.setItem('userId', res.payload.userId);
			return cssReady().then(() => startApp(res.payload.userId));
		} else if((res.status == 400 || res.status == 401 || (res.status == 403 && data.sent)) && data.err){
			switch(data.err){
				case "manquant":
					alert('Il faut remplir tous les champs');
					break;
				case "noEmail":
					alert('L\'email renseignée est inconnue');
					break;
				case "nonActivated":
					alert('Un email vous a été envoyé pour confirmer votre identité');
					break;
				case "credential":
					alert('Mot de passe incorrect');
					break;
			}
		} else if(res.status == 403 && !data.sent && data.err) {
			if(data.err == "nonActivated") alert('Votre compte requiert une activation, mais nos serveurs n\'ont pas pu envoyer l\'email de confirmation');
		} else console.log(res);
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
	if(!app){
		app = new App(user, offline);
		initEvents(app);
	}
}

async function directAuthenticaction(){
	const userId = LocalStorage.getItem('userId');
	if(userId){
		await cssReady();
		return startApp(userId, true);
	}
	try{
		let userId = await Pull.authRequest();
		LocalStorage.setItem('userId', userId);
		await cssReady()
		return startApp(userId);
	} catch(err) {
		console.error(err);
		if(err == "Require auth") UI.requireAuth();
	}
}