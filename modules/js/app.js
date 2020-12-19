import UI from './UI.js';
import Offline from './offline.js';
import Course from './course.js';
import { LocalStorage, idbStorage } from './storage.js';
import {jsonEqual} from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';


class App{
	constructor(id){
		UI.openPanel('panier');
		UI.initChart(this);
		document.getElementById('preload').classList.add('close');

		LocalStorage.setItem('userId', id);
		this.structure;
		this.usedGroupe;
		this.chartContent;
		this.course = new Course();
		this.userId = id;
		this.pullState;
		this.pending; // Avoid collisions
		this.liPrices = [0.1,0.5,0.9,1,2,3,4,5,6,7,8,9,10,12,15,17,20];
		this.swipeBinaryState = 0;
		this.setParameters();
		this.pull("open");
		
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

		toChange.forEach(item => item.innerHTML = item.innerHTML.replace(/[\$€]/g, this.params.currency));
	}
	async pull(action, idGroupe, idCourse){// Rank as index of array
		console.log("-- PULLING --");
		let update,
			anim = () => {
				$('#refresh i, #headRefresh').removeClass('ms-Icon--Refresh').addClass('ms-Icon--Accept');
				setTimeout(function(){
					$('#refresh i, #headRefresh').addClass('ms-Icon--Refresh').removeClass('ms-Icon--Accept');
				},2000);
			};
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
					$('.loader').removeClass('opened');
					this.pending = false;
					anim();
				}
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
					$('.loader').removeClass('opened');
					this.pending = false;
					anim();
				}
			})
			.then(data => {
				if(data){
					this.pullState.course = true;
					console.log('Network course fetched:', data);
					update = this.updateCourse(data, true);
				}
				$('.loader').removeClass('opened');
				this.pending = false;
				anim();
				return;
			});

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
			idbStorage.delete("courses", id);
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
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { deleteArticle: 'true', id: index, groupe: this.usedGroupe.id}
		}).then(data => {
			$('.loader').removeClass('opened');
			let displayedIndex = this.course.items.articles.indexOf(item);

			this.totalPP(-data.prix);
			UI.remove("article", displayedIndex);

			this.course.items.articles = this.course.items.articles.filter(el => el.id != index);
			idbStorage.put("courses", this.course.export());

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
	deletePreview(index){
		let item = this.course.items.previews.filter(item => item.id == index)[0];
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { deletePreview: 'true', id: index, groupe: this.usedGroupe.id}
		}).then(data => {
			$('.loader').removeClass('opened');
			if (data.status == 200) {
				let displayedIndex = this.course.items.previews.indexOf(item);

				$('.article, .preview').removeClass('ready');
				UI.remove("preview", displayedIndex);

				this.course.items.previews = this.course.items.previews.filter(el => el.id != index);
				idbStorage.put("courses", this.course.export());

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
			}).then(() => {
				$('.loader').removeClass('opened');
				UI.closeModal();
				this.usedGroupe.coursesList.forEach(el => idbStorage.delete("courses", el.id));
				idbStorage.delete("groupes", this.usedGroupe.id);
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
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: {
				buyPreview: 'true',
				id: idPreview,
				prix: prix,
				groupe: this.usedGroupe.id
			}
		}).then(data => {
			console.log(true);
			$('.loader').removeClass('opened');
			let timer = 600,
				displayedIndex = $(`.preview[iditem=${idPreview}]`).prevAll('li').length;

				console.log(true);
	
			if (!this.course.started) {
				$('.activate').click();
				timer = 1000;
			}
			console.log(true);
	
			UI.closePrice();
			UI.remove("preview", displayedIndex);
			setTimeout(() => {
				UI.openPanel("panier");
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
			console.log(true);

			this.course.items.previews = this.course.items.previews.filter((obj) => (obj.id != data.id));
			this.course.items.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
			idbStorage.put("courses", this.course.export());

		}).catch(res => {
			$('.loader').removeClass('opened');
			if (res.responseJSON && res.responseJSON.notAuthed){
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			} else if(res.status == 400 && res.responseJSON && res.responseJSON.indexOf("Negative value") > -1){
				UI.erreur("Le prix doit être positif")
			}
			else {
				UI.offlineMsg(this, err);
			}
		});
	}
	updateApp(data, save){
		if(data && data.nom && data.id && data.groupes){
			if(!this.structure || !jsonEqual(this.structure, groupe)){
				$('#compte em').html(data.nom);
				if(data.groupes){

					// Save in IDB in structure objectStore
					if(save) idbStorage.put("structures", {groupes: data.groupes, nom: data.nom, id: data.id})

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

						return true;
					} else {
						$('.groupe').remove();
						this.course = new Course();
						UI.modal(this, 'noGroupe');

						this.structure = data;
						return false;
					}
				}
			} else return data.groupes.length != 0;
		}
	}
	updateGroupe(groupe, save){
		if(groupe && groupe.coursesList && groupe.id && groupe.membres && groupe.nom){
			if(!jsonEqual(this.usedGroupe, groupe)){

				// Save in IDB in structure objectStore
				if(save) idbStorage.put("groupes", groupe)

				if(this.usedGroupe && groupe.id != this.usedGroupe.id) LocalStorage.setItem('usedCourse', null)

				LocalStorage.setItem('usedGroupe', groupe.id);
		
				// UPD UI parametres
				$('.groupe').removeClass('opened');
				$(`.groupe[key=${groupe.id}]`).addClass('opened');
				$('.noCourse').remove();
				this.course = new Course();
				UI.closeModal();
				
				// UPD CourseList
				if(groupe.coursesList && groupe.coursesList.length != 0){ // Il y a une course
					if(!(this.usedGroupe && this.usedGroupe.coursesList) || !jsonEqual(this.usedGroupe.coursesList, groupe.coursesList)){
						$('#menu .course').remove();
						const chartLen = 6,
							monthStamp = 60*60*24*30,
							timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp;
						this.chartContent = new Array(chartLen).fill(0);
						groupe.coursesList.forEach((el) => {
							for (let i = 0; i < chartLen; i++) {
								if(el.date > timeMarker-(monthStamp*(i+1)) && el.date < timeMarker-(monthStamp*i))  this.chartContent[chartLen-i-1] += parseFloat(el.prix)
							}
							$('#menu article').append(Generate.course(this, el.id, el.nom));
						});
						this.chartContent = this.chartContent.map(el => parseFloat(el.toFixed(2)));
					}
					this.usedGroupe = groupe;
					return true;
				} else {
					$('#menu .course').remove();
					$('.main ul').prepend(Generate.noCourse());
		
					this.usedGroupe = groupe;
					return false;
				}

			}
			
			return (groupe.coursesList && groupe.coursesList.length != 0);

		} else UI.offlineMsg(this, "Contenu de groupe incomplet", "Le groupe demandé est indisponible pour l'instant")
	}
	updateCourse(data, save){
		if(data && data.id && data.nom && data.items){
			if(!jsonEqual(this.course.export(), data)){
				this.course = new Course();
				UI.closeModal();
				$('.course').removeClass('opened');
				$('#btTouchSurf').css({'visibility':''});

				if(save) idbStorage.put("courses", data)

				document.getElementById('cTaxes').value = data.taxes != 0 ? (data.taxes*100).toFixed(1) : 0;
				this.course.update(this, data);


				Array.from(document.getElementsByClassName('course')).forEach(el => {
					if(el.getAttribute('dbindex') == data.id) el.classList.add('opened')
				});

				if (this.course.old) {
					LocalStorage.setItem('usedCourse', data.id);
					$('#btTouchSurf').css({'visibility':'hidden'});
				} else{
					LocalStorage.removeItem('usedCourse');

					if (data.dateStart == 0) {
						$('.main ul').prepend(Generate.activate());

						UI.openPanel('liste');
					}
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
				idbStorage.deleteDb()
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
	totalPP(constante, reset = false){
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
		console.log(this.chartContent[this.chartContent.length - index - 1]);
		$('#totalDep').html(total.toFixed(2) + this.params.currency);
		$('#totalTaxDep').html(totalTax.toFixed(2) + this.params.currency);
		$('#moiDep').html(this.usedGroupe.monthCost.toFixed(2) + this.params.currency);
		$('#moiPrev').html((totalTax * this.usedGroupe.coef).toFixed(2) + this.params.currency);
		$('#anPrev').html((totalTax * this.usedGroupe.coef * 12).toFixed(2) + this.params.currency);
		if(this.course.maxPrice < totalTax){
			$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
		}
		else{
			$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
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
}

export default App;