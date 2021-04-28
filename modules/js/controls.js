import Pull from './requests.js';
import UI from './UI.js';
import { LocalStorage, IndexedDbStorage } from './storage.js';
import Generate from './generate.js';
import { fetcher } from './tools.js';


export default function initEvents(app){

	const refresh = (callback, idGroupe, idCourse) => {
		callback = callback || function(){};
			if(!app.pending){
				app.pull("refresh", idGroupe, idCourse).then(callback);
			} else {
				let loop = setInterval(() => {
					if(!app.pending){
						app.pull("refresh", idGroupe, idCourse).then(callback);
						clearInterval(loop);
					}
				}, 1000);
			}
		},
		refreshAsync = async (idGroupe, idCourse) => {
			return app.queue.enqueue(() => app.pull("refresh", idGroupe, idCourse));
			/* if(!app.pending){
				const pullRes = await app.pull("refresh", idGroupe, idCourse);
				return pullRes;
			} else {
				let loop = setInterval(() => {
					if(!app.pending){
						const pullRes = await app.pull("refresh", idGroupe, idCourse);
						clearInterval(loop);
						return pullRes;
					}
				}, 1000);
			} */
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
		openAsync = async () => {
			LocalStorage.removeItem("usedGroupe");
			LocalStorage.removeItem("usedCourse");
			return app.queue.enqueue(() => app.pull("open"));
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
			if ('serviceWorker' in navigator && 'SyncManager' in window) {
				IndexedDbStorage.put("requests", {
					type: "activate",
					data: { groupe: app.groupe.id }
				})
				.then(() => navigator.serviceWorker.ready)
				.then(reg => reg.sync.register('syncCourses'))
				.then(() => {
					let latestCourse = app.groupe.courses[0];
					app.course.started = true;
					if(latestCourse){
						latestCourse.dateStart = parseInt(Date.now()/1000);
						return IndexedDbStorage.put("courses", latestCourse) 
					} else throw "Pas de course"	
				})
				.then(() => {
					const activationPanels = Array.from(document.getElementsByClassName('promptActivation'));

					app.course.started = true;

					setTimeout(() => {
						UI.openPanel("panier");
					},200);

					setTimeout(() => {
						app.buttons = "show";
						activationPanels.forEach(node => {
							node.style.transition = 'all 200ms ease-out 200ms';
							node.style.opacity = '0';
							node.style.transform = 'scale(0.98)';
						});
						
						setTimeout(() => {
							activationPanels.forEach(node => {
								node.style.display = 'none';
							});
						}, 400);	
					}, 400);

				})
				.catch(err => {
					console.log(err);
					UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
				});
				
				
			} else {
				document.querySelector('loader').classList.add('opened');
				$('.promptActivation').css({'opacity':'0.8'});
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					data: { activate: true, groupe: app.groupe.id }
				})
				.then(res => {
					if(res.status == 200){
						let latestCourse = app.groupe.courses[0];
						app.course.started = true;
						
						if(latestCourse){
							latestCourse.dateStart = res.payload.time;
							return IndexedDbStorage.put("courses", latestCourse) 
						} else throw "Pas de course"
					}	
				})
				.then(() => {
					document.querySelector('loader').classList.remove('opened');

					const activationPanels = Array.from(document.getElementsByClassName('promptActivation'));
					

					setTimeout(() => {
						UI.openPanel("panier");
					},200);

					setTimeout(() => {
						app.buttons = "show";
						activationPanels.forEach(node => {
							node.style.transition = 'all 200ms ease-out 200ms';
							node.style.opacity = '0';
							node.style.transform = 'scale(0.98)';
						});
						
						setTimeout(() => {
							activationPanels.forEach(node => {
								node.style.display = 'none';
							});
						}, 400);	
					}, 400);

				}).catch(res => {
					if (res.responseJSON && res.responseJSON.notAuthed){
						UI.requireAuth();
					} else { // TODO
						UI.erreur("Un problème sur le serveur est survenu, réessayez");
					document.getElementsByClassName('loader')[0].classList.remove('opened');
						$('.promptActivation').css({'opacity':'1'});
						UI.offlineMsg(app, err);
					}
				});
			}
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
							groupe: app.groupe.id,
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
					fetcher({
						method: "POST",
						url: "serveur/push.php",
						data: {
							submitArticle: true,
							titre: inputTitre.value,
							prix: inputPrice.value.replace(',','.') * inputQuantity.value,
							groupe: app.groupe.id
						}
					}).then(res => {
						const item = res.payload;
						document.getElementsByClassName('loader')[0].classList.remove('opened');
					
						UI.acc(app);

						window.scrollTo({ top: 0, behavior: 'smooth' });
						app.course.pushArticle(app, {
							id: item.id,
							titre: item.titre,
							color: item.color,
							prix: item.prix
						});

						[inputPrice, inputTitre].forEach(el => el.value = '');
						inputQuantity.value = 1;

						IndexedDbStorage.put("items", {
							type: "preview",
							course: app.course.id,
							color: item.color,
							id: item.id,
							prix: item.prix,
							titre: item.titre
						})

					})
					.catch(res => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						if (res.responseJSON && res.responseJSON.notAuthed){
							UI.requireAuth();
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
						data: {
							titre: input.value,
							color: app.user.color,
							groupe: app.groupe.id
						}
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
					fetcher({
						method: "POST",
						url: "serveur/push.php",
						data: {
							submitPreview: true,
							titre: input.value,
							groupe: app.groupe.id
						}
					}).then(res => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						const item = res.payload;
						UI.acc(app);
						
						window.scrollTo({ top: 0, behavior: 'smooth' });
						app.course.pushPreview({
							id: item.id,
							titre: item.titre,
							color: item.color
						});
					
						input.value = '';

						IndexedDbStorage.put("items", {
							type: "article",
							course: app.course.id,
							color: item.color,
							id: item.id,
							prix: item.prix,
							titre: item.titre
						})
						
					}).catch(res => {
						if (res.responseJSON && res.responseJSON.notAuthed){
							UI.requireAuth();
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
		addCourse = e => {
			e.preventDefault();
			const form = e.target;
			if (!isNaN(parseFloat(form.prixMax.value.replace(',','.'))) && form.titre.value) {
				document.getElementsByClassName('loader')[0].classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					data: {
						submitCourse: true,
						titre: form.titre.value,
						maxPrice: form.prixMax.value.replace(',','.'),
						taxes: form.taxes.value.replace(',','.') | "0",
						groupe: app.groupe.id
					}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){	
						const course = res.payload;
						IndexedDbStorage.put("courses", {
							groupe: course.groupe,
							dateStart: course.dateStart,
							id: course.id,
							maxPrice: course.maxPrice,
							nom: course.nom,
							taxes: course.taxes,
							total: course.total
						});
						app.groupe.pushCourse(course);

						UI.acc(app);
						form.titre.value = "";
						form.prixMax.value = "";
						form.taxes.value = "0";

						LocalStorage.setItem('usedCourse', null);
						app.queue.enqueue(() => app.pull("open", null, course.id))
					} else throw res
					
				}).catch(err => {
					console.log(err);
					if (err.status == "Offline") UI.offlineMsg(app);
					else UI.erreur(err.payload? err.payload.title: null)

					if(err.action && err.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
				});

			} else {
				alert('Prix de l\'article non conforme');
			}
		},
		addGroupe = e => {
			e.preventDefault();
			const form = e.target;
			if (form.titre.value && form.titre.value != '') {
				document.querySelector('.loader').classList.remove('opened');
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					data: { newGroupe: true, titre: form.titre.value }
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						form.titre.value = "";
						LocalStorage.clear();
						UI.closeModernForms();
						refreshAsync();
					} else if(res.payload) {
						UI.erreur(res.payload.message);
					}  else throw "La réponse du serveur n'est pas correcte. Redemmarez l'application et réessayez.";
					
				}).catch(err => {
					UI.erreur(err);
				});
			}
			else
			{
				alert('Il faut donner un nom à la course 😑');
			}
		},
		submitInvitation = e => {
			e.preventDefault();
			const form = e.target;
			if (form.nom.value && form.code.value) {
				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/invites.php",
					data: {
						createInvitation: true,
						nom: form.nom.value,
						code:  form.code.value,
						groupe: app.groupe.id 
					}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						form.nom.value = '';
						form.code.value = '';
						UI.closeModernForms();
						UI.message('Envoi réussi', "L'invitation est envoyée, rendez vous dans les paramêtres du destinataire pour confirmer.");
					} else if (res.status == "offline"){
						UI.offlineMsg();
					} else if(res.payload){
						UI.erreur(res.payload.message);
					} else UI.erreur();
				});
			}
			else
			{
				UI.erreur('Veuillez renseigner tous les champs');
			}
		},
		leaveGroupe = e => {
			if(app.groupe && app.groupe.id){
				const groupeId = app.groupe.id;
				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					body: { leaveGroup: 'true', groupe: app.groupe.id }
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						UI.closeModal();
						Promise.all([
							IndexedDbStorage.filterCursorwise("courses", null, null, (course) => {
								if(course.groupe == groupeId) return false;
								return true;
							}),
							IndexedDbStorage.delete("groupes", groupeId)
						]).then(openAsync);
					}
				}).catch(err => {
					console.log(err);
					if (err.responseJSON && err.responseJSON.notAuthed){
						UI.requireAuth();
					} else {
						alert("Le serveur a rencontré un problème");
						UI.offlineMsg(app, err);
					}
				});
			} else UI.erreur("Une erreur est survenue, selectionnez ou créez un groupe dans les paramêtre pour continuer.");
		};




	// Service Worker
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.onmessage = (event) => {
			console.log("event from SW, ", event);
			const res = event.data;
			const payload = res.payload;
			switch(res.type){
				case "DISCONNECT":
					if("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations()
						.then(registrations => Promise.all(registrations.map(reg => reg.unregister())))
						.then(() => window.location = "/courses/");
					else window.location = "/courses/";
					break;
				case "updPreview":
					const previewUi = document.querySelector(`.preview[iditem="${-payload.id}"]`);
					console.log("Corresponding UI element, ", previewUi);
					if(previewUi) {
						previewUi.setAttribute("iditem", payload.item.id);
						previewUi.classList.remove('sync');
					}
					app.course.items.previews.forEach(preview => {
						if(preview.id == -payload.id) preview.id = payload.item.id
					});
					break;
				case "updArticle":
					const articleUi = document.querySelector(`.article[iditem="${-payload.id}"]`);
					console.log("Corresponding UI element, ", articleUi);
					if(articleUi) {
						articleUi.setAttribute("iditem", payload.item.id);
						articleUi.classList.remove('sync');
					}
					app.course.items.articles.forEach(article => {
						if(article.id == -payload.id) article.id = payload.item.id
					});
					break;
				case "buy":
					const buyedUi = document.querySelector(`.article[iditem="${-payload.id}"]`);
					console.log("Corresponding UI element, ", buyedUi);
					if(buyedUi) {
						buyedUi.setAttribute("iditem", payload.item.id);
						buyedUi.classList.remove('sync');
					}
					app.course.items.articles.forEach(article => {
						if(article.id == -payload.id) article.id = payload.item.id
					});
					break;
				case "Error":
					switch(payload.stage){
						case "SubmitPreview":
							UI.erreur("Erreur de synchronisation","Un de vos articles dans votre liste n'a pas pu être correctement synchronisé.")
							break;
						case "SubmitArticle":
							if(payload.err == "NegVal") UI.erreur("Erreur de synchronisation","Le prix d'un de vos achats n'est pas conforme et n'a pas pu être correctement synchronisé.")
							else UI.erreur("Erreur de synchronisation","Un de vos achats n'a pas pu être correctement synchronisé.")
							break;
						case "DeletePreview":
							if(payload.err == "OldCourse") UI.erreur("Erreur de synchronisation","Un article n'a pas pu être supprimé car vous n'êtes pas à jour.")
							if(payload.err == "NotFound") UI.erreur("Erreur de synchronisation","Un article n'a pas pu être supprimé car est introuvable sur le serveur.")
							else UI.erreur("Erreur de synchronisation","Problème de synchronisation.")
							break;
						case "DeleteArticle":
							if(payload.err == "OldCourse") UI.erreur("Erreur de synchronisation","Un achat n'a pas pu être supprimé car vous n'êtes pas à jour.")
							if(payload.err == "NotFound") UI.erreur("Erreur de synchronisation","Un achat n'a pas pu être supprimé car est introuvable sur le serveur.")
							else UI.erreur("Erreur de synchronisation","Problème de synchronisation.")
							break;
						case "Buy":
							if(payload.err == "NegVal") UI.erreur("Erreur de synchronisation","Un article n'a pas pu être acheté car son prix n'est pas conforme.")
							if(payload.err == "NotFound") UI.erreur("Erreur de synchronisation","Un article n'a pas pu être acheté car est introuvable sur le serveur.")
							else UI.erreur("Erreur de synchronisation","Problème de synchronisation.")
							break;
					}
					break;
			}
		};
	}
	


	// Parametres

	document.getElementById('params').addEventListener('click', e => {
		if(e.target.classList.contains('ms-Icon--Back')){
			UI.closeMenus();
		}
		if(e.target.classList.contains('groupe')
			|| e.target.parentNode.classList.contains('groupe')
			|| e.target.parentNode.parentNode.classList.contains('groupe')) { // when clicked on a button
			let btGroupe;
			switch(true){
				case e.target.classList.contains('groupe'):
				btGroupe = e.target;
				break;
				case e.target.parentNode.classList.contains('groupe'):
				btGroupe = e.target.parentNode;
				break;
				case e.target.parentNode.parentNode.classList.contains('groupe'):
				btGroupe = e.target.parentNode.parentNode;
				break;
			}
			
			if(e.target.classList.contains('ms-Icon--Leave')) {
				UI.modal('leaveGroupe', btGroupe.innerHTML);
				return null;
			}
			else if(e.target.classList.contains('ms-Icon--AddFriend')) {
				UI.openModernForm("inviter");
				return null;
			}

			app.queue.enqueue(() => app.pull("open", btGroupe.getAttribute("idGroupe")));
		}
		else if(e.target.id == "deconnect") {

			fetcher({
				method: 'POST',
				url: 'serveur/auth.php',
				data: { deconnect: true }
			}).then(data => {
				if(data.status == 200){
					LocalStorage.clear();
					IndexedDbStorage.closeIDB()
				
						if("serviceWorker" in navigator) {
							navigator.serviceWorker.controller.postMessage({
								type: 'DELETEDB',
							});
							// window.location = "/courses/"; Location changes on message from the SW
						}
			
				} else throw "Offline"
			})
			.catch(err => {
				console.log(err);
				if(err == "Offline") UI.offlineMsg(app)
			});
			
		} else if (e.target.id == "supprCompte") UI.modal(app, 'deleteAll')
		else if (e.target.id == 'generateId') app.generateInviteKey()
		else if (e.target.id == 'newgroupe') UI.openModernForm('groupe')
		else if (e.target.parentNode.id == "invitations"){
			if(e.target.tagName == "BUTTON") Pull.invitations(app)
		}
	});

	document.getElementById('params').addEventListener('change', e => {
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
		e.preventDefault();
		if(e.target.classList.contains("back")) UI.closeModal()
		else if (e.target.classList.contains("confirmLeaveGroupe")) leaveGroupe()
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
			if(e.target.id == "recycle") app.recycle();
			else if(e.target.classList.contains('noCourse')) UI.openPanel('menu')
			else if(e.target.classList.contains('activate')) activate();
			else if(e.target.parentNode.parentNode.classList.contains('article')
				|| e.target.parentNode.classList.contains('article') 
				|| e.target.classList.contains('article')
				|| e.target.parentNode.parentNode.classList.contains('preview')
				|| e.target.parentNode.classList.contains('preview')
				|| e.target.classList.contains('preview')){

				const element = e.target.tagName == "LI" ? e.target : (e.target.tagName == "DIV" ? e.target.parentNode : e.target.parentNode.parentNode);
				UI.hideOptions();
				if(!app.course.old) UI.showOptions(app, element)
				
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
						const key = e.target.parentNode.getAttribute('key');
						UI.hideOptions();
						UI.openModernForm("buy", {app: app, id: key});
					}
				} 
			}
		});
	});


	// MenuPanel

	document.getElementById('menu').addEventListener('click', event => {
		if(event.target.classList.contains('ms-Icon--Settings')) UI.openMenus('params')
		else if(event.target.classList.contains('course')) {
			const id = event.target.getAttribute("dbIndex");
			if(id){
				app.queue.enqueue(() => app.pull("open", null, id))
			}
		}
		else if(event.target.parentNode.classList.contains('course') && event.target.tagName == "I") {
			const id = event.target.parentNode.getAttribute("dbIndex");
			if(id) UI.modal('deleteCourse', id);
		}
	});


	// Buttons
	document.getElementById("buttons").addEventListener('click', event => {
		if(event.target.tagName == "BUTTON" || event.target.parentNode.tagName == "BUTTON") {
			if(event.target.id == "addArt" || event.target.parentNode.id == "addArt") UI.openModernForm("article")
			else if(event.target.id == "addPrev" || event.target.parentNode.id == "addPrev") UI.openModernForm("preview")
			else if(event.target.id == "addCourse" || event.target.parentNode.id == "addCourse") UI.openModernForm("course")
		}
	});

	// Menubar
	document.getElementById("menubar").addEventListener('click', event => {
		if(event.target.tagName == "IMG" || event.target.getAttribute("linkTo") == "menu") {
			if(window.innerWidth < 900) UI.openPanel('menu')
			else UI.openPanel('menu', app)
		}
		else if(event.target.getAttribute("linkTo") == "panier" || event.target.parentNode.getAttribute("linkTo") == "panier") UI.openPanel('panier')
		else if(event.target.getAttribute("linkTo") == "liste" || event.target.parentNode.getAttribute("linkTo") == "liste") UI.openPanel('liste')
		else if(event.target.getAttribute("linkTo") == "calcul" || event.target.parentNode.getAttribute("linkTo") == "calcul") UI.openPanel('calcul', app)
	});


	// Header

	Array.from(document.getElementsByTagName('header')).forEach(el => {
		el.addEventListener('click', e => {
			/* if(el.classList.contains('phones')){
				if(e.target.tagName == "I") UI.openMenus('mainMenu')
			} else */ if(el.classList.contains('tablet')) {
				if(e.target.classList.contains('ms-Icon--GlobalNavButton')) UI.openMenus('mainMenu')
				else if(e.target.classList.contains('ms-Icon--Settings')) UI.openMenus('params')
				else if(e.target.classList.contains('ms-Icon--Calculator')) UI.openMenus('calcul', app)
				else if(e.target.classList.contains('ms-Icon--BarChartVertical')){
					let calcul = document.querySelector('#calcul');
					if(calcul.classList.contains('opened')) calcul.classList.remove('opened')
					else calcul.classList.add('opened');
				} else if(e.target.id == 'headRefresh') {
					refreshAsync();
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
			case "modernGroupeAdder": 
				if(e.target.tagName == "FORM") addGroupe(e)
				break;
			case "modernInviteur": 
				if(e.target.tagName == "FORM") submitInvitation(e)
				break;
		}
	});

/* 	document.getElementById('forms').addEventListener('click', e => {
		if (e.target.tagName == "I" && e.target.classList.contains("ms-Icon--Back")){
			if(e.target.parentNode.id == "prices") UI.closePrice()
			else UI.closeForms()
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
	}); */

	let inputsForms = new Array(
		Array.from(document.querySelectorAll('#addArticle input')),
		Array.from(document.querySelectorAll('#addCourse input')),
		Array.from(document.querySelectorAll('#modernBuyer input')),
		Array.from(document.querySelectorAll('#modernArticleAdder input')),
		Array.from(document.querySelectorAll('#modernCourseAdder input')),
		Array.from(document.querySelectorAll('#modernInviteur input'))
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



	// Others

	document.getElementById('refresh').onclick = e => {
		refreshAsync();
	};

	$('.install i').click(function(){
		UI.hideInstall();
	});

/* 	window.addEventListener("offline", event => {
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
	}); */




	// Context Events
	/* document.addEventListener("visibilitychange", ()=>{
		if (document.visibilityState == "visible") noLoaderRefresh()
	}); */
	//window.addEventListener('online', () => noLoaderRefresh());

}