import App from './app.js';
import Pull from './requests.js';
import UI from './UI.js';
import Storage from './storage.js';
import Generate from './generate.js';
import { swipedetect, SwipeBackPanel, SwipeBtPanel } from './touch.js';

export default function initEvents(app, course){

	// Touch events
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
		$('.add, #refresh').css({'transition':'all 100ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});

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

	// Regular Events

	$(document).on('click', '.add.closed',function(){
		if ($('body').hasClass('bodyPreview')) {
			UI.addPreview();
		}
		else{
			UI.addArticle();
		}
	});

	$(document).on('click', '.noCourse',() => {
		UI.openMenu();
	});

	$(document).on('click', '.lienParams',() => {
		UI.openParams();
	});

	$('#params input').change(()=>{
		if(Storage.getItem('currency')){
			Storage.setItem('currency',"");
		} else {
			Storage.setItem('currency',"$");
		}
		app.setParameters();
	});

	$('#refresh').click(function(){
		app.pull("refresh");
	});

	$('.install i').click(function(){
		UI.hideInstall();
	});

	$('.newCourse').click(function(){
		UI.addCourse();
	});

	$('#addarticle i').click(function(){
		UI.closeArticle();
	});

	$('#addarticle input').eq(0).on('keypress',function(e){
		if(e.which == 13 || e.keyCode == 13 || e.key == 13){
			e.preventDefault();
			$('#addarticle input').eq(1).focus();
		}
	});

	$('#addCourse input').eq(0).on('keypress',function(e){
		if(e.which == 13 || e.keyCode == 13 || e.key == 13){
			e.preventDefault();
			$('#addCourse input').eq(1).focus();
		}
	});

	$('.menu i.ms-Icon--Back').click(function(){
		UI.closeMenu();
	});

	$('.menu i.ms-Icon--Settings').click(function(){
		UI.openParams();
	});

	$('#params > i').click(function(){
		UI.closeParams();
	});

	$('#addCourse i').click(function(){
		UI.closeCourse();
	});

	$('#addpreview i').click(function(){
		UI.closePreview();
	});

	$('#prices i').click(function(){
		app.closePrice();
	});

	$(document).on('click', '.main .ms-Icon--Delete',function(){
		$('.article, .preview').removeClass('ready initSwitch');
		$(this).parent().addClass('ready');
	});

	$(document).on('click', '.noDelete',function(){
		$('.article, .preview').removeClass('ready');
	});

	$(document).on('click', '.ready',function(){
		$(this).removeClass('ready');
	});

	// Groupes
	
	$(document).on('click', '.groupe i.ms-Icon--Leave', e => {
		UI.modal(app, 'leaveGroupe');
	});
	
	$(document).on('click', '.groupe i.ms-Icon--AddFriend', e => {
		UI.promptAddFriend(app);
	});

	$(document).on('click', '#leaveGroupe .back', e => {
		UI.closeModal();
	});

	$(document).on('click', '#leaveGroupe .leaveGrp', e => {
		app.leaveGrp();
	});

	$('#newgroupe').on('click', e => {
		UI.openAddGroup();
	});

	$('#addGroupe > i').click(function(){
		UI.closeAddGroup();
	});

	// invitations
	$('#generateId').click(e => {
		app.generateInviteKey();
	});

	$('#invitation > i').click(function(){
		UI.closeInvite(app);
	});

	$('#invitations button').click(() => {
		Pull.invitations(app);
	});






	$('header i').click(function(){
		UI.openMenu();
	});

	document.addEventListener("visibilitychange", ()=>{
		if (document.visibilityState == "visible") {
			app.pull("refresh");
		}
	}, false);

	window.addEventListener('online', () => {
		app.pull("refresh");
	});

	$(document).on('click', '.activate',function(){
		$('.activate').css({'opacity':'0.8'});
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { update: 'true', activate: 'true', groupe: app.usedGroupe.id}
			})
		.then(function( data ) {
			if(data.status == 200){
				setTimeout(function(){
					$('.add').removeClass('hidden');
					$('.activate').css({'transition':'all 200ms ease-out 200ms', 'opacity':'0','transform':'scale(0.98)'});
					setTimeout(function(){
						$('.activate').css({'display':'none'});
					}, 420);	
				},400);
				if(course.swipe == 1){
					setTimeout(function(){
						app.setSwipe(0);
					},200);
				}

				var storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.id == course.id){
						storage[i].dateStart = data.time;
					}
				});
				course.started = true;

				Storage.setItem('courses', storage);
			} else {
				alert("Un problème du serveur est survenu, réessayez");
			}
		})
		.catch(function(err){
			$('.activate').css({'opacity':'1'});
			UI.offlineMsg(app, err);
		});
	});

	$('#addarticle form').on('submit', e => {
		e.preventDefault();
		if ($('#addarticle #titreA').val() && $('#addarticle #titreA').val() != '') {
			if ($('#addarticle #prix').val() && $('#addarticle #prix').val() != '') {
				if (!isNaN(parseFloat($('#addarticle #prix').val().replace(',','.')))) {
					$('.loader').addClass('opened');
					$.ajax({
						method: "POST",
						url: "serveur/push.php",
						data: { update: 'true', submitArticle: 'true', titre: $('#addarticle #titreA').val(), prix: $('#addarticle #prix').val().replace(',','.'), groupe: app.usedGroupe.id}
						})
					.then(function( data ) {
						$('.loader').removeClass('opened');
						UI.acc(app);

						if (!course.started) $('.activate').click();

						$('html, body').animate({scrollTop: 0}, 30);
						$('.list').prepend(Generate.article(app, data.id, data.titre, data.prix));
				
						app.totalPP(data.prix);
						$('#addarticle #titreA, #addarticle #prix').val('');

						setTimeout(function(){
							$('.article').removeClass('animateSlideIn');
						},300);

						console.log(data)

						var storage = Storage.getItem('courses') || new Array();
						storage.forEach((el, i) => {
							if(el.id == course.id){
								storage[i].total = course.total;
								storage[i].items.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
							}
						});

						course.displayed.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});

						Storage.setItem('courses', storage);
					})
					.catch(err => {
						$('.loader').removeClass('opened');
						UI.offlineMsg(app, err);
					});
				}
				else{
					alert('Prix de l\'article non conforme');
				}
			}
			else{
				alert('Prix de l\'article non spécifié');
			}
		}
		else
		{
			alert('Nom de l\'article non spécifié');
		}
	});

	$('#addpreview form').on('submit', e => {
		e.preventDefault();
		if ($('#addpreview #titreP').val() && $('#addpreview #titreP').val() != '') {
			$('.loader').addClass('opened');
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: { update: 'true', submitPreview: 'true', titre: $('#addpreview #titreP').val(), groupe: app.usedGroupe.id}
			}).then(data => {
				$('.loader').removeClass('opened');
				UI.acc(app);
				if (!course.started) {
					$('.activate').eq(1).after(Generate.preview(app, data.id, data.titre, data.color));
				}
				else{
					$('html, body').animate({scrollTop: 0}, 30);
					$('.prevList').prepend(Generate.preview(app, data.id, data.titre, data.color));
				}
				$('#addpreview #titreP').val('');
				setTimeout(function(){
					$('.preview').removeClass('animateSlideIn');
				},300);


				var storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.id == course.id){
						storage[i].items.previews.unshift({id: data.id, titre: data.titre, color: data.color});
					}
				});
				course.displayed.previews.unshift({id: data.id, titre: data.titre, color: data.color});

				Storage.setItem('courses', storage);
			}).catch(err => {
				console.log(err);
				$('.loader').removeClass('opened');
				UI.offlineMsg(app, );
			});
		}
		else
		{
			alert('Il faut donner un nom à l\'article 😑');
		}
	});

	$('#prices form').on('submit', function(e){
		e.preventDefault();
		if ($('#prices #newPrice').val() && $('#prices #newPrice').val() != '') {
			if (!isNaN(parseFloat( $('#prices #newPrice').val().replace(',','.')))) {
				app.buy(course.priceCursor.index,$('#prices #newPrice').val().replace(',','.'));
			} else {
				alert('Il faux rentrer un prix numérique');
			}
		}
		else{
			alert('Il faut rentrer un prix');
		}
	});

	$(document).on('click', '#prices li', e => {
		var index = $(e.target).index();
		app.buy(course.priceCursor.index, app.liPrices[index]);
	});

	$('#addCourse form').on('submit', e => {
		e.preventDefault();
		if ($('#addCourse #titreC').val() && $('#addCourse #titreC').val() != '') {
			if ($('#addCourse #maxPrice').val() && $('#addCourse #maxPrice').val() != '') {
				if (!isNaN(parseFloat( $('#addCourse #maxPrice').val().replace(',','.')))) {
					$('.loader').addClass('opened');
					$.ajax({
						method: "POST",
						url: "serveur/push.php",
						data: { submitCourse: 'true', titre: $('#addCourse #titreC').val(), maxPrice: $('#addCourse #maxPrice').val().replace(',','.'), groupe: app.usedGroupe.id}
					}).then(function(data){
						$('.loader').removeClass('opened');
						if(data.status == 200){
							history.replaceState({key:'createCourse'}, '','index.php');
							$('#addCourse #titreC, #addCourse #maxPrice').val('');

							Storage.setItem('usedCourse', null);
							app.pull("refresh", null, null, () => {
								UI.acc(app);
							});
						} else if (data.status == 403){
							UI.erreur('Erreur',"Le groupe demandé est innaccessible depuis votre compte");
						}
					}).catch(function(err){
						$('.loader').removeClass('opened');
						UI.offlineMsg(app, err);
					});

				}
				else
				{
					alert('Prix de l\'article non conforme');
				}
			}
			else{
				alert('Ca ne fonctionne jamais sans limite 😉');
			}
		}
		else
		{
			alert('Il faut donner un nom à la course 😑');
		}
	});

	$('#addGroupe form').on('submit', e => {
		e.preventDefault();
		if ($('#addGroupe #titreG').val() && $('#addGroupe #titreG').val() != '') {
			$('.loader').addClass('opened');
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: { newGroupe: 'true', titre: $('#addGroupe #titreG').val() }
			}).then(data => {
				if(data.status == 200){
					$('.loader').removeClass('opened');
					$('#addGroupe #titreG').val("");
					Storage.clear();
					UI.closeAddGroup();
					app.pull("refresh");
					
				}
			}).catch(function(err){
				$('.loader').removeClass('opened');
				UI.offlineMsg(app, err);
			});
		}
		else
		{
			alert('Il faut donner un nom à la course 😑');
		}
	});

	$('#invitation form').on('submit', e => {
		e.preventDefault();
		if ($('#invitation #nomInv').val() && $('#invitation #nomInv').val() != '') {
			if ($('#invitation #keyInv').val() && $('#invitation #keyInv').val() != '') {
		
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur/invites.php",
					data: { invite: 'true', nom: $('#invitation #nomInv').val(), key:  $('#invitation #keyInv').val(), groupe: app.usedGroupe.id}
				}).then(function(data){
					$('.loader').removeClass('opened');
					if(data.status == 200){
						$('#invitation #nomInv').val('');
						$('#invitation #keyInv').val('');
						UI.closeInvite();
						UI.message('Réussit', "L'invitation est envoyée, surveillez les paramètres de l'invité", [
							{ texte:"C'est noté", action : () => UI.closeMessage()}
						]);
					} else if(data.status == 403) {
						UI.erreur('Erreur',"Impossible d'envoyer l'invitation, l'invité est déja membre du groupe ou bien est déja invité à le rejoindre");
					} else if(data.status == 400) {
						UI.erreur('Erreur',"Les informations entrées ne correspondent à aucun utilisateur, réessayez");
					}
				}).catch(function(err){
					$('.loader').removeClass('opened');
					UI.offlineMsg(app, err);
				});
			}
			else{
				alert('Rensignez la clef générée par l\'utilisateur');
			}
		}
		else
		{
			alert('Renseignez le nom de l\'utilisateur');
		}
	});
}