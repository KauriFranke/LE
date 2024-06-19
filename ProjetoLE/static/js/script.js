let selectedAncestral = null;
let selectedSubAncestral = null;
let selectedEstilo = null;
let selectedClasse = null;
let selectedSubClasse1 = null;
let selectedSubClasse2 = null;
let selectedGuilda = null;
let selectedProfissao = null;

document.addEventListener('DOMContentLoaded', function() {
    showSection('ancestral');

    // Adicionar eventos de clique para os botões de voltar
    document.getElementById('back-button-sub-ancestral').addEventListener('click', function() {
        showSection('ancestral');
    });
    document.getElementById('back-button-estilo').addEventListener('click', function() {
        showSection('sub-ancestral');
    });
    document.getElementById('back-button-classe').addEventListener('click', function() {
        showSection('estilo');
    });
    document.getElementById('back-button-sub-classe').addEventListener('click', function() {
        showSection('classe');
    });
    document.getElementById('back-button-guilda').addEventListener('click', function() {
        showSection('sub-classe');
    });
    document.getElementById('back-button-profissao').addEventListener('click', function() {
        showSection('guilda');
    });
});

function showSection(section) {
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.navbar a[href="#${section}"]`).classList.add('active');

    document.querySelectorAll('div[id$="-section"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`${section}-section`).classList.remove('hidden');

    if (section === 'sub-ancestral') {
        fetchSubAncestries(selectedAncestral);
    } else if (section === 'classe') {
        fetchClassesByEstilo(selectedEstilo);
    } else if (section === 'guilda') {
        fetchGuildas();
    } else if (section === 'profissao') {
        fetchProfissoesByGuilda(selectedGuilda);
    } else if (section === 'sub-classe') {
        fetchSubClassesByClasse(selectedClasse);
    }
}

document.querySelectorAll('.card[data-ancestral]').forEach(card => {
    card.addEventListener('click', function() {
        selectedAncestral = this.getAttribute('data-ancestral');
        console.log(`Selected Ancestral: ${selectedAncestral}`);
        document.querySelectorAll('.card[data-ancestral]').forEach(c => c.classList.remove('selected-card'));
        this.classList.add('selected-card');
        document.getElementById('next-button-ancestral').classList.remove('hidden');
    });
});

document.getElementById('next-button-ancestral').addEventListener('click', function() {
    if (selectedAncestral) {
        console.log('Next button clicked');
        showSection('sub-ancestral');
    }
});

function fetchSubAncestries(ancestral) {
    console.log(`Fetching sub-ancestries for: ${ancestral}`);
    fetch(`/get_sub_ancestries/${ancestral}`)
        .then(response => response.json())
        .then(data => {
            console.log('Sub-ancestries data received:', data);
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
                    console.log(`Selected Sub-Ancestral: ${selectedSubAncestral}`);
                    document.querySelectorAll('.card[data-sub-ancestral]').forEach(c => c.classList.remove('selected-card'));
                    this.classList.add('selected-card');
                    document.getElementById('next-button-sub-ancestral').disabled = false;
                });
            });

            document.getElementById('next-button-sub-ancestral').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching sub-ancestries:', error));
}

document.getElementById('next-button-sub-ancestral').addEventListener('click', function() {
    if (selectedAncestral && selectedSubAncestral) {
        console.log(`Selected ancestral: ${selectedAncestral}`);
        console.log(`Selected sub-ancestral: ${selectedSubAncestral}`);
        showSection('estilo');
    }
});

document.querySelectorAll('.card[data-estilo]').forEach(card => {
    card.addEventListener('click', function() {
        selectedEstilo = this.getAttribute('data-estilo');
        console.log(`Selected Estilo: ${selectedEstilo}`);
        document.querySelectorAll('.card[data-estilo]').forEach(c => c.classList.remove('selected-card'));
        this.classList.add('selected-card');
        document.getElementById('next-button-estilo').classList.remove('hidden');
    });
});

document.getElementById('next-button-estilo').addEventListener('click', function() {
    if (selectedEstilo) {
        console.log('Next button clicked');
        showSection('classe');
        fetchClassesByEstilo(selectedEstilo);
    }
});

function fetchClassesByEstilo(estilo) {
    console.log(`Fetching classes for estilo: ${estilo}`);
    fetch(`/get_classes_by_estilo/${estilo}`)
        .then(response => response.json())
        .then(data => {
            console.log('Classes data received:', data);
            const container = document.getElementById('classe-cards');
            container.innerHTML = '';  // Clear previous content
            if (data.length > 0) {
                data.forEach(classe => {
                    console.log('Adding class:', classe);
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
                        console.log(`Selected Classe: ${selectedClasse}`);
                        document.querySelectorAll('.card[data-classe]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('next-button-classe').classList.remove('hidden');
                        document.getElementById('next-button-classe').disabled = false;  // Habilitar o botão
                    });
                });
            } else {
                container.innerHTML = '<p>No classes available for this style.</p>';
            }
        })
        .catch(error => console.error('Error fetching classes:', error));
}

document.getElementById('next-button-classe').addEventListener('click', function() {
    if (selectedClasse) {
        console.log(`Selected classe: ${selectedClasse}`);
        showSection('sub-classe');
        fetchSubClassesByClasse(selectedClasse);
    }
});

function fetchSubClassesByClasse(classeId) {
    console.log(`Fetching sub-classes for classe: ${classeId}`);
    fetch(`/get_sub_classes_by_classe/${classeId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Sub-classes data received:', data);
            const container = document.getElementById('sub-classe-cards');
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
                    if (!selectedSubClasse1) {
                        selectedSubClasse1 = this.getAttribute('data-sub-classe');
                        console.log(`Selected Sub-Classe 1: ${selectedSubClasse1}`);
                    } else {
                        selectedSubClasse2 = this.getAttribute('data-sub-classe');
                        console.log(`Selected Sub-Classe 2: ${selectedSubClasse2}`);
                    }
                    document.querySelectorAll('.card[data-sub-classe]').forEach(c => c.classList.remove('selected-card'));
                    this.classList.add('selected-card');
                    document.getElementById('next-button-sub-classe').classList.remove('hidden');
                    document.getElementById('next-button-sub-classe').disabled = false;  // Habilitar o botão
                });
            });
        })
        .catch(error => console.error('Error fetching sub-classes:', error));
}

document.getElementById('next-button-sub-classe').addEventListener('click', function() {
    if (selectedSubClasse1 && selectedSubClasse2) {
        console.log(`Selected Sub-Classe 1: ${selectedSubClasse1}`);
        console.log(`Selected Sub-Classe 2: ${selectedSubClasse2}`);
        showSection('guilda');
    }
});

function fetchGuildas() {
    console.log('Fetching guildas');
    fetch(`/get_guildas`)
        .then(response => response.json())
        .then(data => {
            console.log('Guildas data received:', data);
            const container = document.getElementById('guilda-cards');
            container.innerHTML = '';  // Clear previous content
            if (data.length > 0) {
                data.forEach(guilda => {
                    console.log('Adding guilda:', guilda);
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.setAttribute('data-guilda', guilda.name);
                    card.innerHTML = `
                        <h2>${guilda.name}</h2>
                        <p>${guilda.description}</p>
                    `;
                    container.appendChild(card);

                    card.addEventListener('click', function() {
                        selectedGuilda = this.getAttribute('data-guilda');
                        console.log(`Selected Guilda: ${selectedGuilda}`);
                        document.querySelectorAll('.card[data-guilda]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('next-button-guilda').classList.remove('hidden');
                    });
                });
            } else {
                container.innerHTML = '<p>No guildas available.</p>';
            }
        })
        .catch(error => console.error('Error fetching guildas:', error));
}

document.getElementById('next-button-guilda').addEventListener('click', function() {
    if (selectedGuilda) {
        console.log(`Selected guilda: ${selectedGuilda}`);
        showSection('profissao');
        fetchProfissoesByGuilda(selectedGuilda);
    }
});

function fetchProfissoesByGuilda(guilda) {
    console.log(`Fetching profissoes for guilda: ${guilda}`);
    fetch(`/get_profissoes_by_guilda/${guilda}`)
        .then(response => response.json())
        .then(data => {
            console.log('Profissoes data received:', data);
            const container = document.getElementById('profissao-cards');
            container.innerHTML = '';  // Clear previous content
            if (data.length > 0) {
                data.forEach(profissao => {
                    console.log('Adding profissao:', profissao);
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.setAttribute('data-profissao', profissao.id);
                    card.innerHTML = `
                        <h2>${profissao.name}</h2>
                        <p>${profissao.description}</p>
                    `;
                    container.appendChild(card);

                    card.addEventListener('click', function() {
                        selectedProfissao = this.getAttribute('data-profissao');
                        console.log(`Selected Profissao: ${selectedProfissao}`);
                        document.querySelectorAll('.card[data-profissao]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('confirm-button-profissao').classList.remove('hidden');
                        document.getElementById('confirm-button-profissao').disabled = false;  // Habilitar o botão
                    });
                });
            } else {
                container.innerHTML = '<p>No profissoes available for this guilda.</p>';
            }
        })
        .catch(error => console.error('Error fetching profissoes:', error));
}

document.getElementById('confirm-button-profissao').addEventListener('click', function() {
    if (selectedProfissao) {
        console.log(`Selected profissao: ${selectedProfissao}`);
        // Aqui você pode enviar os dados para o backend ou fazer qualquer outra ação necessária
    }
});