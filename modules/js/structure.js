import UI from "./UI.js";
import Generate from "./generate.js";
import { IndexedDbStorage } from "./storage.js";

export default class Structure { // Structure means the the User
	constructor(userId){
		this.id = userId;
		this.nom;
		this.mail;
		this.color;
		this.groupes = new Array();
	}
	update(data, save = true){
		this.id = data.id;
		this.mail = data.mail;
		this.nom = data.nom;
		this.color = data.color;

		this.updateGroupes(data.groupes);
		
		if(save) IndexedDbStorage.put("structures", { nom: data.nom, id: data.id, color: data.color, groupes : data.groupes.map(grp => grp.id) })
	}
	updateGroupes(groupes){
		UI.closeModal();

		groupes.forEach((groupe, index) => {
			const groupeNode = document.querySelector(`.groupe[idGroupe="${groupe.id}"]`),
				groupeNodeIndex = this.groupeIndexOf(groupe);
			if(groupeNodeIndex > -1){
				if(groupeNodeIndex != index) groupeNode.parentNode.insertBefore(groupeNode, groupeNode.parentNode.childNodes[index])
			} else {
				if(groupeNode) groupeNode.remove();
				this.insertGroupe(index, groupe);
			}
		});

		this.groupesNodeList.slice(groupes.length).forEach(groupeNode => {
			groupeNode.remove();
		});

		this.groupes = groupes;

		// Enlever les groupes absents en ligne du stockage local
		IndexedDbStorage.filterCursorwise("groupes", null, null, groupe => {
			return !(groupe.user == this.id && this.groupeIndexOf(groupe) == -1);
		});
	}
	insertGroupe(index, groupe){
		if(this.filterGroupe(groupe)){
			const groupeNode = Generate.groupe(groupe.id, groupe.nom, groupe.membres);
			
			if(index) document.querySelector('#groupesContainer div').insertBefore(groupeNode, this.groupesNodeList[index]);
			else document.querySelector('#groupesContainer div').prepend(groupeNode);
		}
	}
	filterGroupe(groupe){ // Verifies is a groupe
		if(groupe.id && groupe.nom && groupe.membres && groupe.membres.length) return true
		else console.log("Course requirements not fullfilled", groupe);
		return false
	}
	groupeIndexOf(groupe){ // Returns the index of the corresponding group node on the UI
		return this.groupesNodeList
		.findIndex((groupeNode, index) => 
			(parseInt(groupeNode.getAttribute("idGroupe")) == groupe.id
			&& groupeNode.children[0].innerHTML == groupe.nom
			&& Array.from(groupeNode.children[1].children).every((li, index) => li.innerHTML == groupe.membres[index]))
		);
	}
	get groupesNodeList(){
		return Array.from(document.getElementsByClassName("groupe"));
	}
}