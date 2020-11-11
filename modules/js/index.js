import App from './app.js';
import UI from './UI.js';
import { addSiteCache, initPwaEvents } from './pwa.js';
import initEvents from './controls.js';
import { LocalStorage } from './storage.js';
import { $_GET } from './tools.js';

let app;

authenticate();


// Auth
document.querySelector('form.inscipt').onsubmit = e => {
	e.preventDefault();
	let mail = document.querySelector('#iEmail').value,
		pass = document.querySelector('#iPass').value,
		passConf = document.querySelector('#iPassConf').value,
		nom = document.querySelector('#iNom').value;
	$.ajax({
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
	$.ajax({
		method: "POST",
		url: "serveur/auth.php",
		data: { connect: true, mail: mail, pass: pass }
	}).then(res => authenticate())
	.catch(res => {
		let data = res.responseJSON;
		if((res.status == 400 || res.status == 401 || (res.status == 403 && data.sent)) && data.err){
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

if ($_GET('auth') && $_GET('mail')) {
	let clef = $_GET('auth'),
		mail = $_GET('mail');
	$.ajax({
		method: "POST",
		url: "serveur/auth.php",
		data: { confirm: true, mail: mail, clef: clef}
	}).then(data => {
		if (data.status == 200 && data.mail){
			document.getElementById('cEmail').value = data.mail;
			alert("Votre compte est activé, vous pouvez maintenant vous connecter");
			history.replaceState({key: null}, '', '/courses/');
		} else if((data.status == 400 || data.status == 401) && data.err){
			switch(data.err){
				case "manquant":
					alert('Il faut remplir tous les champs');
					break;
				case "wrong":
					alert('Les informations fournies ne sont pas correctes, le lien fournit est incorrect');
					break;
			}
		}
	}).catch(err => {
		console.log(err);
	});
}


function authenticate(){
	$.ajax({
		method: "POST",
		url: "serveur/auth.php",
		data: { tryCookiesAuth: true }
	})
		.then(data => {
			return data.id
		})
		.catch(res => {
			if (res.status == 401) {
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{
						texte:"Se connecter", 
						action : () => {
							document.getElementById('authContainer').classList.add('opened');
							UI.closeMessage();
						}
					}
				]);
			} else if (res.status == 403) {
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{
						texte:"Se connecter", 
						action : () => {
							document.getElementById('authContainer').classList.add('opened');
							UI.closeMessage();
						}
					}
				]);
			} else {
				if (LocalStorage.getItem('userId')) return LocalStorage.getItem('userId');
				throw "Require frontauth";
			}
		})
		.then(id => {
			if(id){
				if(document.body.classList.contains("cssReady")){
					document.getElementById('authContainer').classList.remove('opened');
					
					// Initialise on read
					addSiteCache('site-course', 'coursesCache.json');
					initPwaEvents();

					app = new App(id);
					initEvents(app);	
				} else {
					//let timer = setTimeout(() => {window.location.reload()}, 10000);
					document.addEventListener("cssReady", () => {
						timer.clearTimeout();
						document.getElementById('authContainer').classList.remove('opened');
					
						// Initialise on read
						addSiteCache('site-course', 'coursesCache.json');
						initPwaEvents();

						app = new App(id);
						initEvents(app);
					});
				}
			} else throw "Require auth";
		})
		.catch(err => {
			console.error(err);
			UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
				{
					texte:"Se connecter", 
					action : () => {
						document.getElementById('authContainer').classList.add('opened');
						UI.closeMessage();
					}
				}
			]);
		});
}