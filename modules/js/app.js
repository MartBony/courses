import UI from './UI.js';
import Offline from './offline.js';
import Course from './course.js';
import { LocalStorage, IndexedDbStorage } from './storage.js';
import { jsonEqual, fetcher, QueueHandler } from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';
import Groupe from './groupe.js';
import Structure from './structure.js';

class AppWindow extends HTMLElement{
	buttonsState;
	offline = true;
	queue = new QueueHandler();
	user;
	groupe;
	course;
	chart;
	pullState;
	domainesHues = [0,50,100,200];
	defaultDomaine = 1;

	constructor(){
		super();
	}
	refresh(){
		this.queue.enqueue(() => this.pull("refresh"));
	}
	initiate(userId, offline){

		UI.openPanel('panier');
		UI.initChart();
		document.getElementById('preload').classList.add('close');

		this.setButtons("hide");
		this.user = new Structure(userId);
		this.setParameters();
		this.queue.enqueue(() => this.pull("open"));

		// Set the colors of the select option when choosing an item type (domaine)
		const containerStyle = document.getElementById("item-type").style;
		this.domainesHues.forEach((hue, i) => {
			containerStyle.setProperty('--hue'+(i+1), hue);
		});

	}
	setParameters(){
		let toChange = document.querySelectorAll('.prixFlex, .setPrixFlex, .article h3, .preview h3, #calcul p');
		
		this.params = {
			currency: "€"
		};

		if(LocalStorage.getItem("currency")){
			this.params.currency = "$";
			document.querySelector("#currency").checked = true;
		}

		toChange.forEach(item => item.innerHTML = item.innerHTML.replace(/[\$€]/g, this.params.currency));
	}
	async pull(action, idGroupe, idCourse){// Rank as index of array
		
		console.log("-- PULLING --");
		let update;
		this.pending = true;
		this.pullState = { // Network state in pulling
			structure: action != "open",
			groupe: action != "open",
			course: action != "open"
		};


		// Load from indexedDB
		if(action == "open") Offline.pull(this, idGroupe, idCourse)


		// Load from network
	
		return Pull.structure(this)
		.then(data => {
			this.pullState.structure = true;
			console.log('Network structure fetched:', data);

			this.updateApp(data, true); // Throws if no groupes


			idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || data.groupes[0].id;

			return Pull.groupe(this, idGroupe);
		})
		.then(data => {
		
			// Update Group
			this.pullState.groupe = true;
			console.log('Network groupe fetched:', data);
			
			if(!this.groupe || this.groupe.id != data.id){ // Si on change de groupe
				idCourse = data.defaultId;
			}
				
			idCourse = idCourse || LocalStorage.getItem('currentListeId') || data.defaultId;

			this.updateGroupe(data, true); // Throws if no lists inside

			return Pull.course(idCourse);
		})
		.then(data => {
			this.pullState.course = true;
			console.log('Network course fetched:', data);
			const networkItems = this.updateCourse(data, true);
			return Offline.filterPendingRequests(this, networkItems);
		})
		.then(items => {
			this.course.updateItemsModern(items.articles, items.previews, {save: true, forceUpdate: true})
		})
		.catch(err => {
			console.log(err.payload ? err.payload : err);
		})
		.then(() => {
			this.pending = false;
			if ('serviceWorker' in navigator && 'SyncManager' in window){
				return navigator.serviceWorker.ready.then(reg => {if(reg && reg.sync) reg.sync.register('syncCourses')});
			}
		});

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
	deleteCourse(idCourse){
		document.querySelector('.loader').classList.add('opened');
		fetcher({
			method: "POST",
			url: "serveur/pushAnywhere.php",
			data: {
				action: "deleteCourse",
				id: idCourse
			}
		}).then(res => {
			document.querySelector('.loader').classList.remove('opened');
			if(res.status == 200){

				LocalStorage.removeItem("currentListeId");
				this.groupe.removeCourse(idCourse);

				IndexedDbStorage.delete("courses", idCourse)
				.then(() => this.queue.enqueue(() => this.pull("open")));

			} else throw res

		}).catch(err => {
			UI.parseErrors(err);
		});
	}
	deleteArticle(index){
		let item = this.course.items.articles.filter(item => item.id == index)[0];
		if(index < 0){
			IndexedDbStorage.delete("requests", -index)
			.then(() => {
				let rank = this.course.items.articles.indexOf(item);
				this.course.deleteArticle(item, rank);

			});
		} else {

			/* if ('serviceWorker' in navigator && 'SyncManager' in window) {
				IndexedDbStorage.put("requests", {
					type: "delArticle",
					data: { id: index, prix: item.prix, groupe: this.groupe.id }
				}).then(() => {
					let rank = this.course.items.articles.indexOf(item);

					this.course.deleteArticle({id: index, prix: item.prix}, item.id, rank);

					return navigator.serviceWorker.ready;
				})
				.then(reg => reg.sync.register('syncCourses'))
				.catch(err => {
					console.log(err);
					UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
				});
			} else { */

				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/pushAnywhere.php",
					data: {
						action: "deleteArticle", 
						id: index
					}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						let displayedIndex = this.course.items.articles.indexOf(item);

						this.course.deleteArticle(item, displayedIndex);
					} else throw res

				}).catch(err => {
					document.querySelector('.loader').classList.remove('opened');
					UI.parseErrors(err);
				});

			/* } */
		}
		
	}
	deletePreview(index){
		let item = this.course.items.previews.filter(item => item.id == index)[0];
		if(index < 0){
			IndexedDbStorage.delete("requests", -index)
			.then(() => {
				let rank = this.course.items.previews.indexOf(item);

				this.course.deletePreview(index, rank);

			});
		} else {

			/* if ('serviceWorker' in navigator && 'SyncManager' in window) {
				
				IndexedDbStorage.put("requests", {
					type: "delPreview",
					data: { id: index, groupe: this.groupe.id }
				}).then(() => {
					let rank = this.course.items.previews.indexOf(item);

					this.course.deletePreview(index, rank);

					return navigator.serviceWorker.ready;
				})
				.then(reg => reg.sync.register('syncCourses'))
				.catch(err => {
					console.log(err);
					UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
				});
			} else { */

				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/pushAnywhere.php",
					data: { action: "deletePreview", id: index}
				}).then(res => {
					document.querySelector('.loader').classList.remove('opened');
					if(res.status == 200){
						let displayedIndex = this.course.items.previews.indexOf(item);
						this.course.deletePreview(index, displayedIndex);
						this.course.items.previews = this.course.items.previews.filter(el => el.id != index);
					} else throw res
				}).catch(err => {
					document.querySelector('.loader').classList.remove('opened');
					UI.parseErrors(err);
				});
				
			/* } */
		}
	}
	updateApp(data, save){
		if(data && data.id){
			if(!this.user || !jsonEqual(this.user, data)){
				this.user = new Structure(data.id);
			}

		
			document.querySelector('#compte em').innerHTML = data.nom;
			this.user.update(data, save);

			if(this.user.groupes.length == 0){
				this.groupe = new Groupe();
				UI.modal('noGroupe');
				throw {action : "noPrompt", msg:"Le compte n'est rattaché à aucun groupe"};
			}
		} else {
			throw("Nous n'arrivons pas à vous identifier. Veuillez recharger la page et réessayer.");
		}
	}
	updateGroupe(groupe, save){
		if(groupe && groupe.coursesList && groupe.id && groupe.membres && groupe.nom && groupe.defaultId){

			if(!this.groupe || !jsonEqual(this.groupe.membres, groupe.membres)){

				if(this.groupe && groupe.id != this.groupe.id) LocalStorage.setItem('currentListeId', null)
				
				// UPD CourseList
				this.groupe = new Groupe();

			}
			if(this.groupe.id != groupe.id){
				this.course = new Course();
			}

			let preselect = -1;
			if(this.course && this.course.id){
				preselect = this.course.id;
			}

			this.groupe.update(groupe, save);
			this.groupe.updateCourses(groupe.coursesList, save, preselect);
			UI.openChart();

			if(groupe.defaultId == -1){
				document.querySelector("state-card").state = 3;
				throw {payload: {type: "MSG", message: "Le groupe ne possède pas de courses."}};
			}

			document.querySelector("state-card").state = 0;

		} else {
			UI.offlineMsg("Contenu de groupe incomplet", "Le groupe demandé est indisponible pour l'instant");
			throw {payload: new Error("Contenu de groupe incomplet")};
		}
	}
	updateCourse(data){
		if(data && data.id && data.nom && data.items){
				if(!this.course) this.course = new Course();
				

				// app.course = new Course();
				UI.closeModal();
				
				document.querySelector('#modernCourseAdder form').taxes.value = data.taxes ? (data.taxes*100).toFixed(1) : 0;
				this.course.updateSelf(data);


				Array.from(document.getElementsByClassName('course')).forEach(node => {
					if (node.getAttribute('dbindex') == data.id) node.classList.add('opened')
					else node.classList.remove('opened')
				});

				// Gerer l'ui en fonction de l'état de la liste (active ou passée)
				if (data.isold) {
					LocalStorage.removeItem('currentListeId');
					this.setButtons("hide");
				} else{
					LocalStorage.setItem('currentListeId', data.id);
					this.setButtons("show");
				}

			
			return data.items;

		} else UI.offlineMsg("Targeted course content lacks/incomplete", "La course demandée est indisponible pour l'instant")
	
		return data.items || { articles: new Array(), previews: new Array() };
	}
	recycle(){
		document.querySelector('.loader').classList.add('opened');
		fetcher({
			url: "serveur/recycle.php",
			method: "POST",
			body: { groupe: this.groupe.id, course: this.course.id }
		})
		.then(res => {
			document.querySelector('.loader').classList.remove('opened');
			if(res.status == "Offline") UI.offlineMsg()
			LocalStorage.removeItem("currentListeId");
			this.queue.enqueue(() => this.pull("open"));
		});
	}
	updateInvites(data){
		document.querySelector('#invitations div').innerHTML = "";
		if(data && data.groupes && data.groupes.length != 0){
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
			
				accept.addEventListener('click', () => {
					this.acceptInvite(el.id);
				});
				deny.addEventListener('click', () => {
					this.rejectInvite(el.id);
				});
				document.querySelector('#invitations div').append(button);
			});
		} else {
			document.querySelector('#invitations div').innerHTML = "Rien pour l'instant";
		}
	}
	acceptInvite(id){
		
		fetcher({
			method: 'POST',
			url: 'serveur/invites.php',
			data: { accept: true, groupeId: id }
		}).then(res => {
			if(res.status == 200){
				Pull.invitations(this);
				this.pull("refresh");
			} else if (res.status == "offline"){
				UI.offlineMsg();
			} else if (res.payload) {
				UI.erreur(res.payload.message);
			} else UI.erreur();
		});

	}
	rejectInvite(id){
		
		fetcher({
			method: 'POST',
			url: 'serveur/invites.php',
			data: { reject: true, groupeId: id }
		}).then(res => {
			if(res.status == 200){
				Pull.invitations(this);
			} else if (res.status == "offline"){
				UI.offlineMsg();
			} else if (res.payload) {
				UI.erreur(res.payload.message);
			} else UI.erreur();
		});

	}
	deleteUser(){
		fetcher({
			method: "POST",
			url: "serveur/deleteUser.php",
			data: { deleteUser: true }
		}).then(data => {
			if(data.status == 200){
				LocalStorage.clear();
				IndexedDbStorage.deleteDb()
					.then(() => {
						alert("Compte supprimé avec succès");
						window.location = "/";
					})
					.catch(err => {
						console.log(err);
						alert("Vous avez étés supprimées de nos bases de données mais des données locales n'ont pas pu être supprimées. Ceci peut être fait en supprimant les données de site dans les paramêtres de votre navigateur");
						window.location = "/";
					});
			}
		});
	}
	generateInviteKey(){
		document.querySelector('.loader').classList.add('opened');
		fetcher({
			method: "POST",
			url: "serveur/invites.php",
			data: { getInviteKey: true }
		}).then(res => {
			console.log(res);
			document.querySelector('.loader').classList.remove('opened');
			if(res.status == 200 && res.payload){
				document.querySelector('#idInvit h4').innerHTML = res.payload.key;
			} else if (res.status == "offline"){
				UI.offlineMsg();
			} else if (res.payload){
				UI.erreur(res.payload.message)
			} else UI.erreur()
		});
	}
	parseUnit(prix){
		return prix + this.params.currency
	}
	setButtons(type){
		if(this.buttonsState != type){
			switch(type){
				case "hide":
					Array.from(document.getElementsByClassName("adder")).forEach(el => {
						el.classList.add("hide");
					});
					this.buttonsState = "hide";
					break;
				case "show":
					Array.from(document.getElementsByClassName("adder")).forEach(el => {
						el.classList.remove("hide");
					});
					this.buttonsState = "show";
					break;
			}
		} 
	}

}

export default AppWindow;