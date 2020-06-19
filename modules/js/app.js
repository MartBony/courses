import UI from './UI.js';
import Offline from './offline.js';
import Course from './course.js';
import Storage from './storage.js';
import {jsonEqual} from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';
import idbStorage from './indexedDb.js';

let course;

class App{
	constructor(id){
		course = new Course();

		Storage.setItem('userId', id);
		this.userId = id;
		this.pullState;
		this.groupes;
		this.usedGroupe;
		this.usedCourse;
		this.liPrices = [0.1,0.5,0.9,1,2,3,4,5,6,7,8,9,10,12,15,17,20];
		this.state = 0;
		this.setParameters();
		this.pull("open");

		//this.errors =  "Cette page est innaccessible pour l'instant";
		
	}
	setParameters(){
		this.params = {
			currency: "€"
		};
		let toChange = document.querySelectorAll('.prixFlex, .setPrixFlex, .article h3, .preview h3, .calcul p');
		

		if(Storage.getItem("currency")){
			this.params.currency = "$";
			document.querySelector("#params input").checked = true;
		}


		document.querySelector("#prices ul").innerHTML = "";
		this.liPrices.forEach(item => {
			let li = document.createElement("li");
			li.innerHTML = item+this.params.currency;
			document.querySelector("#prices ul").appendChild(li);
		});
		var numLi = $('#prices ul').children().length; // Série des prix
		$('#prices li').each(i => {
			$('#prices li').eq(i).css({'filter':'grayscale('+ (i+1)/numLi*50 +'%)'});
		});

		toChange.forEach(item => {
			item.innerHTML = item.innerHTML.replace(/[\$€]/g, this.params.currency);
		});
	}
	pull(action, idGroupe, idCourse){// Rank as index of array
		switch(action){
			case "open":
				console.log("-- OPENING --");
				this.pullState = { // Network state in pulling
					structure: false,
					groupe: false,
					course: false
				};
				$('.loader').addClass('opened');
			
				// Load from network
				Pull.invitations(this);
				Pull.structure(this).then(pStructure => {
					$('.loader').removeClass('opened');
					if(pStructure){
						// Update app
						this.pullState.structure = true;
						console.log('Network structure fetched:', pStructure);
						let update = this.updateApp(pStructure, true);
						if(update){
							idGroupe = idGroupe || Storage.getItem('usedGroupe') || this.groupes[0].id;
							// Pull further
							Pull.groupe(this, idGroupe).then(pGroupe => {
								if(pGroupe){
									// Update Group
									this.pullState.groupe = true;
									console.log('Network groupe fetched:', pGroupe);
									update = this.updateGroupe(pGroupe, true);
									if(update){
										idCourse = idCourse || Storage.getItem('usedCourse') || this.usedGroupe.coursesList[0].id;
										// if(!idCourse) idCourse = this.usedGroupe.coursesList.length != 0 ? this.usedGroupe.coursesList[0].id : null;
									
										Pull.course(this, idCourse).then(pCourse => {
											if(pCourse){
												this.pullState.course = true;
												console.log('Network course fetched:', pCourse);
												update = this.updateCourse(pCourse, true);
											}
										});
									}
								}
							});
						}
					}
				});

				// Load from indexedDB	
				Offline.structure(this.userId).then(pStructure => {
					if(!this.pullState.structure && pStructure){ // If data hasn't been loaded via the network
						console.log('Local structure fetched:', pStructure);
						this.pullState.structure = "idb";
						let update = this.updateApp(pStructure);
						if(update){
							idGroupe = idGroupe || Storage.getItem('usedGroupe') || this.groupes[0].id;
							Offline.groupe(idGroupe).then(pGroupe => {
								if(!this.pullState.groupe && pGroupe){
									console.log('Local groupe fetched:', pGroupe);
									this.pullState.groupe = "idb";
									update = this.updateGroupe(pGroupe);
									if(update){
										idCourse = idCourse || Storage.getItem('usedCourse') || this.usedGroupe.coursesList[0].id;
										// if(!idCourse) idCourse = this.usedGroupe.coursesList.length != 0 ? this.usedGroupe.coursesList[0].id : null;
										Offline.course(idCourse).then(pCourse => {
											if(!this.pullState.course && pCourse){
												console.log('Local course fetched:', pCourse);
												this.pullState.course = "idb";
												update = this.updateCourse(pCourse, true);
											}
										});
									}
								}
							});
						}
					}
				});

				break;
			case "refresh":
				console.log("-- REFRESHING --");
				$('.loader').addClass('opened');
				Pull.invitations(this);
				Pull.structure(this).then(pStructure => {
					$('.loader').removeClass('opened');
					if(pStructure){
						console.log('Network structure fetched:', pStructure);
						let update = this.updateApp(pStructure, true);
						if(update){
							idGroupe = idGroupe || Storage.getItem('usedGroupe') || this.groupes[0].id;
							Pull.groupe(this, idGroupe).then(pGroupe => {
								if(pGroupe){
									console.log('Network groupe fetched:', pGroupe);
									update = this.updateGroupe(pGroupe, true);
									if(update){
										idCourse = idCourse || Storage.getItem('usedCourse') || this.usedGroupe.coursesList[0].id;
										// if(!idCourse) idCourse = this.usedGroupe.coursesList.length != 0 ? this.usedGroupe.coursesList[0].id : null;
										Pull.course(this, idCourse).then(pCourse => {
											if(pCourse){
												console.log('Network course fetched:', pCourse);
												update = this.updateCourse(pCourse, true);
											}
										});
									}
								}
							});
						}
					}
				});
				break;
		}
	}
	notificationHandler(callback){
		if (!("Notification" in window)) {
			alert("This browser does not support desktop notification");
		}

		else if (Notification.permission === "granted") {
			callback();
		}

		else if (Notification.permission !== "denied") {
			Notification.requestPermission().then(function (permission) {
				if (permission === "granted") {
					callback();
				}
			});
		}
	}
	addPrice(e, SQLindex){
		course.priceCursor = {index: SQLindex, el: e.target};
		var titre = $(e.target).parent().children($('h2')).html();
		$('#prices').css({'display':'block', 'opacity':'1'});
		$('#prices').scrollTop(0);
		$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
		$('.titrePrice').html('<i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i>'+ titre);

		document.getElementById("forms").classList.add('opened','prices');

		$('#prices div, #prices input, #prices label, #prices i, #prices ul').each(function(i){	
			setTimeout(function(){
				$('#prices div, #prices input, #prices label, #prices i, #prices ul').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#prices input').eq(0).focus();
		},200);
	}
	closePrice(){
		course.priceCursor = {};
		UI.closeForms();
	}
	swipe(direction){
		switch(direction){
			case 'left':
				$('.main#liste').css({'visibility':'visible'});
				$('header h1').html('Liste de course');
				setTimeout(function(){
					$('.main > ul').css({'transition':'', 'transform':''});
					$('body').addClass('bodyPreview');
					setTimeout(function(){
						$('.main#panier').css({'visibility':'collapse'});
					},310);
				},10);
				this.state = 1;
				break;
			case 'right':
				$('.main#panier').css({'visibility':'visible'});
				$('header h1').html('Panier');
				setTimeout(function(){
					$('.main > ul').css({'transition':'', 'transform':''});
					$('body').removeClass('bodyPreview');
					setTimeout(function(){
						$('.main#liste').css({'visibility':'collapse'});
					},310);
				},10);
				this.state = 0;
				break;
		}
	}
	setSwipe(side){
		if(window.innerWidth < 900){
			var binaryToLF = ['right', 'left'];
			if (this.state == !side) {
				this.swipe(binaryToLF[side]);
			}
		}
	}
	deleteCourse(id){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { deleteCourse: true, id: id, groupe: this.usedGroupe.id}
		}).then(data => {
			$('.loader').removeClass('opened');
			if (data.status == 200) {

				var storage = Storage.getItem('courses');				
				storage = storage.filter((el, i) => el.id != id);
				Storage.setItem('courses', storage);

				Storage.setItem('usedCourse', null);

				this.pull("open");

			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			$('.loader').removeClass('opened');
			UI.offlineMsg(this, err);
		});
	}
	deleteArticle(e, index, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { deleteArticle: 'true', id: index, groupe: this.usedGroupe.id}
		}).then(data => {
			$('.loader').removeClass('opened');
			if (data.status == 200) {
				let displayedIndex = $(e.target).parent().prevAll('li').length;


				this.totalPP(-data.prix);
				UI.remove("article", displayedIndex);

				let storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.id == course.id){
						storage[i].items.articles = storage[i].items.articles.filter(el => el.id != index);
					}
				});
				Storage.setItem('courses', storage);

				course.displayed.articles = course.displayed.articles.filter(el => el.id != index);
			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			$('.loader').removeClass('opened');
			UI.offlineMsg(this, err);
		});
		
	}
	deletePreview(e, index){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { deletePreview: 'true', id: index, groupe: this.usedGroupe.id}
		}).then(data => {
			$('.loader').removeClass('opened');
			if (data.status == 200) {
				let displayedIndex = $(e.target).parent().prevAll('li').length;

				$('.article, .preview').removeClass('ready');
				UI.remove("preview", displayedIndex);

				let storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.course == course.id){
						storage[i].items.previews = storage[i].items.previews.filter(el => el.id != index);
					}
				});
				Storage.setItem('courses', storage);

				course.displayed.previews = course.displayed.previews.filter(el => el.id != index);
			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			$('.loader').removeClass('opened');
			UI.offlineMsg(this, err);
		});
	}
	leaveGrp(){
		if(this.usedGroupe && this.usedGroupe.id){
			$('.loader').addClass('opened');
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: { leaveGroup: 'true', groupe: this.usedGroupe.id }
			}).then(data => {
				$('.loader').removeClass('opened');
				if(data.status == 200){
					UI.closeModal();
					Storage.clear();
					this.pull("refresh");
				} else if (data.notAuthed){
					UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
						{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
					]);
				} else {
					alert("Le serveur a rencontré un problème");
				}
			}).catch(err => {
				$('.loader').removeClass('opened');
				UI.offlineMsg(this, err);
			});
		}
	}
	buy(id, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { buyPreview: 'true', id: id, prix: prix, groupe: this.usedGroupe.id }
		}).then(data => {
			$('.loader').removeClass('opened');
			if(data.status == 200){
				let timer = 600,
					displayedIndex = $(course.priceCursor.el).parent().prevAll('li').length;
		
				if (!course.started) {
					$('.activate').click();
					timer = 1000;
				}
		
				this.closePrice();
				UI.remove("preview", displayedIndex);
				setTimeout(() => {
					this.setSwipe(0);
					setTimeout(() => {
						UI.acc(this);
						$('#panier ul').prepend(Generate.article(this, data.id, data.titre, data.prix));
						$('#prices #newPrice').val('');
						this.totalPP(data.prix);
						$('.prices #titreA, .prices #prix').val('');
			
						setTimeout(() => {
							$('.article').removeClass('animateSlideIn');
						},300);
					}, 150);
				}, timer);
		
				var storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.id == course.id){
						storage[i].items.previews = storage[i].items.previews.filter((obj) => (obj.id != data.id));
						storage[i].items.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
					}
				});
				Storage.setItem('courses', storage);
		
				course.displayed.previews = course.displayed.previews.filter((obj) => (obj.id != data.id));
				course.displayed.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch((err) => {
			$('.loader').removeClass('opened');
			UI.offlineMsg(this, err);
		});
	}
	updateApp(data, save){
		if(data && data.nom && data.id && data.groupes){
			$('#compte em').html(data.nom);
			if(data.groupes){
				// Save in IDB in structure objectStore
				if(save) idbStorage.add("structures", {groupes: data.groupes, nom: data.nom, id: data.id})

				// Display UI
				if(data.groupes.length != 0){
					UI.closeModal();

					$('.groupe').remove();
					data.groupes.forEach(grp => {
						$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.membres));
					});
					this.groupes = data.groupes;

					return true;
				} else {
					$('.groupe').remove();
					$('.activate, .noCourse, .article, .preview').remove();
					$('#add, #calcul').css({'visibility':'hidden'});
					$('.adder').css({'display': 'none'});
					UI.modal(this, 'noGroupe');
				}
			}
		}
	}
	updateGroupe(groupe, save){
		if(groupe && groupe.coursesList && groupe.id && groupe.membres && groupe.nom){
			// Save in IDB in structure objectStore
			if(save) idbStorage.add("groupes", groupe)

			if(this.usedGroupe && groupe.id != this.usedGroupe.id) Storage.setItem('usedCourse', null)

			this.usedGroupe = groupe;
			Storage.setItem('usedGroup', groupe.id);
	
			// UPD UI parametres
			$('.groupe').removeClass('opened');
			$('.groupe.g'+ groupe.id).addClass('opened');
			$('.adder').css({'display': ''});
			$('#add, #calcul').removeClass('hidden').css({'display':'', 'visibility':''});
			$('.noCourse').remove();
			UI.closeModal();
			
			// UPD CourseList
			$('.menu .course').remove();
			if(this.usedGroupe.coursesList && this.usedGroupe.coursesList.length != 0){ // Il y a une course
				this.usedGroupe.coursesList.forEach((el) => {
					$('.menu article').append(Generate.course(this, el.id, el.nom));
				});
			} else {
				$('.activate, .noCourse').remove();
				UI.closeModal();
				$('#add, #calcul').css({'visibility':'hidden'});
				$('.main ul').children().remove();
				$('.adder').css({'display': 'none'});
				$('.main ul').prepend(Generate.noCourse());
	
				return false;
			}
	
			return true;
		} else UI.offlineMsg(this, "Contenu de groupe incomplet", "Le groupe demandé est indisponible pour l'instant")
	}
	updateCourse(data, save){
		if(data && data.id && data.nom && data.items){
			$('.activate, .noCourse').remove();
			UI.closeModal();
			$('#add, #calcul').css({'visibility':''});

			if(!jsonEqual(this.usedCourse, data)){

				if(save) idbStorage.add("courses", data)

				Storage.setItem('usedCourse', data.id);
				course.update(this, data);

				$('.course').removeClass('opened');
				$('.activate, .noCourse').remove();
				UI.closeModal();
				$('#add, #calcul').removeClass('hidden').css({'display':'', 'visibility':''});
				$('#btTouchSurf').css({'visibility':''});

				Array.from(document.getElementsByClassName('course')).forEach(el => {
					if(el.getAttribute('dbindex') == data.id) el.classList.add('opened')
				});


				$('#refresh i, #headRefresh').removeClass('ms-Icon--Refresh').addClass('ms-Icon--Accept');
				setTimeout(function(){
					$('#refresh i, #headRefresh').addClass('ms-Icon--Refresh').removeClass('ms-Icon--Accept');
				},2000);

				if (course.old) {
					$('#add, #calcul').addClass('hidden');
					$('#btTouchSurf').css({'visibility':'hidden'});
					$('#add').css({'display':'none'});
				}

				if (data.dateStart == 0 && !course.old) {
					$('.main ul').prepend(Generate.activate());
					$('#add').addClass('hidden');
					$('.adder').eq(0).css({'display':'none'});

					this.setSwipe(1)
				}
				
			}

			return true;

		} else UI.offlineMsg(this, "Targeted course content lacks/incomplete", "La course demandée est indisponible pour l'instant")
	}
	updateInvites(data){
		if(data.status == 200){
			$('#invitations div').html('');
			if(data.groupes.length != 0){
				data.groupes.forEach(el => {
					let button = document.createElement('button'),
						span = document.createElement('span'),
						accept = document.createElement('i'),
						deny = document.createElement('i');
					button.innerHTML = el.nom;
					accept.className = "ms-Icon ms-Icon--CheckMark";
					deny.className = "ms-Icon ms-Icon--Cancel";
					accept.setAttribute("aria-hidden","true");
					deny.setAttribute("aria-hidden","true");
					
					span.appendChild(accept);
					span.appendChild(deny);
					button.appendChild(span);
				
					$(accept).on('click',() => {
						this.acceptInvite(el.id);
					});
					$(deny).on('click',() => {
						this.rejectInvite(el.id);
					});
					$('#invitations div').append(button);
				});
			} else $('#invitations div').html('Rien pour l\'instant')
		}
	}
	acceptInvite(id){
		
		$.ajax({
			method: 'POST',
			url: 'serveur/invites.php',
			data: { accept: true, id: id }
		}).then(data =>{
			if(data.status = 200){
				Pull.invitations(this);
				this.pull("refresh");
			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			console.err(err);
			$('#invitations div').append('Un problème est survenu');
		});

	}
	rejectInvite(id){
		
		$.ajax({
			method: 'POST',
			url: 'serveur/invites.php',
			data: { reject: true, id: id }
		}).then(data =>{
			if(data.status = 200){
				Pull.invitations(this);
				this.pull("refresh");
			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			console.err(err);
			$('#invitations div').append('Un problème est survenu');
		});

	}
	deleteUser(){
		$.ajax({
			method: "POST",
			url: "serveur/deleteUser.php",
			data: { deleteUser: true }
		}).then(data => {
			if(data.status == 200){
				alert("Compte supprimé avec succès");
				window.location = "/";
			}
		});
	}
	totalPP(constante, reset = false){
		if(reset){
			$('#totalDep').html(Number(course.total).toFixed(2) + this.params.currency);
			$('#moiDep').html(Number(course.monthCost).toFixed(2) + this.params.currency);
			$('#moiPrev').html(Number(course.total * course.coef).toFixed(2) + this.params.currency);
			$('#anPrev').html(Number(course.total * course.coef * 12).toFixed(2) + this.params.currency);
			if(course.maxPrice < course.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
		else{
			constante = parseFloat(constante);
			course.total += constante;
			course.monthCost += constante;
			$('#totalDep').html(Number(course.total).toFixed(2) + this.params.currency);
			$('#moiDep').html(Number(course.monthCost).toFixed(2) + this.params.currency);
			$('#moiPrev').html(Number(course.total * course.coef).toFixed(2) + this.params.currency);
			$('#anPrev').html(Number(course.total * course.coef * 12).toFixed(2) + this.params.currency);
			if(course.maxPrice < course.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
	}
	generateInviteKey(){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/invites.php",
			data: { getInviteKey: true }
		}).then(data => {
			$('.loader').removeClass('opened');
			if(data.status == 200){
				$('#idInvit h4').html(data.id);
			} else if (data.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			$('.loader').removeClass('opened');
			UI.offlineMsg(this, err);
		});
	}/* 
	async openOffline(groupe, course){
		let groupData = {
				status: 200,
				groupes: await idbStorage.getGroupe(groupe)
			},
			initGroupes = this.updateApp(groupData, groupe, false);
		if(typeof initGroupes !== 'undefined'){ // Si les groupes ont étés chargés
			$('.loader').removeClass('opened');

			console.log('Storage groupes fetched:', groupData);
			hasCached.groupes = true;

			if(initGroupes){ // Si il existe des courses
				course = course || this.usedGroupe.coursesList[0].id;
				if(Storage.getItem('courses') && Storage.getItem('courses').filter(el => el.id == course).length == 1){
					let courseData = {
							status: 200,
							course: Storage.getItem('courses').filter(el => el.id == course)[0]
						},
						initCourse = this.updateCourse(courseData, false);
					if(initCourse) {
						console.log('Storage items fetched:', courseData);
						hasCached.course = true;
					}
				}
			}
			

		}
	} */
}

export default App;
export { course };