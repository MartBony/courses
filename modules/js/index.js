import App, { course } from './app.js';
import { addSiteCache, initPwaEvents } from './pwa.js';
import initEvents from './controls.js';

let app;

// Initialise on read
addSiteCache('site-course', 'coursesCache.json');
initPwaEvents();


// Initialise on load
$(window).on('load', function(){
	app = new App();
	initEvents(app, course);
});