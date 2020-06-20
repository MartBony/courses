import App, { course } from './app.js';
import { addSiteCache, initPwaEvents } from './pwa.js';
import initEvents from './controls.js';
import Account from './account.js';


let app, compte;

// Authenticate
compte = Account.auth().then(id => {
	if(id){
		// Initialise on read
		addSiteCache('site-course', 'coursesCache.json');
		initPwaEvents();

		app = new App(id);
		initEvents(app, course);
		
	}
});