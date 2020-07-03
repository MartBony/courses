import Pull from './requests.js';
import UI from './UI.js';
import { LocalStorage, idbStorage } from './storage.js';
import Generate from './generate.js';
import { swipedetect, SwipeBackPanel, SwipeBtPanel } from './touch.js';


export default function initEvents(app){

	let refresh = (callback, idGroupe, idCourse) => {
		callback = callback || function(){};
		document.querySelector('.loader').classList.add('opened');
		if(!app.pending){
			app.pull("refresh", idGroupe, idCourse).then(callback);
		} else {
			let loop = setInterval(() => {
				if(!app.pending){
					document.querySelector('.loader').classList.add('opened');
					app.pull("refresh", idGroupe, idCourse).then(callback);
					clearInterval(loop);
				}
			}, 1000);
		}
		},
		open = (callback, idGroupe, idCourse) => {
			callback = callback || function(){};
			document.querySelector('.loader').classList.add('opened');
			if(!app.pending){
				app.pull("open", idGroupe, idCourse).then(callback);
			} else {
				let loop = setInterval(() => {
					if(!app.pending){
						document.querySelector('.loader').classList.add('opened');
						app.pull("open", idGroupe, idCourse).then(callback);
						clearInterval(loop);
					}
				}, 1000);
			}
			},
		noLoaderRefresh = () => {
		if(!app.pending){
			app.pull("refresh");
		} else {
			let loop = setInterval(() => {
				if(!app.pending){
					app.pull("refresh");
					clearInterval(loop);
				}
			}, 1000);
		}
		},
		activate = () => {
			$('.loader').addClass('opened');
			$('.activate').css({'opacity':'0.8'});
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: { activate: true, groupe: app.usedGroupe.id }
			}).then(data => {
				$('.loader').removeClass('opened');
				if(data.status == 200){
					$('.adder').css({'display':''});
					setTimeout(function(){
						$('#add').removeClass('hidden');
						$('.activate').css({'transition':'all 200ms ease-out 200ms', 'opacity':'0','transform':'scale(0.98)'});
						setTimeout(function(){
							$('.activate').css({'display':'none'});
						}, 420);	
					},400);
					setTimeout(function(){
						app.setSwipe(0);
					},200);
					

					idbStorage.get("courses", app.course.id)
						.then(storage => {
							storage.dateStart = data.time;
						});
					app.course.started = true;

				} else if (data.notAuthed){
					UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
						{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
					]);
				} else {
					UI.erreur("Un problème du serveur est survenu, réessayez");
				}
			}).catch(function(err){
				$('.loader').removeClass('opened');
				$('.activate').css({'opacity':'1'});
				UI.offlineMsg(app, err);
			});
		},
		addArticle = e => {
			e.preventDefault();
			if (!isNaN(parseFloat($('#addArticle #prix').val().replace(',','.')))) {
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur/push.php",
					data: {
						submitArticle: true,
						titre: $('#addArticle #titreA').val(),
						prix: $('#addArticle #prix').val().replace(',','.') * $('#quantA').val(),
						groupe: app.usedGroupe.id
					}
				}).then(data => {
					$('.loader').removeClass('opened');
					if(data.status == 200){
						UI.acc(app);

						if (!app.course.started) $('.activate').click();

						$('html, body').animate({scrollTop: 0}, 30);
						$('#panier ul').prepend(Generate.article(app, data.id, data.titre, data.prix));
				
						app.totalPP(data.prix);
						$('#addArticle #titreA, #addArticle #prix').val('');
						$('#quantA').val(1);

						setTimeout(function(){
							$('.article').removeClass('animateSlideIn');
						},300);


						app.course.items.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
						idbStorage.put("courses", app.course.export());
		

					} else if (data.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
					}
				})
				.catch(err => {
					$('.loader').removeClass('opened');
					UI.offlineMsg(app, err);
				});
			}
			else{
				alert('Prix de l\'article non conforme');
			}
		},
		addPreview = e => {
			e.preventDefault();
			if ($('#addPreview #titreP').val() && $('#addPreview #titreP').val() != '') {
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur/push.php",
					data: { submitPreview: 'true', titre: $('#addPreview #titreP').val(), groupe: app.usedGroupe.id }
				}).then(data => {
					$('.loader').removeClass('opened');
					if(data.status == 200){	
						UI.acc(app);
						if (!app.course.started) {
							$('.activate').eq(1).after(Generate.preview(app, data.id, data.titre, data.color));
						}
						else{
							$('html, body').animate({scrollTop: 0}, 30);
							$('#liste ul').prepend(Generate.preview(app, data.id, data.titre, data.color));
						}
						$('#addPreview #titreP').val('');
						setTimeout(function(){
							$('.preview').removeClass('animateSlideIn');
						},300);


						app.course.items.previews.unshift({id: data.id, titre: data.titre, color: data.color});
						idbStorage.put("courses", app.course.export());
						
					} else if (data.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
					}
				}).catch(err => {
					$('.loader').removeClass('opened');
					UI.offlineMsg(app, err);
				});
			}
			else
			{
				alert('Il faut donner un nom à l\'article 😑');
			}
		},
		buyForm = e => {
			e.preventDefault();
			if (!isNaN(parseFloat( $('#prices #newPrice').val().replace(',','.')))) {
				let idPreview = document.getElementById('prices').getAttribute('key'),
					prix = $('#prices #newPrice').val().replace(',','.') * $('#quantP').val();
					$('#quantP').val(1);
				app.buy(idPreview, prix);
			} else alert('Il faux rentrer un prix numérique')
		},
		buyLi = e => {
			let idPreview = document.getElementById('prices').getAttribute('key'),
				prix = app.liPrices[$(e.target).index()];
			app.buy(idPreview, prix);
		},
		addCourse = e => {
			e.preventDefault();
			if (!isNaN(parseFloat( $('#addCourse #maxPrice').val().replace(',','.')))) {
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur/push.php",
					data: {
						submitCourse: true,
						titre: $('#addCourse #titreC').val(),
						maxPrice: $('#addCourse #maxPrice').val().replace(',','.'),
						taxes: $('#addCourse #cTaxes').val().replace(',','.'),
						groupe: app.usedGroupe.id
					}
				}).then(function(data){
					$('.loader').removeClass('opened');
					if(data.status == 200){
						history.replaceState({key:'createCourse'}, '','index.php');

						LocalStorage.setItem('usedCourse', null);
						document.querySelector('.loader').classList.add('opened');
						if(!app.pending){
							app.pull("refresh").then(() => {
								UI.acc(app);
								$('#addCourse #titreC, #addCourse #maxPrice').val('');
							});
						} else {
							let loop = setInterval(() => {
								if(!app.pending){
									document.querySelector('.loader').classList.add('opened');
									app.pull("refresh").then(() => {
										UI.acc(app);
										$('#addCourse #titreC, #addCourse #maxPrice').val('');
									});
									clearInterval(loop);
								}
							}, 1000);
						}
					} else if (data.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
					} else if (data.status == 403){
						UI.erreur('Erreur',"Le groupe demandé est innaccessible depuis votre compte");
					}
				}).catch(function(err){
					$('.loader').removeClass('opened');
					UI.offlineMsg(app, err);
				});

			} else {
				alert('Prix de l\'article non conforme');
			}
		},
		addGroupe = e => {
			e.preventDefault();
			if ($('#addGroupe #titreG').val() && $('#addGroupe #titreG').val() != '') {
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur/push.php",
					data: { newGroupe: true, titre: $('#addGroupe #titreG').val() }
				}).then(data => {
					$('.loader').removeClass('opened');
					if(data.status == 200){
						$('#addGroupe #titreG').val("");
						LocalStorage.clear();
						UI.closeForms();
						document.querySelector('.loader').classList.add('opened');
						refresh();
					}else if(data.status == 400 && data.err && data.err == 'length'){
						alert("La longeur du titre d'un groupe doit être comprise entre 2 et 20 charactères");
					} else if (data.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
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
		},
		invitation = e => {
			e.preventDefault();
			if ($('#invitation #nomInv').val() && $('#invitation #nomInv').val() != '') {
				if ($('#invitation #keyInv').val() && $('#invitation #keyInv').val() != '') {
			
					$('.loader').addClass('opened');
					$.ajax({
						method: "POST",
						url: "serveur/invites.php",
						data: { invite: true, nom: $('#invitation #nomInv').val(), key:  $('#invitation #keyInv').val(), groupe: app.usedGroupe.id }
					}).then(function(data){
						$('.loader').removeClass('opened');
						if(data.status == 200){
							$('#invitation #nomInv').val('');
							$('#invitation #keyInv').val('');
							UI.closeForms();
							UI.message('Réussi', "L'invitation est envoyée, surveillez les paramètres de l'invité", [
								{ texte:"C'est noté", action : () => UI.closeMessage()}
							]);
						} else if (data.notAuthed){
							UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
								{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
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
		};


	// Touch events

	var swipeSurface = document.getElementById('touchSurface'); // Swipe touch surface
	swipedetect(swipeSurface, function(swipedir){
		if($('body').hasClass('bodyPreview')){
			if (swipedir == 'right'){
				app.setSwipe(0);
			}
			else{
				$('#panier ul').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':'translateX(-100vw)'});
				$('#liste ul').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});
			}
		}
		else{
			if (swipedir == 'left'){
				app.setSwipe(1);
			}
			else{
				$('#panier ul').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});
				$('#liste ul').css({'transition':'all 250ms cubic-bezier(0.1,0.9,0,1)', 'transform':'translateX(100vw)'});
			}
		}


		$('header h1').css({'transition':'all 100ms cubic-bezier(0.1,0.9,0,1)', 'transform':'translateX(0px)'});
		$('#add, #refresh').css({'transition':'all 100ms cubic-bezier(0.1,0.9,0,1)', 'transform':''});

		setTimeout(function(){
			$('#calcul').css({'transform': '', 'transition':'', 'display':''});
			$('header h1, #add').css({'transition':'', 'transform':''});
		},300);
	});

	var btTouchSurface = document.getElementById('btTouchSurf'); // Open calcul pane surface
	SwipeBtPanel(btTouchSurface, dir => {
		$('#calcul').css({'height':'', 'transition':''});
		if (dir == 'top') {
			UI.openMenus('calcul');
			$('#backTouchSurf').css({'visibility':'visible'});
			$('#btTouchSurf').css({'visibility':'hidden'});
		}
		else if(dir == 'bottom'){
			UI.closeMenus();
			$('#backTouchSurf').css({'visibility':'hidden'});
			$('#btTouchSurf').css({'visibility':'visible'});
		}
	});

	var backTouchSurface = document.getElementById('backTouchSurf'); // Close calcul pane surface
	SwipeBackPanel(backTouchSurface, function(dir){
		$('#calcul').css({'height':'', 'transition':''});
		if (dir == 'top') {
			UI.openMenus('calcul');
			$('#backTouchSurf').css({'visibility':'visible'});
			$('#btTouchSurf').css({'visibility':'hidden'});
		}
		else if(dir == 'bottom'){
			UI.closeMenus();
			$('#backTouchSurf').css({'visibility':'hidden'});
			$('#btTouchSurf').css({'visibility':'visible'});
		}
	});




	// Parametres

	document.getElementById('params').addEventListener('click', e => {
		if(e.target.classList.contains('ms-Icon--Back')){
			UI.closeMenus();
			if(window.innerWidth < 900) UI.openMenus('mainMenu')
		}
		else if(e.target.id == "deconnect") {

			$.ajax({
				method: 'POST',
				url: 'serveur/auth.php',
				data: { deconnect: true }
			}).then(data => {
				if(data.status == 200){
					LocalStorage.clear();
					idbStorage.deleteDb()
						.then(() => {
							window.location = "/";
						})
						.catch(err => {
							console.log(err);
							alert("Des données locales n'ont pas pu être supprimées. Ceci peut être fait en supprimant les données de site dans les paramêtres de votre navigateur");
							window.location = "/";
						});
				} else {
					UI.erreur("Erreur","Il y a eu un problème inattendu lors de la tentative de déconnection");
				}
			}).catch(() => {
				UI.offlineMsg(app);
			});
			
		} else if (e.target.id == "supprCompte") UI.modal(app, 'deleteAll')
		else if (e.target.id == 'generateId') app.generateInviteKey()
		else if (e.target.id == 'newgroupe') UI.openAddGroup()
		else if (e.target.parentNode.tagName == "BUTTON"){
			if(e.target.classList.contains('ms-Icon--Leave')) UI.modal(app, 'leaveGroupe')
			else if(e.target.classList.contains('ms-Icon--AddFriend')) UI.promptAddFriend(app)
		} else if (e.target.parentNode.id == "invitations"){
			if(e.target.tagName == "BUTTON") Pull.invitations(app)
		}
	});

	document.querySelector('#params').addEventListener('change', e => {
		if(e.target.id === 'currency'){
			if(LocalStorage.getItem('currency')){
				LocalStorage.setItem('currency',"");
			} else {
				LocalStorage.setItem('currency',"$");
			}
			app.setParameters();
		} else if (e.target.id === 'theme') {
			UI.toggleTheme();
		}
	});
	
	$('.menu i.ms-Icon--Settings').click(function(){
		UI.openMenus('params');
	});


	// Modal

	document.getElementById('modal').addEventListener('click', e => {
		if(e.target.classList.contains("back")) UI.closeModal()
		else if (e.target.classList.contains("leaveGrp")) app.leaveGrp()
		else if (e.target.classList.contains("lienParams")) UI.openMenus('params')
		else if (e.target.classList.contains("supprConf")) app.deleteUser()
		else if (e.target.classList.contains("supprConfCourse") && document.getElementById("deleteCourse").getAttribute("idCourse")){
			app.deleteCourse(document.getElementById("deleteCourse").getAttribute("idCourse"));
			document.getElementById('deleteCourse').removeAttribute("idCourse");
		}
	});




	// Main content
	
	$(document).on('click', '#add.closed',function(){
		if ($('body').hasClass('bodyPreview')) UI.addPreview()
		else UI.addArticle()
	});

	Array.from(document.getElementsByClassName('main')).forEach(el => {
		el.addEventListener('click', e => {
			if(e.target.classList.contains('adder')){
				if(el.id == "panier") UI.addArticle()
				else UI.addPreview()
			} else if(e.target.classList.contains('noCourse') || e.target.parentNode.classList.contains('noCourse')) UI.openMenus('mainMenu')
			else if(e.target.classList.contains('activate')) activate();
			else if(e.target.parentNode.classList.contains('article') || e.target.classList.contains('article')){
				let article = e.target.tagName == "LI" ? e.target : e.target.parentNode;
				UI.hideOptions();
				setTimeout(() => UI.showOptions(app, "article", article), 50);
				
			}else if(e.target.parentNode.classList.contains('preview') || e.target.classList.contains('preview')){
				let preview = e.target.tagName == "LI" ? e.target : e.target.parentNode;
				UI.hideOptions();
				setTimeout(() => UI.showOptions(app, "preview", preview), 50);
				
			} else if (e.target.parentNode.classList.contains('options')){
				if(e.target.classList.contains('ms-Icon--Cancel')){
					UI.hideOptions();
				} else if(e.target.classList.contains('ms-Icon--Pinned')) {
					let key = e.target.parentNode.getAttribute('key');
					UI.hideOptions();
					app.pin(key);
				} else if(e.target.parentNode.parentNode.id == "panier") {
					if(e.target.classList.contains('ms-Icon--Delete')){
						let key = e.target.parentNode.getAttribute('key');
						UI.hideOptions();
						app.deleteArticle(key);
					}
				} else if(e.target.parentNode.parentNode.id == "liste") {
					if(e.target.classList.contains('ms-Icon--Delete')){
						let key = e.target.parentNode.getAttribute('key');
						UI.hideOptions();
						app.deletePreview(key);
					} else if (e.target.classList.contains('ms-Icon--Shop')){
						let key = e.target.parentNode.getAttribute('key');
						UI.hideOptions();
						UI.addPrice(app, key);
					}
				} 
			}
		});
	});




	// Header

	Array.from(document.getElementsByTagName('header')).forEach(el => {
		el.addEventListener('click', e => {
			if(el.classList.contains('phones')){
				if(e.target.tagName == "I") UI.openMenus('mainMenu')
			} else if(el.classList.contains('tablet')) {
				if(e.target.classList.contains('ms-Icon--GlobalNavButton')) UI.openMenus('mainMenu')
				else if(e.target.classList.contains('ms-Icon--Settings')) UI.openMenus('params')
				else if(e.target.classList.contains('ms-Icon--Calculator')) UI.openMenus('calcul')
				else if(e.target.classList.contains('ms-Icon--BarChartVertical')){
					let calcul = document.querySelector('#calcul');
					if(calcul.classList.contains('opened')) calcul.classList.remove('opened')
					else calcul.classList.add('opened');
				} else if(e.target.id == 'headRefresh') {
					refresh();
				}
			}
		});
	});




	// Forms

	document.getElementById('forms').addEventListener('click', e => {
		if (e.target.tagName == "I" && e.target.classList.contains("ms-Icon--Back")){
			if(e.target.parentNode.id == "prices") UI.closePrice()
			else UI.closeForms()
		} else if(document.getElementById('prices').contains(e.target)) {
			if(e.target.tagName == "LI") buyLi(e)
		} else if (e.target.id == "forms") UI.closeForms()
	});

	document.getElementById('forms').addEventListener('submit', e => {
		switch(e.target.parentNode.id){
			case "addArticle": 
				if(e.target.tagName == "FORM") addArticle(e)
				break;
			case "addPreview" :
				if(e.target.tagName == "FORM") addPreview(e)
				break;
			case "prices" :
				if(e.target.tagName == "FORM") buyForm(e)
				break;
			case "addCourse" :
				if(e.target.tagName == "FORM") addCourse(e)
				break;
			case "addGroupe" :
				if(e.target.tagName == "FORM") addGroupe(e)
				break;
			case "invitation" :
				if(e.target.tagName == "FORM") invitation(e)
				break;
		}
	});

	let inputsForms = new Array(
		Array.from(document.querySelectorAll('#addArticle input')),
		Array.from(document.querySelectorAll('#addCourse input')),
		Array.from(document.querySelectorAll('#prices > input'))
	);

	inputsForms.forEach(inputsList => {
		inputsList.forEach((input, index) => {
			input.addEventListener('keypress', e => {
				if(index < inputsList.length-2 && (e.which == 13 || e.keyCode == 13 || e.key == 13)){
					e.preventDefault();
					inputsList[index+1].focus();
				}
			})
		});
	});



	// Menus

	document.getElementById('menus').addEventListener('click', e => {
		if(e.target.classList.contains('ms-Icon--Settings')){}
		else if(e.target.parentNode.classList.contains('menu') && e.target.tagName == "I") UI.closeMenus()
		else if(e.target.id == "newCourse") UI.addCourse()
		else if(e.target.parentNode.id == "calcul" && e.target.tagName == "I") UI.closeMenus()
		else if(e.target.classList.contains('course')) {
			let id = e.target.getAttribute("dbIndex");
			if(id){
				open(() => UI.acc(app), null, id);
			}
		} else if(e.target.parentNode.classList.contains('course') && e.target.tagName == "I") {
			let id = e.target.parentNode.getAttribute("dbIndex");
			if(id) UI.modal(this, 'deleteCourse', id);
		} else if (e.target.id == "menus") UI.closeMenus()
	});



	// Others

	document.getElementById('refresh').onclick = e => {
		let i = e.currentTarget.children[0];
		document.querySelector('.loader').classList.add('opened');
		if(!app.pending){
			document.querySelector('.loader').classList.remove('opened');
			i.classList.add('rotate');
			app.pull("refresh").then(() => i.classList.remove('rotate'));
		} else {
			let loop = setInterval(() => {
				if(!app.pending){
					document.querySelector('.loader').classList.remove('opened');
					i.classList.add('rotate');
					app.pull("refresh").then(() => i.classList.remove('rotate'));
					clearInterval(loop);
				}
			}, 1000);
		}
	};

	$('.install i').click(function(){
		UI.hideInstall();
	});




	// Context Events
	document.addEventListener("visibilitychange", ()=>{
		if (document.visibilityState == "visible") noLoaderRefresh()
	});
	window.addEventListener('online', () => noLoaderRefresh());

}