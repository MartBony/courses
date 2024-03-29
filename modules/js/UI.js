import Touch from "./touch.js";
import { fetcher } from "./tools.js";
import Animations from "./animations.js";
import Pull from './requests.js';
import { IndexedDbStorage } from './storage.js';

class stateCard extends HTMLElement {
	cardState;
	constructor(){
		super();
		this.state = 0;
	}
	setValue(avancement){
		this.querySelector("#avancementprc").innerHTML = `${parseInt(avancement*100)}%`;
		avancement = Math.min(avancement, 1);
		this.style.setProperty("--prc", avancement);
		if(avancement>0.9){
			this.classList.add("alert");
		} else this.classList.remove("alert");
	}
	get state(){
		return this.cardState;
	}
	set state(state){
		Array.from(this.children).forEach((span, index) => {
			span.style.display = index == state ? "block" : "none";
		});
	}
}

class ItemOptions extends HTMLElement{
	itemNode;
	opened = false;
	msgButtonsState = ["", ""];
	constructor(){
		super();
		this.generateEventListeners();
	}
	open(itemNode, position){

		// Animate panel
		if(!this.opened){
			this.classList.add("opened");
			Animations.createAnimation(this.children[0], [
				{
					transform: window.innerWidth < 900 ? "translateY(300px)" : "scale(0.6)",
					opacity: 0
				},{
					transform: "translateY(0) scale(1)",
					opacity: 1
				}
			], {
				duration: 300,
				fill: 'forwards',
				easing: Animations.ease.in
			})
		}

		if(position.x && position.y){
			this.style.setProperty("--pos-bottom", `max(0px, calc(100vh - ${position.y + 100}px))`);
			this.style.setProperty("--pos-left", `${Math.max(position.x - 200, 0)}px`);
		}

		// Update content
		const titreEl = this.querySelector('h2'),
		prixEl = this.querySelector('h3'),
		buttons = this.querySelectorAll("ul li");

		titreEl.innerHTML = `${itemNode.content.titre}</div></div>`;
		this.style.setProperty("--hue-item", document.querySelector("app-window").domainesHues[itemNode.content.id_domaine]);
		if(itemNode.content.type == 'article'){
			const spansPrice = Array.from(prixEl.querySelectorAll('span'));
			prixEl.style.display = "";
			spansPrice.forEach(span => span.innerHTML = itemNode.content.prixSTR);
			buttons[1].style.display = "none";
		} else {
			prixEl.style.display = "none";
			buttons[1].style.display = "";
		}

		if(itemNode.content.id < 0){
			this.querySelector("p").style.display = "block";
			this.querySelector("form").style.display = "none";
		} else {
			this.querySelector("p").style.display = "";
			this.querySelector("form").style.display = "";
		}

		if(itemNode.content.message){
			this.setMessageButtons(0, "block");
		}



		this.querySelector("select").selectedIndex = itemNode.content.id_domaine || 0;

		document.body.style.overflow = "hidden";

		this.querySelector("textarea").value = itemNode.content.message || null;

		this.itemNode = itemNode;
		this.opened = true;
	}
	close(){

		document.body.style.overflow = "";
		
		this.itemNode = null;
		this.opened = false;

		Animations.createAnimation(this.children[0], [
			{
				transform: "translateY(0) scale(1)",
				opacity: 1
			},{
				transform: window.innerWidth < 900 ? "translateY(300px)" : "scale(0.6)",
				opacity: 0
			}
		], {
			duration: 80,
			fill: 'forwards',
			easing: Animations.ease.out
		}).then(() => {
			this.classList.remove("opened");
			this.style.setProperty("--pos-bottom", "");
			this.style.setProperty("--pos-left", "");
			this.setMessageButtons(0,"").setMessageButtons(1,"");
		});

	}
	generateEventListeners(){
		this.addEventListener('click', event => {
			const itemContent = this.itemNode.content;
			if(event.target.classList.contains("ms-Icon--Cancel") || event.target == this) this.close();
			else if(event.target.tagName == "I" && event.target.parentElement.parentElement.tagName == "UL"){
				if(event.target.classList.contains('ms-Icon--Delete')){
					if(this.itemNode.content.type == 'article'){
						document.querySelector("app-window").deleteArticle(this.itemNode.content.id);
					} else document.querySelector("app-window").deletePreview(this.itemNode.content.id);
					this.close();
				} else {
					if(this.itemNode.content.type == 'preview') UI.openModernForm("buy", {id: this.itemNode.content.id, titre:this.itemNode.content.titre});
				}
			} else if (event.target.tagName == "I" && event.target.parentElement.id == "msg-action"){
				this.querySelector("textarea").value = "";
				this.setMessageButtons(0, "");
				if(this.itemNode.content.message){
					this.setMessageButtons(1, "block");
				} else {
					this.setMessageButtons(1, "");
				}
			}
		});

		this.querySelector("textarea").addEventListener("keyup", event => {
			
			if(event.target.value == ""){
				this.setMessageButtons(0, "");
			} else {
				this.setMessageButtons(0, "block");
			}
			
			if(this.itemNode.message == event.target.value){
				this.setMessageButtons(1, "");
			} else {
				this.setMessageButtons(1, "block");
			}
		});

		this.addEventListener("submit", async event => {
			event.preventDefault();
			const form = event.target,
			itemContent = this.itemNode.content;
			try{
				let res = await fetcher({
					url: "serveur/pushAnywhere.php",
					method: "POST",
					body: {
						action: "submitMessage",
						message: form.message.value,
						idItem: itemContent.id
					}
				});

				if(res.status == 200){
					this.setMessageButtons(1, "");
					itemContent.message = res.payload.message;
					form.message.value = res.payload.message;
					// document.querySelector("app-window").refresh();
					IndexedDbStorage.put("items", itemContent);
					if(res.payload.message == "") this.setMessageButtons(0, "");
					else this.setMessageButtons(0, "block");
		
				} else throw res;
			} catch(err) {
				UI.parseErrors(err);
			}
		
		});

		this.getElementsByTagName("select")[0].addEventListener("change", event => {
			const itemContent = this.itemNode.content;
			fetcher({
				method: "POST",
				url: "serveur/pushAnywhere.php",
				body: {
					action: "setItemType",
					itemId: itemContent.id,
					type: event.target.selectedIndex
				}
			}).then(res => {
				if(res.status = 200 && res.payload.hue && res.payload.id){
					this.style.setProperty("--hue-item", res.payload.hue);
					this.itemNode.content = {hue: res.payload.hue, id_domaine: res.payload.id};
					this.itemNode.save(res.payload.id_course);
				} else throw res
			}).catch(err => {
				UI.parseErrors(err);
			});
		});

	}
	setMessageButtons(buttonIndex, value){
		const messageButtons = this.querySelector("#msg-action").children;
		messageButtons[buttonIndex].style.display = value;
		this.msgButtonsState[buttonIndex] = value;
		if(this.msgButtonsState.every(state => !state)){
			this.querySelector("#msg-action").style.display = "";
		} else this.querySelector("#msg-action").style.display = "flex"
		return this;
	}
}

customElements.define('item-options', ItemOptions);

customElements.define('state-card', stateCard);

export default class UI {
	static message(titre, texte, buttons, timer = 7000){
		document.querySelector('#message').classList.add('opened');

		if(titre) document.querySelector('#message h2').innerHTML = titre
		else document.querySelector('#message h2').style.display = "none"

		if(texte) document.querySelector('#message p').innerHTML = texte
		else document.querySelector('#message p').style.display = "none"

		document.querySelectorAll('#message button').forEach(el => el.remove());
		if(!buttons || buttons.length == 0){
			setTimeout(() => {UI.closeMessage()}, timer);
		} else {

			buttons.forEach(button => {
				if(button.texte && button.action) {
					let buttonElement  = document.createElement('button');
					buttonElement.innerHTML = button.texte;
					buttonElement.addEventListener('click', () => button.action());
					document.querySelector('#message div').appendChild(buttonElement);

					if(button.class) buttonElement.classList.add(button.class)
				}
			});
		}
	}
	static closeMessage(){
		document.querySelectorAll('.notification').forEach(el => el.classList.remove('opened'));
	}
	static parseErrors(err){
		if(err && err.error){
			switch(err.error){
				case "badReq":
					UI.erreur("Un problème est survenu.", "Requête incomplête.");
					break;
				case "badValues":
					UI.erreur("Un problème est survenu.", "Valeurs incorrectes.");
					break;
				case "forbidden":
					UI.erreur("Un problème est survenu.", "Vous n'êtes pas pas autorisé à accéder à cette requête.");
					break;
				case "notFound":
					UI.erreur("Nous ne trouvons pas ce que vous cherchez.", "Un autre membre du groupe a peut-être modifié cet élément.");
					break;
				case "unknown":
					UI.erreur("Un problème est survenu.", "Un erreur inattendue est survenue. Veuillez réessayer.");
					break;
				case "tooManyActiveListes":
					UI.erreur("Nombre maximum de listes de courses atteint.", "Le nombre de listes de courses actives est trop important. Veuillez en recycler.");
					break;
				case "tooManyGroups":
					UI.erreur("Nombre maximum de groupes atteint.", "Il faut quitter un autre groupe pour en rejoindre un nouveau.");
					break;
				case "isold":
					UI.erreur("La liste n'est plas active.", "Veuillez ouvrir une liste active dans le menu de l'application.");
					break;	
			}
		} else {
			console.error(err);
		}
	}
	static erreur(titre = "Un problème est survenu.", texte, buttons){
		document.querySelector('#erreur').classList.add('opened');

		document.querySelector('#erreur h2').innerHTML = titre;

		if(texte) document.querySelector('#erreur p').innerHTML = texte
		else document.querySelector('#erreur p').style.display = "none"

		document.querySelectorAll('#erreur button').forEach(el => el.remove());
		if(!buttons || buttons.length == 0){
			setTimeout(() => {UI.closeMessage()}, 7000);
		} else {
			buttons.forEach(button => {
				if(button.texte && button.action) {
					let buttonElement  = document.createElement('button');
					buttonElement.innerHTML = button.texte;
					buttonElement.addEventListener('click', () => button.action());
					document.querySelector('#erreur div').appendChild(buttonElement);

					if(button.class) buttonElement.classList.add(button.class)
				}
			});
		}
	}
	static msgIsOffline(){
		UI.message("Vous êtes hors ligne", "Certaines fonctionnalités seront limités, vos modifications seront synchronisées ulterieurement", null, 3000);
	}
	static offlineMsg(msg){
		msg = msg || "Cette requête n'a pas pu aboutir, connectez-vous et réessayez.";
		UI.erreur("Le réseau est indisponible.", msg);
	}
	static requireAuth(){
		UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
			{
				texte:"Se connecter", 
				action : () => {
					document.getElementById('authContainer').classList.add('opened');
					UI.closeMessage();
				}
			}
		]);
	}
	static openPanel(type){
		document.getElementById('depensesChart').style.opacity = "0";
		document.getElementById('mainPanel').className = type;
		document.getElementById('menubar').className = type;
		document.getElementById('buttons').className = type;
		if((type == 'calcul' || type == "menu")) UI.openChart();
	}
	static openMenus(type, data = null){
		document.getElementById('menus').className = `opened ${type}`;
		if(type == 'params') Pull.invitations()
		setTimeout(() => {document.body.style.overflowY = "hidden"}, 500);
	}
	static closeMenus(){
		document.getElementById('menus').className = "";
		document.getElementById('depensesChart').style.opacity = "0";
		setTimeout(() => {document.body.style.overflowY = ""}, 500);
	}
	static initChart(){
		const app = document.querySelector("app-window");
		const ctx = document.getElementById('depensesChart').getContext('2d');
		app.chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: new Array(6).fill(""),
				datasets: [{
					label: 'Quelconque',
					data: new Array(6).fill(0),
					backgroundColor: 'rgb(245, 214, 214)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				},{
					label: 'Alimentaire',
					data: new Array(6).fill(0),
					backgroundColor: 'rgb(245, 240, 214)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				},{
					label: 'Ménager',
					data: new Array(6).fill(0),
					backgroundColor: 'rgb(224, 245, 214)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				},{
					label: 'Divertissement',
					data: new Array(6).fill(0),
					backgroundColor: 'rgb(214, 235, 245)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				}]
			},
			responsive: true,
			options: {
				scales: {
					x: {
						stacked: true,
					},
					y: {
						stacked: true
					}
				}
			}
		});
	}
	static openChart(){
		const app = document.querySelector("app-window");
		if(app.groupe){
			// Update chart
			const graph = app.groupe.graphData;
			document.getElementById('depensesChart').style.opacity = "1";
			const labels = Array(6).fill("");
			labels[labels.length-1] = "Mois Actuel";
			app.chart.data.labels = labels;
			app.chart.data.datasets.forEach((dataset,index) => dataset.data = graph[index]);
			app.chart.update();

			// Update Calculs
			document.getElementById("averagecourses").innerHTML = app.groupe.averageCoursesCost;
		}
	}
	static modal(action, data){
		document.querySelector('#modal').classList.add('opened', action || '');
		if(action == "leaveGroupe" && data)document.querySelector('#leaveGroupe div').innerHTML = data;
		else if (action == "deleteCourse" && data) document.getElementById('deleteCourse').setAttribute("idCourse", data);
		
	}
	static closeModal(){
		document.querySelector('#modal').className = '';
	}
	static acc(){
		UI.closeModernForms();
		UI.closeMenus();
		document.querySelector("item-options").close();
	}
	static openModernForm(type = "article", data){
		let button;

		document.body.style.overflow = "hidden";
		document.body.classList.add("formed");

		switch(type){
			case "article":
				button = document.getElementById("addArt");
				document.getElementById("modernForms").classList.add("opened", "articleForm");
				setTimeout(() => document.querySelector(`#modernArticleAdder input`).focus(), 300)

				break;
			case "preview":
				button = document.getElementById("addPrev");
				document.getElementById("modernForms").classList.add("opened", "previewForm");
				setTimeout(() => document.querySelector(`#modernPreviewAdder input`).focus(), 300)

				break;
			case "course":
				button = document.getElementById("addCourse");
				document.getElementById("modernForms").classList.add("opened", "courseForm");
				document.querySelector(`#modernCourseAdder input`).focus();


				break;

			case "courseEditor":
				/* Le formulaire est déja rempli par les informations de course lors de l'ouverture de celle-ci */
				document.getElementById("modernForms").classList.add("opened", "courseEditForm");


				break;

			case "buy":
				if(data && data.id && data.titre){
					
					document.querySelector('#modernBuyer h2').innerHTML = `Acheter ${data.titre}`;
					document.getElementById('modernBuyer').setAttribute("key", data.id);

					document.getElementById("modernForms").classList.add("opened", "buyForm");
					setTimeout(() => document.querySelector(`#modernBuyer input`).focus(), 300);

				}
				break;
			case "groupe":
				document.getElementById("modernForms").classList.add("opened", "groupeForm");
				setTimeout(() => document.querySelector(`#modernGroupeAdder input`).focus(), 300);

				break;
			case "inviter":
				document.querySelector("#modernInviteur h2").innerHTML = data;
				document.getElementById("modernForms").classList.add("opened", "inviteForm");
				setTimeout(() => document.querySelector(`#modernInviteur input`).focus(), 300);
		}

		if(button){
			button.style.transition = "none";
			button.style.opacity = "0";
		}
	}
	static closeModernForms(){
		document.body.style.overflow = "";
		document.body.classList.remove("formed");
		document.querySelector('#modernForms').className = "";
		Array.from(document.querySelectorAll(".adder, #addCourse")).forEach(el => {el.style.opacity = "";el.style.transition = ""});
	}
	static removeArticle(course, itemIndex, rank = 0){
		const selectedElement = document.querySelector(`li[idItem="${itemIndex}"]`),
		positions = course.articlesNodeList.map(el => [el, el.getBoundingClientRect()]),
		anim = Animations.removeItem(selectedElement).then(() => {
			selectedElement.remove();
			positions.forEach((elData, index) => {
				const el = elData[0],
				oldPos = elData[1],
				newPos = el.getBoundingClientRect();

				Animations.createAnimation(el, [
					{
						width: `${oldPos.width}px`,
						height: `${oldPos.height}px`,
						transform: `translate(${-(newPos.left - oldPos.left)}px, ${-(newPos.top - oldPos.top)}px)`
					},
					{
						width: `${newPos.width}px`,
						height: `${newPos.height}px`,
						transform: `translate(0,0)`
					}
				], {
					duration: 200 + (index-rank)*20,
					fill: 'forwards',
					easing: Animations.ease.move
				}).then(el => {
					el.style.width = "";
					el.style.height = "";
					el.style.transform = "";
				});
			});
		});
	}
	static removePreview(course, itemIndex, rank = 0){
		const selectedElement = document.querySelector(`li[idItem="${itemIndex}"]`),
		positions = course.previewsNodeList.map(el => [el, el.getBoundingClientRect()]),
		anim = Animations.removeItem(selectedElement).then(() => {
			selectedElement.remove();
			positions.forEach((elData, index) => {
				const el = elData[0],
				oldPos = elData[1],
				newPos = el.getBoundingClientRect();

				Animations.createAnimation(el, [
					{
						width: `${oldPos.width}px`,
						height: `${oldPos.height}px`,
						transform: `translate(${-(newPos.left - oldPos.left)}px, ${-(newPos.top - oldPos.top)}px)`
					},
					{
						width: `${newPos.width}px`,
						height: `${newPos.height}px`,
						transform: `translate(0,0)`
					}
				], {
					duration: 200 + (index-rank)*20,
					fill: 'forwards',
					easing: Animations.ease.move
				}).then(el => {
					el.style.width = "";
					el.style.height = "";
					el.style.transform = "";
				});
			});
		});
	}
	static hideOptions(){
		Array.from(document.getElementsByClassName('options')).forEach(option => {
			option.classList.remove('opened');
		});
	}
}
