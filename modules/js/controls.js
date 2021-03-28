import Pull from './requests.js';
import UI from './UI.js';
import { LocalStorage, IndexedDbStorage } from './storage.js';
import Generate from './generate.js';


export default function initEvents(app){

	const refresh = (callback, idGroupe, idCourse) => {
		callback = callback || function(){};
		document.querySelector('.loader').classList.add('opened');
		if(!app.pending){
			app.pull("refresh", idGroupe, idCourse).then(callback);
		} else {
			let loop = setInterval(() => {
				if(!app.pending){
					document.querySelector('.loader').classList.remove('opened');
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
						document.querySelector('.loader').classList.remove('opened');
						app.pull("open", idGroupe, idCourse).then(callback);
						clearInterval(loop);
					}
				}, 1000);
			}
			},
		noLoaderRefresh = () => {
			console.log(app);
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
			document.getElementsByClassName('loader')[0].classList.add('opened');
			$('.promptActivation').css({'opacity':'0.8'});
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: { activate: true, groupe: app.usedGroupe.id }
			}).then(data => {
				$('.loader').removeClass('opened');
				setTimeout(function(){
					app.buttons = "show";
					$('.promptActivation').css({'transition':'all 200ms ease-out 200ms', 'opacity':'0','transform':'scale(0.98)'});
					setTimeout(function(){
						$('.promptActivation').css({'display':'none'});
					}, 420);	
				},400);
				setTimeout(function(){
					UI.openPanel("panier");
				},200);

				IndexedDbStorage.get("courses", app.course.id)
					.then(storage => {
						storage.dateStart = data.time;
					});
				app.course.started = true;

			}).catch(res => {
				if (res.responseJSON && res.responseJSON.notAuthed){
					UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
						{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
					]);
				} else { // TODO
					UI.erreur("Un problème sur le serveur est survenu, réessayez");
				document.getElementsByClassName('loader')[0].classList.remove('opened');
					$('.promptActivation').css({'opacity':'1'});
					UI.offlineMsg(app, err);
				}
			});
		},
		addArticle = e => {
			e.preventDefault();
			let inputPrice = document.querySelector('#modernArticleAdder #prix'),
				inputTitre = document.querySelector('#modernArticleAdder #titreA'),
				inputQuantity = document.getElementById("quantA");
			if (!isNaN(parseFloat(inputPrice.value.replace(',','.'))) && inputTitre.value && inputQuantity) {
				if ('serviceWorker' in navigator && 'SyncManager' in window) {
					IndexedDbStorage.put("requests", {
						type: "article",
						data: {
							titre: inputTitre.value,
							prix: inputPrice.value.replace(',','.') * inputQuantity.value,
							groupe: app.usedGroupe.id,
							color: app.user.color
						}
					})
					.then(res => IndexedDbStorage.get("requests", res))
					.then(res => {
						const data = res.data;
						UI.acc(app);

						window.scrollTo({ top: 0, behavior: 'smooth' });
						app.course.pushArticle(app, {
							id: -res.reqId,
							titre: data.titre,
							color: data.color,
							prix: data.prix
						});

						[inputPrice, inputTitre].forEach(el => el.value = '');
						inputQuantity.value = 1;

						return navigator.serviceWorker.ready
					})
					.then(reg => reg.sync.register('syncCourses'))
					.catch(err => {
						console.log(err);
						UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
					});;
					
					
				} else {
					document.getElementsByClassName('loader')[0].classList.add('opened');
					$.ajax({
						method: "POST",
						url: "serveur/push.php",
						data: {
							submitArticle: true,
							titre: $('#modernArticleAdder #titreA').val(),
							prix: $('#modernArticleAdder #prix').val().replace(',','.') * $('#quantA').val(),
							groupe: app.usedGroupe.id
						}
					}).then(data => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						UI.acc(app);

						window.scrollTo({ top: 0, behavior: 'smooth' });
						$('#panier ul').prepend(Generate.article(app, data.id, data.titre, data.color, data.prix));
				
						app.total += data.prix;
						Array.from(document.querySelectorAll('#modernArticleAdder input')).slice(0,2).forEach(el => el.value = '');
						document.getElementById('quantA').value = 1;

						setTimeout(() => {
							document.getElementsByClassName('article')[0].classList.remove('animateSlideIn');
						},300);


						app.course.items.articles.unshift({id: data.id, titre: data.titre, color: data.color, prix: data.prix});
						IndexedDbStorage.put("courses", app.course.export());

					})
					.catch(res => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						if (res.responseJSON && res.responseJSON.notAuthed){
							UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
								{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
							]);
						} else if(res.status == 400 && res.responseJSON && res.responseJSON.indexOf("Negative value") > -1){
							UI.erreur("Le prix doit être positif")
						} else {
							UI.offlineMsg(app, res);
						}
					});
				}
			}
			else{
				alert('Prix de l\'article non conforme');
			}
		},
		addPreview = e => {
			e.preventDefault();
			let input = document.querySelector('#modernPreviewAdder #titreP');
			if (input.value && input.value != '') {
				if ('serviceWorker' in navigator && 'SyncManager' in window) {
					IndexedDbStorage.put("requests", {
						type: "preview",
						data: { titre: input.value, color: app.user.color, groupe: app.usedGroupe.id }
					})
					.then(res => IndexedDbStorage.get("requests", res))
					.then(res => {
						const data = res.data;
						UI.acc(app);
						
						window.scrollTo({ top: 0, behavior: 'smooth' });
						app.course.pushPreview({
							id: -res.reqId,
							titre: data.titre,
							color: data.color
						});
					
						input.value = '';

						return navigator.serviceWorker.ready
					})
					.then(reg => reg.sync.register('syncCourses'))
					.catch(err => {
						console.log(err);
						UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
					});
					
					
				} else {
					document.getElementsByClassName('loader')[0].classList.add('opened');
					$.ajax({
						method: "POST",
						url: "serveur/push.php",
						data: { submitPreview: 'true', titre: input.value, groupe: app.usedGroupe.id }
					}).then(data => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						UI.acc(app);
						
						window.scrollTo({ top: 0, behavior: 'smooth' });
						document.querySelector('#liste ul').prepend(Generate.preview(data.id, data.titre, data.color));
						
						input.value = '';
						setTimeout(() => {
							document.getElementsByClassName('preview')[0].classList.remove('animateSlideIn');
						},300);


						app.course.items.previews.unshift({id: data.id, titre: data.titre, color: data.color});
						IndexedDbStorage.put("courses", app.course.export());
						
					}).catch(res => {
						if (res.responseJSON && res.responseJSON.notAuthed){
							UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
								{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
							]);
						} else {
							document.getElementsByClassName('loader')[0].classList.remove('opened');
							UI.offlineMsg(app, err);
						}
					});
				}
			}
			else
			{
				alert('Il faut donner un nom à l\'article 😑');
			}
		},
		buyForm = e => {
			e.preventDefault();
			if (!isNaN(parseFloat(document.querySelector('#modernBuyer #newPrice').value)) && !isNaN(parseFloat(document.querySelector('#modernBuyer #quantP').value))) {
				let idPreview = document.getElementById('modernBuyer').getAttribute('key'),
					prix = document.querySelector('#modernBuyer #newPrice').value.replace(',','.') * document.getElementById('quantP').value;
				document.querySelector('#quantP').value = 1;
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
			if (!isNaN(parseFloat( $('#modernCourseAdder #maxPrice').val().replace(',','.')))) {
				document.getElementsByClassName('loader')[0].classList.add('opened');
				$.ajax({
					method: "POST",
					url: "serveur/push.php",
					data: {
						submitCourse: true,
						titre: $('#modernCourseAdder #titreC').val(),
						maxPrice: $('#modernCourseAdder #maxPrice').val().replace(',','.'),
						taxes: $('#modernCourseAdder #cTaxes').val().replace(',','.'),
						groupe: app.usedGroupe.id
					}
				}).then(() => {
					document.getElementsByClassName('loader')[0].classList.remove('opened');
					history.replaceState({key:'createCourse'}, '','index.php');

					LocalStorage.setItem('usedCourse', null);
					document.querySelector('.loader').classList.remove('opened');
					if(!app.pending){
						app.pull("refresh").then(() => {
							UI.acc(app);
							Array.from(document.querySelectorAll('#modernCourseAdder input')).slice(0,2).forEach(el => el.value = '');
						});
					} else {
						let loop = setInterval(() => {
							if(!app.pending){
								document.querySelector('.loader').classList.remove('opened');
								app.pull("refresh").then(() => {
									UI.acc(app);
									Array.from(document.querySelectorAll('#modernCourseAdder input')).slice(0,2).forEach(el => el.value = '');
								});
								clearInterval(loop);
							}
						}, 1000);
					}
				}).catch(res => {
					document.querySelector('.loader').classList.remove('opened');
					if (res.responseJSON && res.responseJSON.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
					} else if (res.status == 403){
						UI.erreur('Erreur',"Le groupe demandé est innaccessible depuis votre compte");
					} else {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						UI.offlineMsg(app, err);
					}
				});

			} else {
				alert('Prix de l\'article non conforme');
			}
		},
		addGroupe = e => {
			e.preventDefault();
			if ($('#addGroupe #titreG').val() && $('#addGroupe #titreG').val() != '') {
				document.getElementsByClassName('loader')[0].classList.add('opened');
				$.ajax({
					method: "POST",
					url: "serveur/push.php",
					data: { newGroupe: true, titre: $('#addGroupe #titreG').val() }
				}).then(data => {
				document.getElementsByClassName('loader')[0].classList.remove('opened');
					$('#addGroupe #titreG').val("");
					LocalStorage.clear();
					UI.closeForms();
					document.querySelector('.loader').classList.remove('opened');
					refresh();
				}).catch(res => {
				document.getElementsByClassName('loader')[0].classList.remove('opened');
					if (res.status == 400 && res.responseJSON && res.responseJSON.err && res.responseJSON.err == 'length'){
						alert("La longeur du titre d'un groupe doit être comprise entre 2 et 20 charactères");
					} else if (res.responseJSON && res.responseJSON.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
					} else {
						$('.loader').removeClass('opened');
						UI.offlineMsg(app, res);
					}
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
			
					document.getElementsByClassName('loader')[0].classList.add('opened');
					$.ajax({
						method: "POST",
						url: "serveur/invites.php",
						data: { invite: true, nom: $('#invitation #nomInv').val(), key:  $('#invitation #keyInv').val(), groupe: app.usedGroupe.id }
					}).then(function(data){
						$('.loader').removeClass('opened');
							$('#invitation #nomInv').val('');
							$('#invitation #keyInv').val('');
							UI.closeForms();
							UI.message('Réussi', "L'invitation est envoyée, surveillez les paramètres de l'invité", [
								{ texte:"C'est noté", action : () => UI.closeMessage()}
							]);
				
					}).catch(res => {
						$('.loader').removeClass('opened');
						if (res.responseJSON && res.responseJSON.notAuthed){
							UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
								{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
							]);
						} else if(res.status == 403) {
							UI.erreur('Erreur',"Impossible d'envoyer l'invitation, l'invité est déja membre du groupe ou bien est déja invité à le rejoindre");
						} else if(res.status == 404 && res.responseJSON && res.responseJSON == {err: "No User Found"}) {
							UI.erreur('Erreur',"Les informations entrées ne correspondent à aucun utilisateur, réessayez");
						} else UI.offlineMsg(app, res);
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




	// Service Worker
	if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
		const messageChannel = new MessageChannel();
		navigator.serviceWorker.controller.postMessage({
			type: 'INIT_PORT',
		}, [messageChannel.port2]);
		
		messageChannel.port1.onmessage = (event) => {
			const res = event.data.payload;
			switch(res.type){
				case "updPreview":
					const previewUi = document.querySelector(`.preview[iditem="${-res.id}"]`);
					if(previewUi) {
						previewUi.setAttribute("iditem", res.item.id);
						previewUi.classList.remove('sync');
					}
					app.course.items.previews.forEach(preview => {
						if(preview.id == -res.id) preview.id = res.item.id
					});
					break;
				case "updArticle":
					const articleUi = document.querySelector(`.article[iditem="${-res.id}"]`);
					if(articleUi) {
						articleUi.setAttribute("iditem", res.item.id);
						articleUi.classList.remove('sync');
					}
					app.course.items.articles.forEach(article => {
						if(article.id == -res.id) article.id = res.item.id
					});
					break;
				case "buy":
					const buyedUi = document.querySelector(`.article[iditem="${-res.id}"]`);
					if(buyedUi) {
						buyedUi.setAttribute("iditem", res.item.id);
						buyedUi.classList.remove('sync');
					}
					app.course.items.articles.forEach(article => {
						if(article.id == -res.id) article.id = res.item.id
					});
					break;
				case "deleteArticleSetTotal":
					app.total -= res.prix
			}
		};
	}
	


	// Parametres

	document.getElementById('params').addEventListener('click', e => {
		if(e.target.classList.contains('ms-Icon--Back')){
			UI.closeMenus();
		}
		else if(e.target.id == "deconnect") {

			$.ajax({
				method: 'POST',
				url: 'serveur/auth.php',
				data: { deconnect: true }
			}).then(data => {
				if(data.status == 200){
					LocalStorage.clear();
					IndexedDbStorage.deleteDb()
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
		} /* else if (e.target.id === 'theme') {
			UI.toggleTheme();
		} */
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
	Array.from(document.getElementsByClassName('main')).forEach(el => {
		/* el.addEventListener('pointerdown', e => {
			if(e.target.classList.contains('adder') || e.target.parentNode.classList.contains('adder')){
				if(el.id == "panier") UI.addArticle(e.clientX, e.clientY)
				else UI.addPreview(e.clientX, e.clientY)
			}
		}); */

		el.addEventListener('click', e => {
			if(e.target.classList.contains('adder') || e.target.parentNode.classList.contains('adder')){
				if(el.id == "panier") UI.openModernForm("article")
				else UI.openModernForm("preview")
			} else if(e.target.classList.contains('noCourse')) UI.openPanel('menu')
			else if(e.target.classList.contains('activate')) activate();
			else if(e.target.parentNode.parentNode.classList.contains('article') || e.target.parentNode.classList.contains('article') || e.target.classList.contains('article')){
				let article = e.target.tagName == "LI" ? e.target : (e.target.tagName == "DIV" ? e.target.parentNode : e.target.parentNode.parentNode);
				UI.hideOptions();
				if(!app.course.old) setTimeout(() => UI.showOptions(app, "article", article), 50);
				
			}else if(e.target.parentNode.parentNode.classList.contains('preview') || e.target.parentNode.classList.contains('preview') || e.target.classList.contains('preview')){
				let preview = e.target.tagName == "LI" ? e.target : (e.target.tagName == "DIV" ? e.target.parentNode : e.target.parentNode.parentNode);
				UI.hideOptions();
				if(!app.course.old) setTimeout(() => UI.showOptions(app, "preview", preview), 50);
				
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


	// Menubar
	document.getElementById("menubar").addEventListener('click', event => {
		if(event.target.tagName == "IMG" || event.target.getAttribute("linkTo") == "menu") {
			if(window.innerWidth < 900) UI.openPanel('menu')
			else UI.openPanel('menu', app.chartContent, app)
		}
		else if(event.target.getAttribute("linkTo") == "panier" || event.target.parentNode.getAttribute("linkTo") == "panier") UI.openPanel('panier')
		else if(event.target.getAttribute("linkTo") == "liste" || event.target.parentNode.getAttribute("linkTo") == "liste") UI.openPanel('liste')
		else if(event.target.getAttribute("linkTo") == "calcul" || event.target.parentNode.getAttribute("linkTo") == "calcul") UI.openPanel('calcul', app.chartContent, app)
	});


	// Header

	Array.from(document.getElementsByTagName('header')).forEach(el => {
		el.addEventListener('click', e => {
			/* if(el.classList.contains('phones')){
				if(e.target.tagName == "I") UI.openMenus('mainMenu')
			} else */ if(el.classList.contains('tablet')) {
				if(e.target.classList.contains('ms-Icon--GlobalNavButton')) UI.openMenus('mainMenu')
				else if(e.target.classList.contains('ms-Icon--Settings')) UI.openMenus('params')
				else if(e.target.classList.contains('ms-Icon--Calculator')) UI.openMenus('calcul', app.chartContent, app)
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

	document.getElementById('modernForms').addEventListener('click', e => {
		if(e.target.parentNode.classList.contains("modernFormTitle") ){
			UI.closeModernForms();
		}
	});

	document.getElementById('modernForms').addEventListener('submit', e => {
		switch(e.target.parentNode.id){
			case "modernArticleAdder": 
				if(e.target.tagName == "FORM") addArticle(e)
				break;
			case "modernPreviewAdder": 
				if(e.target.tagName == "FORM") addPreview(e)
				break;
			case "modernCourseAdder": 
				if(e.target.tagName == "FORM") addCourse(e)
				break;
			case "modernBuyer": 
				if(e.target.tagName == "FORM") buyForm(e)
				break;
		}
	});

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
		Array.from(document.querySelectorAll('#modernBuyer input')),
		Array.from(document.querySelectorAll('#modernArticleAdder input')),
		Array.from(document.querySelectorAll('#modernCourseAdder input'))
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
		if(e.target.parentNode.id == "calcul" && e.target.tagName == "I") UI.closeMenus()
		else if (e.target.id == "menus") UI.closeMenus()
	});

	// MainPanel
	/* document.getElementById('mainPanel').addEventListener('pointerdown', e => {
		if(e.target.id == "newCourse") UI.addCourse(e.clientX, e.clientY)
	}); */

	document.getElementById('mainPanel').addEventListener('click', event => {
		if(event.target.classList.contains('ms-Icon--Settings')) UI.openMenus('params')
		else if(event.target.id == "newCourse") UI.addCourse()
		else if(event.target.classList.contains('course')) {
			let id = event.target.getAttribute("dbIndex");
			if(id){
				open(null, null, id);
			}
		}
		else if(event.target.parentNode.classList.contains('course') && event.target.tagName == "I") {
			let id = event.target.parentNode.getAttribute("dbIndex");
			if(id) UI.modal(this, 'deleteCourse', id);
		}
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

	window.addEventListener("offline", event => {
		UI.message(
			"Vous êtes hors ligne", 
			"Certaines fonctionnalités seront limités, vos modifications seront synchronisées ulterieurement",
			null, 3000)
	});

	window.addEventListener("online", event => {
		UI.message(
			"Vous êtes de nouveau en ligne", 
			"Nous synchronisons vos données",
			null, 2000)
	});




	// Context Events
	document.addEventListener("visibilitychange", ()=>{
		if (document.visibilityState == "visible") noLoaderRefresh()
	});
	//window.addEventListener('online', () => noLoaderRefresh());

}