import UI from './UI.js';
import Offline from './offline.js';
import Course from './course.js';
import { LocalStorage, idbStorage } from './storage.js';
import {jsonEqual} from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';

let course;



class App{
	constructor(id){
		document.getElementById('preload').classList.add('close');
		course = new Course();

		if(window.innerWidth < 900){
			document.getElementById('liste').style.visibility = "hidden";
			document.getElementById('liste').style.height = "0";
		}
		LocalStorage.setItem('userId', id);
		this.userId = id;
		this.pullState;
		this.pending; // Avoid collisions
		this.usedGroupe;
		this.liPrices = [0.1,0.5,0.9,1,2,3,4,5,6,7,8,9,10,12,15,17,20];
		this.state = 0;
		this.setParameters();
		this.pull("open");

		//this.errors =  "Cette page est innaccessible pour l'instant";
		
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
				$('.main#liste').css({'visibility':'visible', 'height':'auto'});
				$('header h1').html('Liste de course');
				setTimeout(function(){
					$('.main > ul').css({'transition':'', 'transform':''});
					$('body').addClass('bodyPreview');
					setTimeout(function(){
						$('.main#panier').css({'visibility':'hidden', 'height':'0'});
					},310);
				},10);
				this.state = 1;
				break;
			case 'right':
				$('.main#panier').css({'visibility':'visible', 'height':'auto'});
				$('header h1').html('Panier');
				setTimeout(function(){
					$('.main > ul').css({'transition':'', 'transform':''});
					$('body').removeClass('bodyPreview');
					setTimeout(function(){
						$('.main#liste').css({'visibility':'hidden', 'height':'0'});
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

				idbStorage.delete("courses", id);
				LocalStorage.removeItem("usedCourse");
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

				course.items.articles = course.items.articles.filter(el => el.id != index);
				idbStorage.put("courses", course.export());

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

				course.items.previews = course.items.previews.filter(el => el.id != index);
				idbStorage.put("courses", course.export());

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
					this.usedGroupe.coursesList.forEach(el => idbStorage.delete("courses", el.id));
					idbStorage.delete("groupes", this.usedGroupe.id);
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

				course.items.previews = course.items.previews.filter((obj) => (obj.id != data.id));
				course.items.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
				idbStorage.put("courses", course.export());
				
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
				let oldStructure = idbStorage.get("structures", data.id);
				// Save in IDB in structure objectStore
				if(save) idbStorage.put("structures", {groupes: data.groupes, nom: data.nom, id: data.id})

				// Display UI
				if(data.groupes.length != 0){
					UI.closeModal();
					if(!jsonEqual(oldStructure.groupes, data.groupes)){
						$('.groupe').remove();
						data.groupes.forEach(grp => {
							$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.membres));
						});
					}

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
			if(save) idbStorage.put("groupes", groupe)

			if(this.usedGroupe && groupe.id != this.usedGroupe.id) LocalStorage.setItem('usedCourse', null)

			LocalStorage.setItem('usedGroupe', groupe.id);
	
			// UPD UI parametres
			$('.groupe').removeClass('opened');
			$('.groupe.g'+ groupe.id).addClass('opened');
			$('.adder').css({'display': ''});
			$('#add, #calcul').removeClass('hidden').css({'display':'', 'visibility':''});
			$('.noCourse').remove();
			UI.closeModal();
			
			// UPD CourseList
			if(groupe.coursesList && groupe.coursesList.length != 0){ // Il y a une course
				if(!(this.usedGroupe && this.usedGroupe.coursesList) || !jsonEqual(this.usedGroupe.coursesList, groupe.coursesList)){
					$('.menu .course').remove();
					groupe.coursesList.forEach((el) => {
						$('.menu article').append(Generate.course(this, el.id, el.nom));
					});
				}
				this.usedGroupe = groupe;
			} else {
				$('.menu .course').remove();
				$('.activate, .noCourse').remove();
				UI.closeModal();
				$('#add, #calcul').css({'visibility':'hidden'});
				$('.main ul').children().remove();
				course = new Course();
				$('.adder').css({'display': 'none'});
				$('.main ul').prepend(Generate.noCourse());
	
				this.usedGroupe = groupe;
				return false;
			}
	
			return true;
		} else UI.offlineMsg(this, "Contenu de groupe incomplet", "Le groupe demandé est indisponible pour l'instant")
	}
	updateCourse(data, save){
		if(data && data.id && data.nom && data.items){
			if(!jsonEqual(course.export(), data)){
				$('.activate, .noCourse').remove();
				UI.closeModal();
				$('#add, #calcul').css({'visibility':''});

				if(save) idbStorage.put("courses", data)

				document.getElementById('cTaxes').value = data.taxes != 0 ? (data.taxes*100).toFixed(1) : 0;
				course.update(this, data);

				$('.course').removeClass('opened');
				$('.activate, .noCourse').remove();
				UI.closeModal();
				$('#add, #calcul').removeClass('hidden').css({'display':'', 'visibility':''});
				$('#btTouchSurf').css({'visibility':''});

				Array.from(document.getElementsByClassName('course')).forEach(el => {
					if(el.getAttribute('dbindex') == data.id) el.classList.add('opened')
				});

				if (course.old) {
					LocalStorage.setItem('usedCourse', data.id);
					$('#add, #calcul').addClass('hidden');
					$('#btTouchSurf').css({'visibility':'hidden'});
					$('#add').css({'display':'none'});
				} else LocalStorage.removeItem('usedCourse');

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
				LocalStorage.clear();
				alert("Compte supprimé avec succès");
				window.location = "/";
			}
		});
	}
	totalPP(constante, reset = false){
		let total = Number((course.total + Number(constante)).toFixed(2)),
			totalTax = Number((total*(1+course.taxes)).toFixed(2));
		if(!reset){
			course.total = total;
			course.monthCost += Number(constante);
		}
		$('#totalDep').html(total.toFixed(2) + this.params.currency);
		$('#totalTaxDep').html(totalTax.toFixed(2) + this.params.currency);
		$('#moiDep').html(this.usedGroupe.monthCost.toFixed(2) + this.params.currency);
		$('#moiPrev').html((totalTax * this.usedGroupe.coef).toFixed(2) + this.params.currency);
		$('#anPrev').html((totalTax * this.usedGroupe.coef * 12).toFixed(2) + this.params.currency);
		if(course.maxPrice < totalTax){
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
	}
}

export default App;
export { course };