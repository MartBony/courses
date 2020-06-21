import App, { course } from './app.js';
import UI from './UI.js';
import { addSiteCache, initPwaEvents } from './pwa.js';
import initEvents from './controls.js';
import { LocalStorage } from './storage.js';


let app;

// Authenticate
$.ajax({
	method: "POST",
	url: "serveur/auth.php",
	data: { tryCookiesAuth: true }
})
	.then(data => {
		if (data && data.status == 200){
			return data.id;
		} else throw "Require auth";
	})
	.catch(err => {
		if (LocalStorage.getItem('userId')) return LocalStorage.getItem('userId')
		else throw err;
	})
	.then(id => {
		if(id){
			// Initialise on read
			addSiteCache('site-course', 'coursesCache.json');
			initPwaEvents();

			app = new App(id);
			initEvents(app, course);
		} else throw "Require auth";
	})
	.catch(err => {
		console.error(err);
		UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
			{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
		]);
	});