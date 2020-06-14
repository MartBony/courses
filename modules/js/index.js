import App, { course } from './app.js';
import { addSiteCache, initPwaEvents } from './pwa.js';
import initEvents from './controls.js';
import Account from './account.js';


let app, compte;

window.addEventListener('load', () => {
	
	// Authenticate
	compte = Account.auth().then(isAuth => {
		if(isAuth){
			// Initialise on read
			//addSiteCache('site-course', 'coursesCache.json'); To uncomment
			//initPwaEvents(); To uncomment
			
			app = new App();
			initEvents(app, course);

		}
	});
});