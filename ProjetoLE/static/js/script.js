let selectedAncestral = null;
let selectedSubAncestral = null;
let selectedEstilo = null;
let selectedClasse = null;
let selectedSubClasse1 = null;
let selectedSubClasse2 = null;
let selectedGuilda = null;
let selectedProfissao = null;
let selectedType1SubClasse = null;
let selectedType2SubClasse = null;

// Variáveis de estado para verificar se todas as seleções foram feitas
let isAncestralSelected = false;
let isSubAncestralSelected = false;
let isEstiloSelected = false;
let isClasseSelected = false;
let isSubClasse1Selected = false;
let isSubClasse2Selected = false;
let isGuildaSelected = false;
let isProfissaoSelected = false;

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

    // Adicionar evento ao botão "Next" da classe
    document.getElementById('next-button-classe').addEventListener('click', function() {
        if (selectedClasse) {
            fetchSubClassesByClasse(selectedClasse);
        }
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
        selectedEstiloName = this.querySelector('h2').innerText; // Capture the name
        console.log(`Selected Estilo: ${selectedEstiloName}`);
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
                        selectedClasseName = classe.name; // Capture the name
                        console.log(`Selected Classe: ${selectedClasseName}`);
                        document.querySelectorAll('.card[data-classe]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('next-button-classe').classList.remove('hidden');
                        document.getElementById('next-button-classe').disabled = false;  // Enable the button
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
        showSection('sub-classe');  // Move to the sub-classe section
        fetchSubClassesByClasse(selectedClasse);
    }
});

function fetchSubClassesByClasse(classeId) {
    fetch(`/get_sub_classes_by_classe/${classeId}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('sub-classe-container');
            container.innerHTML = '';

            // Obter os tipos únicos das sub-classes e seus nomes
            const types = data.types;
            console.log('Types found:', types);

            // Criar seções dinâmicas para cada tipo
            types.forEach((type, index) => {
                const section = document.createElement('div');
                section.classList.add('sub-classe-section');
                section.innerHTML = `
                    <h2>Selecione a Sub-Classe de ${type.name}</h2>
                    <div id="sub-classe-cards-tipo-${index}" class="sub-classe-container"></div>
                `;
                container.appendChild(section);

                // Adicionar cards às seções correspondentes
                data.sub_classes.filter(subClasse => subClasse.tipo_id === type.id).forEach(subClasse => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.setAttribute('data-sub-classe', subClasse.id);
                    card.innerHTML = `
                        <h2>${subClasse.name}</h2>
                        <p>${subClasse.description}</p>
                    `;
                    section.querySelector('.sub-classe-container').appendChild(card);

                    card.addEventListener('click', function() {
                        if (index === 0) {
                            selectedSubClasse1 = this.getAttribute('data-sub-classe');
                            selectedSubClasse1Name = subClasse.name; // Capture the name
                            document.querySelectorAll(`#sub-classe-cards-tipo-${index} .card`).forEach(c => c.classList.remove('selected-card'));
                            this.classList.add('selected-card');
                            console.log(`Selected Sub-Classe 1: ${selectedSubClasse1Name}`);
                        } else {
                            selectedSubClasse2 = this.getAttribute('data-sub-classe');
                            selectedSubClasse2Name = subClasse.name; // Capture the name
                            document.querySelectorAll(`#sub-classe-cards-tipo-${index} .card`).forEach(c => c.classList.remove('selected-card'));
                            this.classList.add('selected-card');
                            console.log(`Selected Sub-Classe 2: ${selectedSubClasse2Name}`);
                        }

                        if (selectedSubClasse1 && selectedSubClasse2) {
                            document.getElementById('next-button-sub-classe').classList.remove('hidden');
                            document.getElementById('next-button-sub-classe').disabled = false;
                        }
                    });
                });
            });
        })
        .catch(error => console.error('Error fetching sub-classes:', error));
}

function checkSubClassSelections() {
    const nextButton = document.getElementById('next-button-sub-classe');
    if (selectedSubClasse1 && selectedSubClasse2) {
        nextButton.disabled = false;
        nextButton.classList.remove('hidden');
    } else {
        nextButton.disabled = true;
        nextButton.classList.add('hidden');
    }
}

function checkAllSelections() {
    if (selectedType1SubClasse && selectedType2SubClasse) {
        document.getElementById('next-button-sub-classe').disabled = false;
    } else {
        document.getElementById('next-button-sub-classe').disabled = true;
    }

    if (selectedGuilda && selectedProfissao) {
        document.getElementById('confirm-button-profissao').disabled = false;
    } else {
        document.getElementById('confirm-button-profissao').disabled = true;
    }
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

document.getElementById('confirm-button-profissao').addEventListener('click', function() {
    if (selectedProfissao) {
        console.log(`Selected Profissao: ${selectedProfissao}`);
        showSection('resumo');
        populateResumoSection();
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
                        selectedProfissao = profissao.name;  // Capture the name instead of the id
                        console.log(`Selected Profissao: ${selectedProfissao}`);
                        document.querySelectorAll('.card[data-profissao]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('confirm-button-profissao').classList.remove('hidden');
                        document.getElementById('confirm-button-profissao').disabled = false;  // Enable the button
                    });
                });
            } else {
                container.innerHTML = '<p>No profissoes available for this guilda.</p>';
            }
        })
        .catch(error => console.error('Error fetching profissoes:', error));
}

function populateResumoSection() {
    const resumoContainer = document.getElementById('resumo-cards');
    resumoContainer.innerHTML = '';

    const sections = [
        { title: 'Ancestral', value: selectedAncestral },
        { title: 'Sub-Ancestral', value: selectedSubAncestral },
        { title: 'Estilo', value: selectedEstiloName },
        { title: 'Classe', value: selectedClasseName },
        { title: 'Sub-Classe 1', value: selectedSubClasse1Name },
        { title: 'Sub-Classe 2', value: selectedSubClasse2Name },
        { title: 'Guilda', value: selectedGuilda },
        { title: 'Profissao', value: selectedProfissao }
    ];

    sections.forEach(section => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h2>${section.title}</h2>
            <p>${section.value}</p>
        `;
        resumoContainer.appendChild(card);
    });
}

document.getElementById('back-button-resumo').addEventListener('click', function() {
    showSection('profissao');
});

function preencherResumo() {
    document.getElementById('resumo-ancestral').innerHTML = `
        <h2>Ancestral</h2>
        <p>${selectedAncestral}</p>
    `;
    document.getElementById('resumo-sub-ancestral').innerHTML = `
        <h2>Sub-Ancestral</h2>
        <p>${selectedSubAncestral}</p>
    `;
    document.getElementById('resumo-estilo').innerHTML = `
        <h2>Estilo</h2>
        <p>${selectedEstilo}</p>
    `;
    document.getElementById('resumo-classe').innerHTML = `
        <h2>Classe</h2>
        <p>${selectedClasse}</p>
    `;
    document.getElementById('resumo-sub-classe1').innerHTML = `
        <h2>Sub-Classe 1</h2>
        <p>${selectedSubClasse1}</p>
    `;
    document.getElementById('resumo-sub-classe2').innerHTML = `
        <h2>Sub-Classe 2</h2>
        <p>${selectedSubClasse2}</p>
    `;
    document.getElementById('resumo-guilda').innerHTML = `
        <h2>Guilda</h2>
        <p>${selectedGuilda}</p>
    `;
    document.getElementById('resumo-profissao').innerHTML = `
        <h2>Profissão</h2>
        <p>${selectedProfissao}</p>
    `;
}

document.getElementById('create-character-button').addEventListener('click', function() {
    const nomePersonagem = document.getElementById('nome-personagem').value;
    if (!nomePersonagem) {
        alert("Por favor, insira o nome do personagem.");
        return;
    }

    const characterData = {
        nome: nomePersonagem,
        ancestral: selectedAncestral,
        subAncestral: selectedSubAncestral,
        estilo: selectedEstilo,
        classe: selectedClasse,
        subClasse1: selectedSubClasse1,
        subClasse2: selectedSubClasse2,
        guilda: selectedGuilda,
        profissao: selectedProfissao
    };

    fetch('/create_character', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(characterData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Personagem criado com sucesso!');
            // Redirecionar ou limpar formulário se necessário
        } else {
            alert('Erro ao criar personagem: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Erro ao criar personagem.');
    });
});