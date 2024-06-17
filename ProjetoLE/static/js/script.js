let selectedAncestral = null;
let selectedSubAncestral = null;
let selectedEstilo = null;
let selectedClasse = null;
let selectedSubClasseVida = null;
let selectedSubClasseEspecialista = null;
let selectedGuilda = null;

function showSection(section) {
    // Remove 'active' class from all navbar links
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active');
    });
    // Add 'active' class to the clicked link
    document.querySelector(`.navbar a[href="#${section}"]`).classList.add('active');

    // Hide all sections
    document.querySelectorAll('div[id$="-section"]').forEach(el => el.classList.add('hidden'));

    // Show the selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');

    // Load specific data when the sub-ancestral or estilo section is shown
    if (section === 'sub-ancestral') {
        fetchSubAncestries(selectedAncestral);
    } else if (section === 'classe') {
        fetchClassesByEstilo(selectedEstilo);
    }
}

document.querySelectorAll('.card[data-ancestral]').forEach(card => {
    card.addEventListener('click', function() {
        selectedAncestral = this.getAttribute('data-ancestral');
        console.log(`Selected Ancestral: ${selectedAncestral}`);  // Debug
        // Remove border from all ancestral cards
        document.querySelectorAll('.card[data-ancestral]').forEach(c => c.classList.remove('selected-card'));
        // Add border to the selected ancestral card
        this.classList.add('selected-card');
        // Show the "Next" button
        document.getElementById('next-button-ancestral').classList.remove('hidden');
    });
});

document.getElementById('next-button-ancestral').addEventListener('click', function() {
    if (selectedAncestral) {
        console.log('Next button clicked');  // Debug
        // Move to the sub-ancestral section
        showSection('sub-ancestral');
    }
});

function fetchSubAncestries(ancestral) {
    console.log(`Fetching sub-ancestries for: ${ancestral}`);  // Debug
    fetch(`/get_sub_ancestries/${ancestral}`)
        .then(response => {
            console.log('Response received:', response);  // Debug
            return response.json();
        })
        .then(data => {
            console.log('Sub-ancestries data received:', data);  // Debug
            const container = document.getElementById('sub-ancestral-cards');
            container.innerHTML = '';
            data.forEach(sub => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.setAttribute('data-sub-ancestral', sub.name);
                card.innerHTML = `
                    <h2>${sub.name}</h2>
                `;
                container.appendChild(card);

                card.addEventListener('click', function() {
                    selectedSubAncestral = this.getAttribute('data-sub-ancestral');
                    console.log(`Selected Sub-Ancestral: ${selectedSubAncestral}`);  // Debug
                    // Remove border from all sub-ancestral cards
                    document.querySelectorAll('.card[data-sub-ancestral]').forEach(c => c.classList.remove('selected-card'));
                    // Add border to the selected sub-ancestral card
                    this.classList.add('selected-card');
                    document.getElementById('confirm-button-sub-ancestral').disabled = false;
                });
            });

            console.log('Showing confirm button');  // Debug
            document.getElementById('confirm-button-sub-ancestral').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching sub-ancestries:', error));
}

document.getElementById('confirm-button-sub-ancestral').addEventListener('click', function() {
    if (selectedAncestral && selectedSubAncestral) {
        console.log(`Selected ancestral: ${selectedAncestral}`);
        console.log(`Selected sub-ancestral: ${selectedSubAncestral}`);
        // Move to the estilo section
        showSection('estilo');
    }
});

document.querySelectorAll('.card[data-estilo]').forEach(card => {
    card.addEventListener('click', function() {
        selectedEstilo = this.getAttribute('data-estilo');
        console.log(`Selected Estilo: ${selectedEstilo}`);  // Debug
        // Remove border from all estilo cards
        document.querySelectorAll('.card[data-estilo]').forEach(c => c.classList.remove('selected-card'));
        // Add border to the selected estilo card
        this.classList.add('selected-card');
        // Show the "Next" button
        document.getElementById('next-button-estilo').classList.remove('hidden');
    });
});

document.getElementById('next-button-estilo').addEventListener('click', function() {
    if (selectedEstilo) {
        console.log('Next button clicked');  // Debug
        // Move to the classe section
        showSection('classe');
        fetchClassesByEstilo(selectedEstilo);
    }
});

function fetchClassesByEstilo(estiloId) {
    fetch(`/get_classes_by_estilo/${estiloId}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('classe-cards');
            container.innerHTML = '';
            data.forEach(classe => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.setAttribute('data-classe', classe.id);
                card.innerHTML = `
                    <h2>${classe.name}</h2>
                    <p>${classe.description}</p>
                `;
                container.appendChild(card);

                card.addEventListener('click', function() {
                    selectedClasse = this.getAttribute('data-classe');
                    console.log(`Selected Classe: ${selectedClasse}`);  // Debug
                    document.querySelectorAll('.card[data-classe]').forEach(c => c.classList.remove('selected-card'));
                    this.classList.add('selected-card');
                    document.getElementById('confirm-button-classe').classList.remove('hidden');
                });
            });
        })
        .catch(error => console.error('Error fetching classes:', error));
}

document.getElementById('confirm-button-classe').addEventListener('click', function() {
    if (selectedClasse) {
        console.log(`Selected classe: ${selectedClasse}`);
        // Move to the sub-classe section
        showSection('sub-classe');
        fetchSubClasses(selectedClasse, 'Vida');
        fetchSubClasses(selectedClasse, 'Especialista');
    }
});

function fetchSubClasses(classeId, category) {
    fetch(`/get_sub_classes/${classeId}/${category}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(`${category.toLowerCase()}-sub-classe-cards`);
            container.innerHTML = '';
            data.forEach(subClasse => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.setAttribute('data-sub-classe', subClasse.id);
                card.innerHTML = `
                    <h2>${subClasse.name}</h2>
                    <p>${subClasse.description}</p>
                `;
                container.appendChild(card);

                card.addEventListener('click', function() {
                    if (category === 'Vida') {
                        selectedSubClasseVida = this.getAttribute('data-sub-classe');
                        console.log(`Selected Sub-Classe Vida: ${selectedSubClasseVida}`);  // Debug
                        document.querySelectorAll('.card[data-sub-classe]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                    } else if (category === 'Especialista') {
                        selectedSubClasseEspecialista = this.getAttribute('data-sub-classe');
                        console.log(`Selected Sub-Classe Especialista: ${selectedSubClasseEspecialista}`);  // Debug
                        document.querySelectorAll('.card[data-sub-classe]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                    }
                    document.getElementById('confirm-button-sub-classe').classList.remove('hidden');
                });
            });
        })
        .catch(error => console.error('Error fetching sub-classes:', error));
}

document.getElementById('confirm-button-sub-classe').addEventListener('click', function() {
    if (selectedSubClasseVida && selectedSubClasseEspecialista) {
        console.log(`Selected Sub-Classe Vida: ${selectedSubClasseVida}`);
        console.log(`Selected Sub-Classe Especialista: ${selectedSubClasseEspecialista}`);
        // Você pode coletar as seleções e enviar para o backend aqui
    }
});