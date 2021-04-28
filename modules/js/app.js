import UI from './UI.js';
import Offline from './offline.js';
import Course from './course.js';
import { LocalStorage, IndexedDbStorage } from './storage.js';
import { jsonEqual, fetcher, QueueHandler } from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';
import Groupe from './groupe.js';
import Structure from './structure.js';

class App{
	buttonsState;
	constructor(userId, offline){

		UI.openPanel('panier');
		UI.initChart(this);
		document.getElementById('preload').classList.add('close');
		
		// LocalStorage.setItem('userConnectionData', user);
		this.offline = true;
		this.queue = new QueueHandler();
		this.buttons = "hide";
		this.user;
		this.groupe;
		this.chartContent;
		this.course;
		this.user = new Structure(userId);
		this.pullState;
		this.pending; // Avoid collisions
		this.swipeBinaryState = 0;
		this.setParameters();
		this.queue.enqueue(() => this.pull("open"));
		
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


		/* document.querySelector("#prices ul").innerHTML = "";
		this.liPrices.forEach(item => {
			let li = document.createElement("li");
			li.innerHTML = item+this.params.currency;
			document.querySelector("#prices ul").appendChild(li);
		});
		var numLi = $('#prices ul').children().length; // Série des prix
		$('#prices li').each(i => {
			$('#prices li').eq(i).css({'filter':'grayscale('+ (i+1)/numLi*50 +'%)'});
		}); */

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
		Pull.invitations(this);
	
		let pull = Pull.structure(this)
		.then(data => {
			this.pullState.structure = true;
			console.log('Network structure fetched:', data);

			this.updateApp(data, true);
			idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || data.groupes[0].id;
			return Pull.groupe(this, idGroupe);
		})
		.then(data => {
			console.log(data);
		
			// Update Group
			this.pullState.groupe = true;
			console.log('Network groupe fetched:', data);
			return this.updateGroupe(data, true);
	
		})
		.then(() => {
			idCourse = idCourse || LocalStorage.getItem('usedCourse') || this.groupe.courses[0].id;
			// if(!idCourse) idCourse = this.groupe.coursesList.length != 0 ? this.groupe.coursesList[0].id : null;
			return Pull.course(idCourse);
		})
		.then(data => {
			this.pullState.course = true;
			console.log('Network course fetched:', data);
			const networkItems = this.updateCourse(data, true);
			return Offline.filterPendingRequests(this, networkItems);
		})
		.then(items => {
			this.course.updateItemsModern(this, items.articles, items.previews, true)
		})
		.catch(err => {
			console.log(err.payload ? err.payload : err);
		})
		.then(() => {
			this.pending = false
			return navigator.serviceWorker.ready
		})
		.then(reg => {if(reg && reg.sync) reg.sync.register('syncCourses')});

		return pull;

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
	deleteCourse(id){
		document.querySelector('.loader').classList.add('opened');
		fetcher({
			method: "POST",
			url: "serveur/push.php",
			data: { deleteCourse: true, id: id, groupe: this.groupe.id}
		}).then(res => {
			document.querySelector('.loader').classList.remove('opened');
			if(res.status == 200){

				LocalStorage.removeItem("usedCourse");
				this.groupe.removeCourse(res.payload.id);

				IndexedDbStorage.delete("courses", res.payload.id)
				.then(() => this.queue.enqueue(() => this.pull("open")));

			} else if (status == "Offline") throw "Offline"
			else throw res

		}).catch(err => {
			if (err == "Offline") UI.offlineMsg(this, err);
			else if(err == 404) UI.erreur("La course demandée est introuvable", "Rechargez la page et réessayez");
			else UI.erreur("Il y a eu un problème", "Rechargez la page et réessayez")
		});
	}
	deleteArticle(index){
		let item = this.course.items.articles.filter(item => item.id == index)[0];
		if(index < 0){
			IndexedDbStorage.delete("requests", -index)
			.then(() => {
				let rank = this.course.items.articles.indexOf(item);

				UI.removeArticle(this.course, item.id, rank);
				this.course.deleteArticle(this, {id: index, prix: item.prix});

			});
		} else {

			if ('serviceWorker' in navigator && 'SyncManager' in window) {
				IndexedDbStorage.put("requests", {
					type: "delArticle",
					data: { id: index, prix: item.prix, groupe: this.groupe.id }
				}).then(() => {
					let rank = this.course.items.articles.indexOf(item);

					UI.removeArticle(this.course, item.id, rank);
					this.course.deleteArticle(this, {id: index, prix: item.prix});

					return navigator.serviceWorker.ready;
				})
				.then(reg => reg.sync.register('syncCourses'))
				.catch(err => {
					console.log(err);
					UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
				});
			} else {

				$('.loader').addClass('opened');
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					data: { deleteArticle: 'true', id: index, groupe: this.groupe.id}
				}).then(data => {
					$('.loader').removeClass('opened');
					let displayedIndex = this.course.items.articles.indexOf(item);

					this.total -= data.prix;
					UI.removeArticle(this.course, item.id, displayedIndex);

					this.course.items.articles = this.course.items.articles.filter(el => el.id != index);
					IndexedDbStorage.put("courses", this.course.export());

				}).catch(res => {
					if (res.responseJSON && res.responseJSON.notAuthed){
						UI.requireAuth();
					} else {
						$('.loader').removeClass('opened');
						UI.offlineMsg(this, res);
					}
				});

			}
		}
		
	}
	deletePreview(index){
		let item = this.course.items.previews.filter(item => item.id == index)[0];
		if(index < 0){
			IndexedDbStorage.delete("requests", -index)
			.then(() => {
				let rank = this.course.items.previews.indexOf(item);

				UI.removePreview(this.course, item.id, rank);
				this.course.deletePreview(index);

			});
		} else {

			if ('serviceWorker' in navigator && 'SyncManager' in window) {
				
				IndexedDbStorage.put("requests", {
					type: "delPreview",
					data: { id: index, groupe: this.groupe.id }
				}).then(() => {
					let rank = this.course.items.previews.indexOf(item);

					UI.removePreview(this.course, item.id, rank);
					this.course.deletePreview(index);

					return navigator.serviceWorker.ready;
				})
				.then(reg => reg.sync.register('syncCourses'))
				.catch(err => {
					console.log(err);
					UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
				});
			} else {

				$('.loader').addClass('opened');
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					data: { deletePreview: 'true', id: index, groupe: this.groupe.id}
				}).then(data => {
					$('.loader').removeClass('opened');
					let displayedIndex = this.course.items.previews.indexOf(item);

					$('.article, .preview').removeClass('ready');
					UI.removePreview(this.course, item.id, displayedIndex);

					this.course.items.previews = this.course.items.previews.filter(el => el.id != index);
					IndexedDbStorage.put("courses", this.course.export());
				}).catch(err => {
					if (res.responseJSON && res.responseJSON.notAuthed){
						UI.requireAuth();
					} else {
						$('.loader').removeClass('opened');
						UI.offlineMsg(this, res);
					}
				});
				
			}
		}
	}
	buy(idPreview, prix){
		const item = this.course.items.previews.filter(item => item.id == idPreview)[0],
		handleBuy = (res) => {
			return new Promise((resolve, reject) => {

				const displayedIndex = this.course.items.previews.indexOf(item);
				let timer = 600;
				window.scrollTo({ top: 0, behavior: 'smooth' });

	
		
				if (!this.course.started) {
					document.querySelector('.activate').click();
					timer = 1000;
				}
				
				document.querySelector('#modernBuyer #newPrice').value = "";
				document.querySelector('#modernBuyer #quantP').value = "1";
				
				// Delete old preview
				UI.closeModernForms();
				
				this.course.deletePreview(idPreview);
				UI.removeItem(item.id);



				// Add new article
				setTimeout(() => {

					UI.openPanel("panier");
					UI.acc(this);
					setTimeout(() => {
						this.course.pushArticle(this, {
							id: -res.reqId,
							titre: res.data.titre,
							color: this.user.color,
							prix: res.data.prix
						});
						resolve();
					}, 100);
					setTimeout(() => document.getElementsByClassName('article')[0].classList.remove('animateSlideIn'), 300);

				}, timer);

			});
		}

		if(idPreview < 0){
			
			return Promise.all([
				IndexedDbStorage.delete("requests", -item.id), 
				IndexedDbStorage.put("requests", {
					type: "article",
					data: {
						titre: item.titre,
						prix: prix,
						groupe: this.groupe.id,
						color: this.user.color
					}
				})
			])
			.then(res => IndexedDbStorage.get("requests", res[1]))
			.then(handleBuy)
			.catch(err => {
				console.log(err);
				UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
			});

		} else {

			if ('serviceWorker' in navigator && 'SyncManager' in window) {

				return IndexedDbStorage.put("requests", {
					type: "buy",
					data: {
						id: item.id,
						prix: prix,
						groupe: this.groupe.id
					}
				})
				.then(res => IndexedDbStorage.get("requests", res))
				.then(req => {return {reqId: req.reqId, type: req.type, data: {...req.data, titre: item.titre}}})
				.then(handleBuy)
				.then(() => navigator.serviceWorker.ready )
				.then(reg => reg.sync.register('syncCourses'))
				.catch(err => {
					console.log(err);
					UI.erreur("Un problème est survenu sur votre appareil", "Réessayez");
				});

			} else {
			
				document.querySelector('.loader').classList.add('opened');
				fetcher({
					method: "POST",
					url: "serveur/push.php",
					data: {
						buyPreview: true,
						id: item.id,
						prix: prix,
						groupe: this.groupe.id
					}
				}).then(res => {
					$('.loader').removeClass('opened');
					
					const displayedIndex = app.course.items.previews.indexOf(item),
					item = res.payload;
					let timer = 600;
					window.scrollTo({ top: 0, behavior: 'smooth' });
	
		
			
					if (!app.course.started) {
						document.getElementsByName('activate')[0].click();
						timer = 1000;
					}
					
					document.querySelector('#modernBuyer #newPrice').value = "";
					document.querySelector('#modernBuyer #quantP').value = "1";
					
					// Delete old preview
					UI.closeModernForms();
					
					app.course.deletePreview(idPreview);
					UI.removeItem(item.id);
	
	
	
					// Add new article
					setTimeout(() => {
	
						UI.openPanel("panier");
						UI.acc(app);
						setTimeout(() => {
							app.course.pushArticle(this, {
								id: item.id,
								titre: item.titre,
								color: item.color,
								prix: item.prix
							});
						}, 100);
						setTimeout(() => document.getElementsByClassName('article')[0].classList.remove('animateSlideIn'), 300);
	
					}, timer);

					IndexedDbStorage.put("items", {...item, type: "article"});
				})
				.catch(err => {
					$('.loader').removeClass('opened');
					if (err.responseJSON && res.responseJSON.notAuthed){
						UI.requireAuth();
					} else if(err.status == 400 && err.responseJSON && err.responseJSON.indexOf("Negative value") > -1){
						UI.erreur("Le prix doit être positif")
					}
					else {
						UI.offlineMsg(this, err);
					}
				});
			}

		}
	}
	updateApp(data, save){
		if(!this.user || !jsonEqual(this.user, data)){
			this.user = new Structure(data.id);
		}

	
		document.querySelector('#compte em').innerHTML = data.nom;
		this.user.update(data);
		this.user.updateGroupes(data.groupes, save);

	}
	updateGroupe(groupe, save){
		if(groupe && groupe.coursesList && groupe.id && groupe.membres && groupe.nom){
			if(!this.groupe || !jsonEqual(this.groupe.membres, groupe.membres)){

				if(save) IndexedDbStorage.put("groupes", {
					id: groupe.id,
					membres: groupe.membres,
					nom: groupe.nom
				})
				if(this.groupe && groupe.id != this.groupe.id) LocalStorage.setItem('usedCourse', null)
				
				// UPD CourseList
				this.groupe = new Groupe();

			}
			this.groupe.update(groupe);
			this.groupe.updateCourses(this, groupe.coursesList, save);

			if(groupe.coursesList.length == 0){
				throw {payload: {type: "MSG", message: "Le groupe ne possède pas de courses."}};
			}

		} else {
			UI.offlineMsg(this, "Contenu de groupe incomplet", "Le groupe demandé est indisponible pour l'instant");
			throw {payload: new Error("Contenu de groupe incomplet")};
		}
	}
	updateCourse(data, save){
		if(data && data.id && data.nom && data.items){
			//if(!jsonEqual(this.course.export(), data)){
				if(!this.course) this.course = new Course();

				document.getElementById('recycle').classList.remove('opened');
				

				// app.course = new Course();
				UI.closeModal();

				document.querySelector('#modernCourseAdder form').taxes.value = data.taxes != 0 ? (data.taxes*100).toFixed(1) : 0;
				this.course.updateSelf(this, data);
				Array.from(document.querySelectorAll('.promptActivation, .promptEmpty')).forEach(node => node.remove());

				this.groupe.coursesNodeList.forEach(node => {
					if (node.getAttribute('dbindex') == data.id) node.classList.add('opened')
					else node.classList.remove('opened')
				});

				if (this.course.old) {
					if(data.items.previews.length){
						document.getElementById('recycle').classList.add('opened');
					}
					LocalStorage.setItem('usedCourse', data.id);
					this.buttons = "hide";
				} else{
					LocalStorage.removeItem('usedCourse');
					this.buttons = "show";

					if (data.dateStart == 0) {
						document.querySelector('#panier ul').prepend(Generate.activate());

						this.buttons = "listmode";
					}
				}
				
			//}

			
			return data.items;

		} else UI.offlineMsg(this, "Targeted course content lacks/incomplete", "La course demandée est indisponible pour l'instant")
	
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
			LocalStorage.removeItem("usedCourse");
			this.queue.enqueue(() => this.pull("open"));
		});
	}
	updateInvites(data){
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
			
				accept.addEventListener('click', () => {
					this.acceptInvite(el.id);
				});
				deny.addEventListener('click', () => {
					this.rejectInvite(el.id);
				});
				$('#invitations div').append(button);
			});
		} else $('#invitations div').html('Rien pour l\'instant')
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
	get buttons(){
		return this.buttonsState;
	}
	set buttons(type){
		if(this.buttons != type){
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
				case "listmode": // When course not activated
					Array.from(document.getElementsByClassName("adder")).forEach(el => {
						el.classList.remove("hide");
					});
					document.getElementById("addArt").classList.add("hide");
					this.buttonsState = "listmode";
			}
		} 
	}
	get total(){
		return this.course.totalCost;
	}
	set total(val){
		val = Number(val);
		let total = Number(val.toFixed(2)),
			totalTax = Number((total*(1+this.course.taxes)).toFixed(2)),
			index = Math.floor(Date.now()/(60*60*24*30*1000)) - Math.floor(this.course.dateStart/(60*60*24*30));

		document.getElementById('totalDep').innerHTML = total.toFixed(2) + this.params.currency;
		document.getElementById('totalTaxDep').innerHTML = totalTax.toFixed(2) + this.params.currency;
		if(this.course.maxPrice < totalTax){
			//document.getElementById('panier').style.setProperty('--color-theme', 'linear-gradient(-45deg, #CA5010, #E81123)');
		}
		else{
			document.getElementById('panier').style.setProperty('--color-theme', '');
		}

		this.course.totalCost = total;
	}
}

export default App;