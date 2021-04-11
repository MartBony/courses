import UI from './UI.js';
import Offline from './offline.js';
import Course from './course.js';
import { LocalStorage, IndexedDbStorage } from './storage.js';
import { jsonEqual, fetcher } from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';

class App{
	constructor(user){
	

		UI.openPanel('panier');
		UI.initChart(this);
		document.getElementById('preload').classList.add('close');
		
		// LocalStorage.setItem('userConnectionData', user);
		this.buttonState;
		this.buttons = "hide";
		this.structure;
		this.usedGroupe;
		this.chartContent;
		this.course;
		this.userId = user.id;
		this.user = user;
		this.pullState;
		this.pending; // Avoid collisions
		this.swipeBinaryState = 0;
		this.setParameters();
		this.pull("open");
		
	}
	setUser(user){
		this.user = user;
	}
	setParameters(){
		let toChange = document.querySelectorAll('.prixFlex, .setPrixFlex, .article h3, .preview h3, #calcul p');
		
		this.params = {
			currency: "€"
		};
		
		if (localStorage.getItem('theme') === 'theme-dark') {
			UI.setTheme('theme-dark');
			document.querySelector("#theme").checked = true;
		} else {
			UI.setTheme('theme-light');
		}

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

		// Load from network
		Pull.invitations(this);
		let pull = Pull.structure(this)
		.then(data => {
			if(data){
				// Update app
				this.pullState.structure = true;
				console.log('Network structure fetched:', data);
				update = this.updateApp(data, true);
				if(update){
					idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || data.groupes[0].id;
					// Pull further
					return Pull.groupe(this, idGroupe);
				}
			} throw "no App data"
		})
		.then(data => {
			if(data){
				// Update Group
				this.pullState.groupe = true;
				console.log('Network groupe fetched:', data);
				update = this.updateGroupe(data, true);
				if(update){
					idCourse = idCourse || LocalStorage.getItem('usedCourse') || data.coursesList[0].id;
					// if(!idCourse) idCourse = this.usedGroupe.coursesList.length != 0 ? this.usedGroupe.coursesList[0].id : null;
					return Pull.course(this, idCourse);
				}
			} throw "no Groupe data"
		})
		.then(data => {
			if(data){
				this.pullState.course = true;
				console.log('Network course fetched:', data);
				const networkItems = this.updateCourse(data, true);
				return Offline.filterPendingRequests(this, networkItems);
			} else throw "no Course data"
		})
		.then(items => {
			this.course.updateItemsModern(this, items.articles, items.previews, true)
		})
		.catch(err => {
			console.error(err);
		})
		.then(() => {
			this.pending = false
			return navigator.serviceWorker.ready
		})
		.then(reg => {if(reg && reg.sync) reg.sync.register('syncCourses')});

		// Load from indexedDB
		if(action == "open") Offline.pull(this, idGroupe, idCourse)

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
	/* setSwipe(swipeBinary){
		if(window.innerWidth < 900){
			if (this.swipeBinaryState == !swipeBinary) {
				switch(swipeBinary){
					case 1:
						$('.main#liste').css({'visibility':'visible', 'height':'auto'});
						$('header h1').html('Liste de course');
						setTimeout(function(){
							$('.main > ul').css({'transition':'', 'transform':''});
							$('body').addClass('bodyPreview');
							setTimeout(function(){
								$('.main#panier').css({'visibility':'hidden', 'height':'0'});
							},310);
						},10);
						this.swipeBinaryState = 1;
						break;
					case 0:
						$('.main#panier').css({'visibility':'visible', 'height':'auto'});
						$('header h1').html('Panier');
						setTimeout(function(){
							$('.main > ul').css({'transition':'', 'transform':''});
							$('body').removeClass('bodyPreview');
							setTimeout(function(){
								$('.main#liste').css({'visibility':'hidden', 'height':'0'});
							},310);
						},10);
						this.swipeBinaryState = 0;
						break;
				}
			}
		}
	} */
	deleteCourse(id){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { deleteCourse: true, id: id, groupe: this.usedGroupe.id}
		}).then(() => {
			$('.loader').removeClass('opened');
			IndexedDbStorage.delete("courses", id);
			LocalStorage.removeItem("usedCourse");
			this.pull("open");
			UI.hideOptions();

		}).catch(res => {
			if (res.responseJSON && res.responseJSON.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			} else {
				$('.loader').removeClass('opened');
				UI.offlineMsg(this, err);
			}
		});
	}
	deleteArticle(index){
		let item = this.course.items.articles.filter(item => item.id == index)[0];
		if(index < 0){
			IndexedDbStorage.delete("requests", -index)
			.then(() => {
				let rank = this.course.items.articles.indexOf(item);

				UI.remove("article", rank);
				this.course.deleteArticle(this, {id: index, prix: item.prix});

			});
		} else {

			if ('serviceWorker' in navigator && 'SyncManager' in window) {
				IndexedDbStorage.put("requests", {
					type: "delArticle",
					data: { id: index, prix: item.prix, groupe: this.usedGroupe.id }
				}).then(() => {
					let rank = this.course.items.articles.indexOf(item);

					UI.remove("article", rank);
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
					data: { deleteArticle: 'true', id: index, groupe: this.usedGroupe.id}
				}).then(data => {
					$('.loader').removeClass('opened');
					let displayedIndex = this.course.items.articles.indexOf(item);

					this.total -= data.prix;
					UI.remove("article", displayedIndex);

					this.course.items.articles = this.course.items.articles.filter(el => el.id != index);
					IndexedDbStorage.put("courses", this.course.export());

				}).catch(res => {
					if (res.responseJSON && res.responseJSON.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
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

				UI.remove("preview", rank);
				this.course.deletePreview(index);

			});
		} else {

			if ('serviceWorker' in navigator && 'SyncManager' in window) {
				
				IndexedDbStorage.put("requests", {
					type: "delPreview",
					data: { id: index, groupe: this.usedGroupe.id }
				}).then(() => {
					let rank = this.course.items.previews.indexOf(item);

					UI.remove("preview", rank);
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
					data: { deletePreview: 'true', id: index, groupe: this.usedGroupe.id}
				}).then(data => {
					$('.loader').removeClass('opened');
					let displayedIndex = this.course.items.previews.indexOf(item);

					$('.article, .preview').removeClass('ready');
					UI.remove("preview", displayedIndex);

					this.course.items.previews = this.course.items.previews.filter(el => el.id != index);
					IndexedDbStorage.put("courses", this.course.export());
				}).catch(err => {
					if (res.responseJSON && res.responseJSON.notAuthed){
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
					} else {
						$('.loader').removeClass('opened');
						UI.offlineMsg(this, res);
					}
				});
				
			}
		}
	}
	leaveGrp(){
		if(this.usedGroupe && this.usedGroupe.id){
			$('.loader').addClass('opened');
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: { leaveGroup: 'true', groupe: this.usedGroupe.id }
			}).then(() => {
				$('.loader').removeClass('opened');
				UI.closeModal();
				this.usedGroupe.coursesList.forEach(el => IndexedDbStorage.delete("courses", el.id));
				IndexedDbStorage.delete("groupes", this.usedGroupe.id);
				this.pull("refresh");
			}).catch(res => {
				if (res.responseJSON && res.responseJSON.notAuthed){
					UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
						{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
					]);
				} else {
					alert("Le serveur a rencontré un problème");
					$('.loader').removeClass('opened');
					UI.offlineMsg(this, err);
				}
			});
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
					document.getElementsByName('activate')[0].click();
					timer = 1000;
				}
				
				document.querySelector('#modernBuyer #newPrice').value = "";
				document.querySelector('#modernBuyer #quantP').value = "1";
				
				// Delete old preview
				UI.closeModernForms();
				
				this.course.deletePreview(idPreview);
				UI.remove("preview", displayedIndex);



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
						groupe: this.usedGroupe.id,
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
						groupe: this.usedGroupe.id
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
						groupe: this.usedGroupe.id
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
					UI.remove("preview", displayedIndex);
	
	
	
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
						UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
							{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
						]);
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
		if(data && data.nom && data.id && data.groupes){
			if(!this.structure || !jsonEqual(this.structure, data)){
				document.querySelector('#compte em').innerHTML = data.nom;
				// Save in IDB in structure objectStore
				if(save) IndexedDbStorage.put("structures", {groupes: data.groupes, nom: data.nom, id: data.id})

				// Display UI
				if(data.groupes.length != 0){
					UI.closeModal();
					if(!this.structure || !jsonEqual(this.structure.groupes, data.groupes)){
						$('.groupe').remove();
						data.groupes.forEach(grp => {
							$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.membres));
						});

						if(this.usedGroupe && this.usedGroupe.id) $(`.groupe[key=${this.usedGroupe.id}]`).addClass('opened');
						
				
					}

					this.structure = data;
					return true;
				} else {
					$('.groupe').remove();
					this.course = new Course();
					UI.modal(this, 'noGroupe');

					this.structure = data;
					return false;
				}

			} else return data.groupes.length != 0;
		}
	}
	updateGroupe(groupe, save){
		if(groupe && groupe.coursesList && groupe.id && groupe.membres && groupe.nom){
			if(!this.usedGroupe || this.usedGroupe.id != groupe.id || !jsonEqual(this.usedGroupe.membres, groupe.membres)){

				if(this.usedGroupe) console.log(!jsonEqual(this.usedGroupe.membres, groupe.membres));
				// Save in IDB in structure objectStore
				if(save) IndexedDbStorage.put("groupes", groupe)

				if(this.usedGroupe && groupe.id != this.usedGroupe.id) LocalStorage.setItem('usedCourse', null)

				LocalStorage.setItem('usedGroupe', groupe.id);
		
				// UPD UI parametres
				Array.from(document.querySelectorAll('.groupe')).forEach(node => {
					node.classList.remove("opened");
					if(node.getAttribute('key') == groupe.id) node.classList.add('opened')
				});
				Array.from(document.querySelectorAll('.noCourse')).forEach(node => node.remove());
				this.course = new Course();
				UI.closeModal();
				
				// UPD CourseList
				if(groupe.coursesList && groupe.coursesList.length != 0){ // Il y a une course
					if(!(this.usedGroupe && this.usedGroupe.coursesList) || !jsonEqual(this.usedGroupe.coursesList, groupe.coursesList)){
						Array.from(document.querySelectorAll('#menu .course')).forEach(node => node.remove());

						// Update Chart
						const chartLen = 6,
							monthStamp = 60*60*24*30,
							timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp,
							dayLeft = Math.round((timeMarker-(Date.now()/1000))/(60*60*24));
						document.getElementById("endmonth").innerHTML = dayLeft ? dayLeft +" Jours" : "Ajourd'hui";
						this.chartContent = new Array(chartLen).fill(0);
						groupe.coursesList.forEach((el) => {
							for (let i = 0; i < chartLen; i++) {
								if(el.date > timeMarker-(monthStamp*(i+1)) && el.date < timeMarker-(monthStamp*i))  this.chartContent[chartLen-i-1] += parseFloat(el.prix)
							}
							document.querySelector('#menu article').appendChild(Generate.course(this, el.id, el.nom));
						});
						this.chartContent = this.chartContent.map(el => parseFloat(el.toFixed(2)));
					}
					this.usedGroupe = groupe;
					return true;
				} else {
					Array.from(document.querySelectorAll('#menu .course')).forEach(node => node.remove());
					Array.from(document.querySelectorAll('.main ul')).forEach(node => node.prepend(Generate.noCourse()));
					this.buttons = "hide";
		
					this.usedGroupe = groupe;
					return false;
				}

			}
			
			return (groupe.coursesList && groupe.coursesList.length != 0);

		} else UI.offlineMsg(this, "Contenu de groupe incomplet", "Le groupe demandé est indisponible pour l'instant")
	}
	updateCourse(data, save){
		if(data && data.id && data.nom && data.items){
			//if(!jsonEqual(this.course.export(), data)){
				// HERE INTEGRATE THE REQUESTS

				if(save) IndexedDbStorage.put("courses", {
					id: data.id,
					dateStart: data.dateStart,
					groupe: data.groupe,
					maxPrice: data.maxPrice,
					nom: data.nom,
					taxes: data.taxes,
					total: data.total
				})

				// app.course = new Course();
				UI.closeModal();
				Array.from(document.querySelectorAll('.course')).forEach(node => node.classList.remove('opened'));

				document.getElementById('cTaxes').value = data.taxes != 0 ? (data.taxes*100).toFixed(1) : 0;
				this.course.updateSelf(this, data, save);


				Array.from(document.getElementsByClassName('course')).forEach(el => {
					if(el.getAttribute('dbindex') == data.id) el.classList.add('opened')
				});

				if (this.course.old) {
					LocalStorage.setItem('usedCourse', data.id);
					this.buttons = "hide";
				} else{
					LocalStorage.removeItem('usedCourse');
					this.buttons = "show";

					if (data.dateStart == 0) {
						$('#panier ul').prepend(Generate.activate());

						this.buttons = "listmode";
					}
				}
				
			//}

			
			return data.items;

		} else UI.offlineMsg(this, "Targeted course content lacks/incomplete", "La course demandée est indisponible pour l'instant")
	
		return data.items || { articles: new Array(), previews: new Array() };
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
		}).then(() =>{
			Pull.invitations(this);
			this.pull("refresh");
		}).catch(res => {
			if (res.responseJSON && res.responseJSON.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			} else if(res.status == 404 && res.responseJSON && res.responseJSON == {err: "Not Proposed"}){
				UI.erreur("Action impossible, la requete porte vers un groupe qui ne vous est plus proposé");
			} else if(res.status == 403 && res.responseJSON && res.responseJSON == {err: "Already present"}) {
				UI.erreur("Vous appartenez déja à ce groupe");
			} else {	
				console.error(res);
				$('#invitations div').append('Un problème est survenu');
			}
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
	/* totalPP(constante, reset = false){
		let total = Number((this.course.total + Number(constante)).toFixed(2)),
			totalTax = Number((total*(1+this.course.taxes)).toFixed(2)),
			index = Math.floor(Date.now()/(60*60*24*30*1000)) - Math.floor(this.course.dateStart/(60*60*24*30));
		if(!reset){
			this.course.total = total;
			this.course.monthCost += Number(constante);
		}
		if(index <= 5 && index >= 0) {
			this.chartContent[this.chartContent.length - index - 1] = parseFloat((this.chartContent[this.chartContent.length - index - 1] + constante)).toFixed(2);
			this.chartContent[this.chartContent.length - index - 1] = parseFloat(this.chartContent[this.chartContent.length - index - 1]);
		}
		$('#totalDep').html(total.toFixed(2) + this.params.currency);
		$('#totalTaxDep').html(totalTax.toFixed(2) + this.params.currency);
		$('#moiDep').html(this.usedGroupe.monthCost.toFixed(2) + this.params.currency);
		$('#moiPrev').html((totalTax * this.usedGroupe.coef).toFixed(2) + this.params.currency);
		$('#anPrev').html((totalTax * this.usedGroupe.coef * 12).toFixed(2) + this.params.currency);
		if(this.course.maxPrice < totalTax){
			$('#panier').css({'--color-theme': 'linear-gradient(-45deg, #CA5010, #E81123)'});
		}
		else{
			$('#panier').css({'--color-theme': ''});
		}
	} */
	generateInviteKey(){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/invites.php",
			data: { getInviteKey: true }
		}).then(data => {
			$('.loader').removeClass('opened');
			$('#idInvit h4').html(data.id);
		}).catch(res => {
			$('.loader').removeClass('opened');
			if(res.responseJSON){	
				if (res.responseJSON.notAuthed){
					UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
						{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
					]);
				} else {
					$('.loader').removeClass('opened');
					UI.offlineMsg(this, res.responseJSON);
				}
			} else {
				UI.offlineMsg(this, "Il y a eu un problème innatendu");
			}
		});
	}
	get buttons(){
		return this.buttonState;
	}
	set buttons(type){
		if(this.buttons != type){
			switch(type){
				case "hide":
					Array.from(document.getElementsByClassName("adder")).forEach(el => {
						el.classList.add("hide");
					});
					this.buttonState = "hide";
					break;
				case "show":
					Array.from(document.getElementsByClassName("adder")).forEach(el => {
						el.classList.remove("hide");
					});
					this.buttonState = "show";
					break;
				case "listmode": // When course not activated
					Array.from(document.getElementsByClassName("adder")).forEach(el => {
						el.classList.remove("hide");
					});
					document.querySelector(".adder").classList.add("hide");
					this.buttonState = "listmode";
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

		if(index <= 5 && index >= 0) {
			this.chartContent[this.chartContent.length - index - 1] = parseFloat((this.chartContent[this.chartContent.length - index - 1] + val)).toFixed(2);
			this.chartContent[this.chartContent.length - index - 1] = parseFloat(this.chartContent[this.chartContent.length - index - 1]);
		}

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