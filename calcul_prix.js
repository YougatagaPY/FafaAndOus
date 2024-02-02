let db;

window.onload = function() {
    let request = window.indexedDB.open("LocationVoitureDB", 1);

    request.onerror = function(event) {
        console.error("Erreur d'ouverture de la base de données", event);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };
};

document.getElementById('formCalculPrix').onsubmit = function(e) {
    e.preventDefault();
    calculerPrixTotal();
};

function calculerPrixTotal() {
    let dateDebut = document.getElementById('date_debut').value;
    let dateFin = document.getElementById('date_fin').value;
    let transaction = db.transaction(["locations"], "readonly");
    let store = transaction.objectStore("locations");
    let request = store.openCursor();
    let prixTotal = 0;

    request.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let location = cursor.value;
            if (location.date_depart >= dateDebut && location.date_arrivee <= dateFin) {
                prixTotal += parseFloat(location.prix);
            }
            cursor.continue();
        } else {
            document.getElementById('prixTotal').textContent = `€ ${prixTotal.toFixed(2)}`;
        }
    };
}
