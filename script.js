let db;

// Ouvrir (ou créer) la base de données IndexedDB
window.onload = function() {
    let request = window.indexedDB.open("LocationVoitureDB", 1);

    request.onerror = function(event) {
        console.error("Erreur d'ouverture de la base de données", event);
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        let objectStore = db.createObjectStore("locations", { keyPath: "id", autoIncrement: true });

        // Créer un index pour chaque champ du formulaire
        objectStore.createIndex("nom_client", "nom_client", { unique: false });
        objectStore.createIndex("telephone_client", "telephone_client", { unique: false });
        objectStore.createIndex("date_depart", "date_depart", { unique: false });
        objectStore.createIndex("heure_depart", "heure_depart", { unique: false });
        objectStore.createIndex("date_arrivee", "date_arrivee", { unique: false });
        objectStore.createIndex("heure_arrivee", "heure_arrivee", { unique: false });
        objectStore.createIndex("prix", "prix", { unique: false });
        objectStore.createIndex("loue_par", "loue_par", { unique: false });
        objectStore.createIndex("plateforme", "plateforme", { unique: false });
        objectStore.createIndex("vehicule_loue", "vehicule_loue", { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };
};

function verifierDisponibilite(item, callback) {
    let transaction = db.transaction(["locations"], "readonly");
    let store = transaction.objectStore("locations");
    let index = store.index("vehicule_loue");

    let request = index.openCursor(IDBKeyRange.only(item.vehicule_loue));
    let estDisponible = true;
    let heureDisponible = '';

    request.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let reservation = cursor.value;
            let debutExistant = new Date(reservation.date_depart + 'T' + reservation.heure_depart);
            let finExistant = new Date(reservation.date_arrivee + 'T' + reservation.heure_arrivee);
            let debutDemande = new Date(item.date_depart + 'T' + item.heure_depart);
            let finDemande = new Date(item.date_arrivee + 'T' + item.heure_arrivee);

            if (debutDemande < finExistant && finDemande > debutExistant) {
                estDisponible = false;
                heureDisponible = finExistant.toTimeString().split(' ')[0];
                callback(estDisponible, heureDisponible);
                return; // Sortir de la fonction
            }
            cursor.continue();
        } else {
            callback(estDisponible, heureDisponible);
        }
    };
}

function enregistrerLocation() {
    let item = {
        nom_client: document.getElementById('nom_client').value,
        telephone_client: document.getElementById('telephone_client').value,
        date_depart: document.getElementById('date_depart').value,
        heure_depart: document.getElementById('heure_depart').value,
        date_arrivee: document.getElementById('date_arrivee').value,
        heure_arrivee: document.getElementById('heure_arrivee').value,
        prix: document.getElementById('prix').value,
        loue_par: document.getElementById('loue_par').value,
        plateforme: document.getElementById('plateforme').value,
        vehicule_loue: document.getElementById('vehicule_loue').value,
    };

    verifierDisponibilite(item, function(estDisponible, heureDisponible) {
        if (estDisponible) {
            let transaction = db.transaction(["locations"], "readwrite");
            let store = transaction.objectStore("locations");
            store.add(item);

            transaction.oncomplete = function() {
                alert("Location enregistrée avec succès.");
            };

            transaction.onerror = function(event) {
                console.error("Erreur lors de l'enregistrement de la location", event);
            };
        } else {
            alert(`Le véhicule n'est pas disponible à ce créneau. Il est disponible à partir de ${heureDisponible}.`);
        }
    });
}

// Ajoutez ici un gestionnaire pour le formulaire de soumission si nécessaire
document.getElementById('formLocation').onsubmit = function(e) {
    e.preventDefault();
    enregistrerLocation();
};
