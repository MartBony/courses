import App, { course } from './app.js';
import { addSiteCache, initPwaEvents } from './pwa.js';
import { swipedetect, SwipeBackPanel, SwipeBtPanel } from './touch.js';
import initUiEvents from './controls.js';

let app;

// Initialise on read
addSiteCache('site-course', 'coursesCache.json');
initPwaEvents();


// Initialise on load
$(document).ready(function(){
	app = new App();
	initUiEvents(app, course);

	var swipeSurface = document.getElementById('touchSurface'); // Swipe touch surface
	swipedetect(swipeSurface, function(swipedir){
		if($('body').hasClass('bodyPreview')){
			if (swipedir == 'right'){
				app.swipe('right');
			}
			else{
				$('.list').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':'translateX(-100vw)'});
				$('.prevList').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});
			}
		}
		else{
			if (swipedir == 'left'){
				app.swipe('left');
			}
			else{
				$('.list').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});
				$('.prevList').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':'translateX(100vw)'});
			}
		}


		$('header h1').css({'transition':'all 100ms cubic-bezier(0.1,0.9,0,1)', 'transform':'translateX(0px)'});
		$('.add, .refresh').css({'transition':'all 100ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});

		setTimeout(function(){
			$('.calcul').css({'height': '', 'transition':'', 'display':''});
			$('header h1, .add').css({'transition':'', 'transform':''});
		},300);
	});

	var btTouchSurface = document.getElementById('btTouchSurf'); // Open calcul pane surface
	SwipeBtPanel(btTouchSurface, function(dir){
		$('.calcul').css({'height':'', 'transition':''});
		if (dir == 'top') {
			$('.calcul').addClass('opened');
			$('#backTouchSurf').css({'visibility':'visible'});
			$('#btTouchSurf').css({'visibility':'hidden'});
		}
		else if(dir == 'bottom'){
			$('.calcul').removeClass('opened');
			$('#backTouchSurf').css({'visibility':'hidden'});
			$('#btTouchSurf').css({'visibility':'visible'});
		}
	});

	var backTouchSurface = document.getElementById('backTouchSurf'); // Close calcul pane surface
	SwipeBackPanel(backTouchSurface, function(dir){
		$('.calcul').css({'height':'', 'transition':''});
		if (dir == 'top') {
			$('.calcul').addClass('opened');
			$('#backTouchSurf').css({'visibility':'visible'});
			$('#btTouchSurf').css({'visibility':'hidden'});
		}
		else if(dir == 'bottom'){
			$('.calcul').removeClass('opened');
			$('#backTouchSurf').css({'visibility':'hidden'});
			$('#btTouchSurf').css({'visibility':'visible'});
		}
	});

});