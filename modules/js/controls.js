import Pull from './requests.js';
import UI from './UI.js';
import Animations from './animations.js';
import { LocalStorage, IndexedDbStorage } from './storage.js';
import Generate from './generate.js';
import { fetcher } from './tools.js';


export default function initEvents(){

	const app = document.querySelector("app-window"),
		refresh = (callback, idGroupe, idCourse) => {
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
			LocalStorage.removeItem("currentListeId");
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
		addArticle = e => {
			e.preventDefault();
			let inputPrice = document.querySelector('#modernArticleAdder #prix'),
				inputTitre = document.querySelector('#modernArticleAdder #titreA'),
				inputQuantity = document.getElementById("quantA");
			if (!isNaN(parseFloat(inputPrice.value.replace(',','.'))) && inputTitre.value && inputQuantity) {
				/* if ('serviceWorker' in navigator && 'SyncManager' in window) {
					console.log(true);
					IndexedDbStorage.put("requests", {
						type: "article",
						data: {
							titre: inputTitre.value,
							prix: inputPrice.value.replace(',','.') * inputQuantity.value,
							courseId: app.course.id
						}
					})
					.then(res => IndexedDbStorage.get("requests", res))
					.then(res => {
						const data = res.data;
						UI.acc();

						window.scrollTo({ top: 0, behavior: 'smooth' });
						app.course.pushArticle({
							id: -res.reqId,
							titre: data.titre,
							prix: data.prix.Animations,
							id_domaine: app.defaultDomaine
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
					
					
				} else { */
					document.getElementsByClassName('loader')[0].classList.add('opened');
					fetcher({
						method: "POST",
						url: "serveur/pushAnywhere.php",
						data: {
							action: "submitArticle",
							titre: inputTitre.value,
							prix: inputPrice.value.replace(',','.') * inputQuantity.value,
							courseId: app.course.id
						}
					}).then(res => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						if(res.status == 200){
							const item = res.payload;
						
							UI.acc();

							window.scrollTo({ top: 0, behavior: 'smooth' });
							app.course.pushArticle({
								id: item.id,
								titre: item.titre,
								prix: item.prix,
								id_domaine: item.id_domaine
							});

							[inputPrice, inputTitre].forEach(el => el.value = '');
							inputQuantity.value = 1;

							IndexedDbStorage.put("items", {
								id: item.id,
								prix: item.prix,
								titre: item.titre,
								message: null,
								id_domaine: item.id_domaine,
								type: "article",
								course: item.course
							});
						} else throw res

					})
					.catch(err => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						UI.parseErrors(err);
					});
				/* } */
			}
			else{
				alert('Prix de l\'article non conforme');
			}
		},
		addPreview = e => {
			e.preventDefault();
			let input = document.querySelector('#modernPreviewAdder #titreP');
			if (input.value && input.value != '') {
				/* if ('serviceWorker' in navigator && 'SyncManager' in window) {
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
						UI.acc();
						
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
					
					
				} else { */
					document.getElementsByClassName('loader')[0].classList.add('opened');
					fetcher({
						method: "POST",
						url: "serveur/pushAnywhere.php",
						data: {
							action: "submitPreview",
							titre: input.value,
							courseId: app.course.id
						}
					}).then(res => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						if(res.status == 200){
							const item = res.payload;
							UI.acc();
							
							window.scrollTo({ top: 0, behavior: 'smooth' });
							app.course.pushPreview({
								id: item.id,
								titre: item.titre,
								color: item.color,
								id_domaine: item.id_domaine
							});
						
							input.value = '';

							IndexedDbStorage.put("items", {
								type: "preview",
								course: app.course.id,
								color: item.color,
								id: item.id,
								prix: item.prix,
								titre: item.titre
							});
						} else throw res
						
					}).catch(err => {
						document.getElementsByClassName('loader')[0].classList.remove('opened');
						UI.parseErrors(err);
					});
				/* } */
			}
			else
			{
				alert('Il faut donner un nom à l\'article 😑');
			}
		},
		buyPreview = e => {
			e.preventDefault();
			if (!isNaN(parseFloat(document.querySelector('#modernBuyer #newPrice').value)) && !isNaN(parseFloat(document.querySelector('#modernBuyer #quantP').value))) {
				const idPreview = parseInt(document.getElementById('modernBuyer').getAttribute('key')),
				prix = document.querySelector('#modernBuyer #newPrice').value.replace(',','.') * document.getElementById('quantP').value,
				item = app.course.previewsNodeList.filter(node => node.content.id == idPreview)[0];
				document.querySelector('#quantP').value = 1;
				
				// todo - implement offline sync wait (wait online to sync)

				document.querySelector('.loader').classList.add('opened');

				fetcher({
					method: "POST",
					url: "serveur/pushAnywhere.php",
					data: {
						action: "buyItem",
						itemId: item.content.id,
						prix: prix
					}
				}).then(res => {
					document.querySelector(".loader").classList.remove("opened");
					if(res.status == 200){
						document.querySelector('#modernBuyer #newPrice').value = "";
						document.querySelector('#modernBuyer #quantP').value = "1";
						
						let timer = window.innerWidth < 900 ? 600: 100;
						const articleData = res.payload;
						window.scrollTo({ top: 0, behavior: 'smooth' });
						
						// Delete old preview				
						UI.acc();
						
						app.course.deletePreview(idPreview);


						// Add new article
						setTimeout(() => {

							UI.openPanel("panier");
							setTimeout(() => {
								app.course.pushArticle({
									id: articleData.id,
									titre: articleData.titre,
									prix: articleData.prix,
									id_domaine: articleData.id_domaine
								});
							}, 100);
							setTimeout(() => document.getElementsByClassName('article')[0].classList.remove('animateSlideIn'), 300);

						}, timer);

						IndexedDbStorage.put("items", {...item, type: "article"});
					} else throw res
				})
				.catch(err => {
					document.querySelector(".loader").classList.remove("opened");

					UI.parseErrors(err);
				});


			} else alert('Il faux rentrer un prix numérique')
		},
		addCourse = e => {
			e.preventDefault();
			const form = e.target;
			if (!isNaN(parseFloat(form.prixMax.value.replace(',','.'))) && form.titre.value) {
				/* TODO : add loader animation */
				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/pushAnywhere.php",
					data: {
						action: "createListeCourses",
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
							dateCreation: course.dateCreation,
							id: course.id,
							maxPrice: course.maxPrice,
							nom: course.nom,
							taxes: course.taxes,
							total: course.total,
						});

						const listeNode = Generate.course(liste.id, liste.nom);
						// Inserer un nouvel element UI, dans le premier container
						document.querySelector('#coursesContainer > div').appendChild(listeNode);

						UI.acc();
						form.titre.value = "";
						form.prixMax.value = "";
						form.taxes.value = "0";

						LocalStorage.setItem('currentListeId', null);
						app.queue.enqueue(() => app.pull("open", null, course.id));

					} else throw res
					
				}).catch(err => {
					document.querySelector('.loader').classList.remove('opened');
					UI.parseErrors(err);
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
					url: "serveur/pushAnywhere.php",
					data: {
						action: "newGroupe",
						titre: form.titre.value
					}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						form.titre.value = "";
						UI.closeModernForms();
						refreshAsync(res.payload ? res.payload.id: null);
					} else throw res;
					
				}).catch(err => {
					document.querySelector('.loader').classList.remove('opened');
					UI.parseErrors(err);
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
					url: "serveur/pushAnywhere.php",
					body: {
						action: 'leaveGroup',
						groupe: groupeId
					}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						UI.closeModal();
						let deletedCoursesIds = [];
						Promise.all([
							IndexedDbStorage.filterCursorwise("courses", null, null, (course) => {
								if(course.groupe == groupeId) deletedCoursesIds.push(course.id);
								return course.groupe != groupeId;
							}),
							IndexedDbStorage.delete("groupes", groupeId)
						])
						.then(() => {
							return IndexedDbStorage.filterCursorwise("items", null, null, (item) => {
								return deletedCoursesIds.findIndex(id => item.course == id) == -1;
							});
						})
						.then(openAsync);
					}
				}).catch(err => {
					console.log(err);
					if (err.responseJSON && err.responseJSON.notAuthed){
						UI.requireAuth();
					} else {
						alert("Le serveur a rencontré un problème");
						UI.offlineMsg(err);
					}
				});
			} else UI.erreur("Une erreur est survenue, selectionnez ou créez un groupe dans les paramêtre pour continuer.");
		},
		editCourse = e => {
			e.preventDefault();
			const form = e.target,
				prix = form.prixMax.value.replace(',','.'),
				date = new Date(form.date.value);
			if (!isNaN(parseFloat(prix)) && form.titre.value) {
				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/pushAnywhere.php",
					data: {
						action: "editCourse",
						idCourse: app.course.id,
						titre: form.titre.value,
						maxPrice: prix,
						taxes: form.taxes.value.replace(',','.') | "0",
						date: parseInt(date.getTime()/1000)
					}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						const course = res.payload;
						IndexedDbStorage.put("courses", {
							groupe: course.groupe,
							dateCreation: course.dateCreation,
							id: course.id,
							maxPrice: course.maxPrice,
							nom: course.nom,
							taxes: course.taxes,
							total: course.total
						});

						UI.closeModernForms();
						app.groupe.editCourse(course);
						app.course.updateSelf(course);


						UI.message("C'est bon", "La liste à été modifiée avec succès")

					} else throw res
					
				}).catch(err => {
					document.querySelector('.loader').classList.remove('opened');
					UI.parseErrors(err);

					// A intégrer dans parseerrors
					if (err.status == "Offline") UI.offlineMsg(app);
					// else UI.erreur(err.payload? err.payload.title: null)

					if(err.action && err.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
				});

			} else {
				alert('Prix de l\'article non conforme');
			}
		},
		enfouir = () => {
			document.querySelector('.loader').classList.add('opened');
			fetcher({
				method: "POST",
				url: "serveur/recycle.php",
				data: {
					action: "enfouir",
					idCourse: app.course.id
				}
			}).then(res => {
				document.querySelector('.loader').classList.remove('opened');
				if(res.done){
					/* Todo : fermer le menu,  */
					UI.message("C'est bon", "La liste à été archivée avec succès")
					UI.closeModernForms();
					refreshAsync();
				} else {
					UI.erreur("Il y a eu une erreur", res.msg);
				}
			}).catch(err => {
				console.error(err);
			});
		};




	// Service Worker
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.onmessage = (event) => {
			console.log("event from SW, ", event);
			const res = event.data;
			const payload = res.payload;
			switch(res.type){
				case "CacheRefreshed":
					if(payload.type == "SUCCESS") UI.message(payload.message);
					else UI.erreur(payload.message);
					break;
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
						previewUi.content = ({ id: payload.item.id });
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
						articleUi.content = ({ id: payload.item.id });
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
						buyedUi.content = ({ id: payload.item.id });
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
		else if (e.target.id == "refreshCache"){
			if("serviceWorker" in navigator && navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller.postMessage({
					action: 'RefreshCache',
				});
				// window.location = "/courses/"; Location changes on message from the SW
			}
		}
		else if (e.target.id == "supprCompte") UI.modal(app, 'deleteAll')
		else if (e.target.id == 'generateId') app.generateInviteKey()
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

	// Compte
	document.getElementById('compteContainer').addEventListener('click', event => {
		if(event.target.classList.contains('ms-Icon--Back')) UI.closeMenus()
		else if(event.target.id == "logout") {

			fetcher({
				method: 'POST',
				url: 'serveur/auth.php',
				data: { deconnect: true }
			}).then(res => {
				if(res.status == 200){
					LocalStorage.clear();
					IndexedDbStorage.closeIDB()
				
						if("serviceWorker" in navigator && navigator.serviceWorker.controller) {
							navigator.serviceWorker.controller.postMessage({
								action: 'DELETEDB',
							});
							// window.location = "/courses/"; Location changes on message from the SW
						}
			
				} else if(res.status == "offline") UI.offlineMsg(app)
				else UI.erreur(res.payload ? res.payload.message : null);
			})
			.catch(err => {
				console.warn(err);
			});
			
		}
	});


	// Modal

	document.getElementById('modal').addEventListener('click', e => {
		e.preventDefault();
		if(e.target.classList.contains("back")) UI.closeModal()
		else if (e.target.classList.contains("confirmLeaveGroupe")) leaveGroupe()
		else if (e.target.classList.contains("lienParams")){
			UI.openMenus('params');
			UI.closeModal();
		}
		else if (e.target.classList.contains("lienCreateCroupe")){
			UI.openPanel('menu');
			UI.closeModal();
			document.getElementById("groupesContainer").style.animation = "getNoticed 0.7s ease";
			setTimeout(() => {
				UI.openModernForm("groupe");
				document.getElementById("groupesContainer").style.animation = "";
			}, 900);
		}
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
			else if(e.target.parentNode.parentNode.classList.contains('article')
				|| e.target.parentNode.classList.contains('article') 
				|| e.target.classList.contains('article')
				|| e.target.parentNode.parentNode.classList.contains('preview')
				|| e.target.parentNode.classList.contains('preview')
				|| e.target.classList.contains('preview')){

				const element = e.target.tagName == "LI" ? e.target : (e.target.tagName == "DIV" ? e.target.parentNode : e.target.parentNode.parentNode);
				
				if(!app.course.old){
					document.querySelector("item-options").open(element,{x: e.clientX, y: e.clientY});
				}
				
			}
		});
	});


	// MenuPanel

	document.getElementById('menu').addEventListener('click', event => {
		if(event.target.id == "paramsOpener" || event.target.parentNode.id == "paramsOpener") UI.openMenus('params')
		else if(event.target.id == "compteOpener") UI.openMenus('compte')
		else if(event.target.parentNode.classList.contains('course')) {
			const id = event.target.parentNode.getAttribute("dbIndex");
			if(id){
				app.queue.enqueue(() => app.pull("open", null, id))
			}
		}
		else if(event.target.parentNode.parentNode.classList.contains('course') && event.target.tagName == "I") {
			const target = event.target;
			if(target.classList.contains("cdelete")){
				const id = event.target.parentNode.parentNode.getAttribute("dbIndex");
				if(id) UI.modal('deleteCourse', id);
			} else {
				UI.openModernForm('courseEditor');
			}
		}
		
		else if (event.target.tagName == 'BUTTON' && event.target.parentNode.id == "groupesContainer") {
			if(app.user.groupes.length < app.user.nbrGroupesMax){
				UI.openModernForm('groupe');
			} else {
				let response = "";
				if(app.user.premium){
					response = `L'application supporte un maximum de ${app.user.nbrGroupesMax} groupes. Il faut quitter un de vos groupes pour en rejoindre un nouveau.`;
				} else {
					response = `L'application supporte un maximum de ${app.user.nbrGroupesMax} groupes. Il faut quitter un de vos groupes pour en rejoindre un nouveau. Passez en premium pour augmenter cette limite.`;
				}
				UI.erreur("Limite de groupes atteinte.", response);
				
			}
		}
		
		else if(event.target.classList.contains('groupe')
			|| event.target.parentNode.classList.contains('groupe')
			|| event.target.parentNode.parentNode.classList.contains('groupe')) { // when clicked on a button
			let btGroupe;
			switch(true){
				case event.target.classList.contains('groupe'):
				btGroupe = event.target;
				break;
				case event.target.parentNode.classList.contains('groupe'):
				btGroupe = event.target.parentNode;
				break;
				case event.target.parentNode.parentNode.classList.contains('groupe'):
				btGroupe = event.target.parentNode.parentNode;
				break;
			}
			
			if(event.target.classList.contains('ms-Icon--Leave')) {
				UI.modal('leaveGroupe', btGroupe.innerHTML);
				return null;
			}
			else if(event.target.classList.contains('ms-Icon--AddFriend')) {
				UI.openModernForm("inviter", btGroupe.children[0].innerHTML);
				return null;
			}

			app.queue.enqueue(() => app.pull("open", btGroupe.getAttribute("idGroupe")));
		}
	});


	// Buttons
	document.getElementById("buttons").addEventListener('click', event => {
		if(event.target.tagName == "BUTTON" || event.target.parentNode.tagName == "BUTTON") {
			if(event.target.id == "addArt" || event.target.parentNode.id == "addArt") UI.openModernForm("article")
			else if(event.target.id == "addPrev" || event.target.parentNode.id == "addPrev") UI.openModernForm("preview")
			else if(event.target.id == "addCourse" || event.target.parentNode.id == "addCourse") {
				if(app.groupe.courses[0].length < app.user.nbrCoursesMax){
					UI.openModernForm("course");
				} else {
					let response = "";
					if(app.user.premium){
						response = `L'application supporte un maximum de ${app.user.nbrCoursesMax} courses actives. Pour recycler une liste de courses il suffit de la séléctionner et de taper sur l'icône "modifier".`;
					} else {
						response = `L'application supporte un maximum de ${app.user.nbrCoursesMax} courses actives. Pour recycler une liste de courses il suffit de la séléctionner et de taper sur l'icône "modifier". Passez en premium pour augmenter cette limite.`;
					}
						UI.erreur("Veuillez recycler une des courses actives pour continuer", response);
					
				}
			}
		}
	});

	// Menubar
	document.getElementById("menubar").addEventListener('click', event => {
		if(event.target.tagName == "IMG" || event.target.getAttribute("linkTo") == "menu") {
			if(window.innerWidth < 900) UI.openPanel('menu')
			else UI.openPanel('menu')
		}
		else if(event.target.getAttribute("linkTo") == "panier" || event.target.parentNode.getAttribute("linkTo") == "panier") UI.openPanel('panier')
		else if(event.target.getAttribute("linkTo") == "liste" || event.target.parentNode.getAttribute("linkTo") == "liste") UI.openPanel('liste')
		else if(event.target.getAttribute("linkTo") == "calcul" || event.target.parentNode.getAttribute("linkTo") == "calcul") UI.openPanel('calcul', app)
	});


	// Header

	Array.from(document.getElementsByTagName('header')).forEach(el => {
		el.addEventListener('click', e => {
			if(el.classList.contains('tablet')) {
				if(e.target.classList.contains('ms-Icon--Settings')) UI.openMenus('params')
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
		} else if(e.target.id == "enfouir"){
			enfouir();
		}
	});

	document.getElementById('modernForms').addEventListener('submit', e => {
		switch(e.target.parentNode.parentNode.parentNode.id){
			case "modernArticleAdder": 
				addArticle(e)
				break;
			case "modernPreviewAdder": 
				addPreview(e)
				break;
			case "modernCourseAdder": 
				addCourse(e)
				break;
			case "modernBuyer": 
				buyPreview(e)
				break;
			case "modernGroupeAdder":
				addGroupe(e);
				break;
			case "modernInviteur": 
				submitInvitation(e)
				break;
			case "courseEditor":
				editCourse(e);
				break;
		}
	});

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

	document.getElementById('refresh').onclick = () => refreshAsync();

}