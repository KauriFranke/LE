const state = {
    selectedAncestral: null,
    selectedAncestralName: null,
    selectedSubAncestral: null,
    selectedSubAncestralName: null,
    selectedEstilo: null,
    selectedEstiloName: null,
    selectedClasse: null,
    selectedClasseName: null,
    selectedSubClasse1: null,
    selectedSubClasse1Name: null,
    selectedSubClasse1Element: null,
    selectedSubClasse2: null,
    selectedSubClasse2Name: null,
    selectedSubClasse2Element: null,
    selectedGuilda: null,
    selectedGuildaName: null,
    selectedProfissao: null,
    selectedProfissaoName: null,
    obligatoryElement: null,
    obligatoryElementName: null,
    selectedProfissaoPericias: [],
    selectedAncestryPericias: [],
    pontosRestantes: 3,
    nivel: 1,
    profissaoPericiasBloqueadas: []
};

document.addEventListener('DOMContentLoaded', function() {
    initialize();
    showSection('ancestral');
});

function initialize() {
    addBackButtonListeners();
    addNextButtonListeners();
    addIncrementDecrementListeners();
    addCardSelectionListeners();
}

function addBackButtonListeners() {
    const backButtons = [
        { id: 'back-button-sub-ancestral', section: 'ancestral' },
        { id: 'back-button-estilo', section: 'sub-ancestral' },
        { id: 'back-button-classe', section: 'estilo' },
        { id: 'back-button-sub-classe', section: 'classe' },
        { id: 'back-button-guilda', section: 'sub-classe' },
        { id: 'back-button-profissao', section: 'guilda' }
    ];

    backButtons.forEach(button => {
        document.getElementById(button.id).addEventListener('click', function() {
            showSection(button.section);
        });
    });
}

function addNextButtonListeners() {
    document.getElementById('next-button-classe').addEventListener('click', function() {
        if (state.selectedClasse) {
            fetchSubClassesByClasse(state.selectedClasse);
            showSection('sub-classe');
        }
    });

    document.getElementById('next-button-atributos-pericias').addEventListener('click', function() {
        if (state.selectedAncestral && state.selectedSubAncestral && state.selectedEstilo && state.selectedClasse && state.selectedSubClasse1 && state.selectedSubClasse2 && state.selectedGuilda && state.selectedProfissao) {
            console.log('Next button clicked');
            populateResumoSection();
            showSection('resumo');
        }
    });

    document.getElementById('next-button-ancestral').addEventListener('click', function() {
        if (state.selectedAncestral) {
            console.log('Next button clicked');
            showSection('sub-ancestral');
        }
    });

    document.getElementById('next-button-sub-ancestral').addEventListener('click', function() {
        if (state.selectedAncestral && state.selectedSubAncestral) {
            console.log(`Selected ancestral: ${state.selectedAncestralName}`);
            console.log(`Selected sub-ancestral: ${state.selectedSubAncestralName}`);
            showSection('estilo');
        }
    });

    document.getElementById('next-button-estilo').addEventListener('click', function() {
        if (state.selectedEstilo) {
            console.log('Next button clicked');
            showSection('classe');
            fetchClassesByEstilo(state.selectedEstilo);
        }
    });

    document.getElementById('next-button-sub-classe').addEventListener('click', function() {
        if (state.obligatoryElement && state.obligatoryElement !== "null") {
            const obligatoryElementSelected = 
                (state.selectedSubClasse1Element == state.obligatoryElement) ||
                (state.selectedSubClasse2Element == state.obligatoryElement);

            if (!obligatoryElementSelected) {
                alert(`Uma das sub-classes deve ser do elemento obrigatório: ${state.obligatoryElementName}`);
                return;
            }
        }
        
        console.log(`Selected Sub-Classe 1: ${state.selectedSubClasse1Name}`);
        console.log(`Selected Sub-Classe 2: ${state.selectedSubClasse2Name}`);
        showSection('guilda');
    });

    document.getElementById('next-button-guilda').addEventListener('click', function() {
        if (state.selectedGuilda) {
            console.log(`Selected guilda: ${state.selectedGuildaName}`);
            showSection('profissao');
            fetchProfissoesByGuilda(state.selectedGuilda);
        }
    });

    document.getElementById('confirm-button-profissao').addEventListener('click', function() {
        if (state.selectedProfissao) {
            console.log(`Selected Profissao: ${state.selectedProfissaoName}`);
            showSection('atributos-pericias');
            fetchPericias();
        }
    });
}

function addIncrementDecrementListeners() {
    document.querySelectorAll('.increment').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            incrementAttribute(target);
        });
    });

    document.querySelectorAll('.decrement').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            decrementAttribute(target);
        });
    });
}

function addCardSelectionListeners() {
    document.querySelectorAll('.card[data-ancestral]').forEach(card => {
        card.addEventListener('click', function() {
            state.selectedAncestral = this.getAttribute('data-ancestral');
            state.selectedAncestralName = this.querySelector('h2').innerText;
            state.obligatoryElement = this.getAttribute('data-elemento-obrigatorio');
            console.log(`Selected Ancestral: ${state.selectedAncestralName}`);
            document.querySelectorAll('.card[data-ancestral]').forEach(c => c.classList.remove('selected-card'));
            this.classList.add('selected-card');
            document.getElementById('next-button-ancestral').classList.remove('hidden');
        });
    });

    document.querySelectorAll('.card[data-estilo]').forEach(card => {
        card.addEventListener('click', function() {
            state.selectedEstilo = this.getAttribute('data-estilo');
            state.selectedEstiloName = this.querySelector('h2').innerText;
            console.log(`Selected Estilo: ${state.selectedEstiloName}`);
            document.querySelectorAll('.card[data-estilo]').forEach(c => c.classList.remove('selected-card'));
            this.classList.add('selected-card');
            document.getElementById('next-button-estilo').classList.remove('hidden');
        });
    });

    // Adicionar outros listeners de seleção de cards conforme necessário
}

function showSection(section) {
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.navbar a[href="#${section}"]`).classList.add('active');

    document.querySelectorAll('div[id$="-section"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`${section}-section`).classList.remove('hidden');

    if (section === 'sub-ancestral') {
        fetchSubAncestries(state.selectedAncestral);
    } else if (section === 'classe') {
        fetchClassesByEstilo(state.selectedEstilo);
    } else if (section === 'guilda') {
        fetchGuildas();
    } else if (section === 'profissao') {
        fetchProfissoesByGuilda(state.selectedGuilda);
    } else if (section === 'atributos-pericias') {
        fetchPericias();
    }
}

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
                card.setAttribute('data-sub-ancestral', sub.id);
                card.setAttribute('data-elemento', sub.elemento_id);
                card.setAttribute('data-elemento-name', sub.elemento_name);
                card.innerHTML = `
                    <img src="${sub.image_url}" alt="${sub.name}">
                    <h2>${sub.name}</h2>
                `;
                container.appendChild(card);

                card.addEventListener('click', function() {
                    state.selectedSubAncestral = this.getAttribute('data-sub-ancestral');
                    state.selectedSubAncestralName = sub.name;
                    state.obligatoryElement = this.getAttribute('data-elemento');
                    state.obligatoryElementName = this.getAttribute('data-elemento-name');
                    console.log(`Selected Sub-Ancestral: ${state.selectedSubAncestralName}, Elemento: ${state.obligatoryElement}`);
                    document.querySelectorAll('.card[data-sub-ancestral]').forEach(c => c.classList.remove('selected-card'));
                    this.classList.add('selected-card');
                    document.getElementById('next-button-sub-ancestral').disabled = false;
                });
            });

            document.getElementById('next-button-sub-ancestral').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching sub-ancestries:', error));
}

function fetchClassesByEstilo(estilo) {
    console.log(`Fetching classes for estilo: ${estilo}`);
    fetch(`/get_classes_by_estilo/${estilo}`)
        .then(response => response.json())
        .then(data => {
            console.log('Classes data received:', data);
            const container = document.getElementById('classe-cards');
            container.innerHTML = '';
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
                        state.selectedClasse = this.getAttribute('data-classe');
                        state.selectedClasseName = classe.name;
                        console.log(`Selected Classe: ${state.selectedClasseName}`);
                        document.querySelectorAll('.card[data-classe]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('next-button-classe').classList.remove('hidden');
                        document.getElementById('next-button-classe').disabled = false;
                    });
                });
            } else {
                container.innerHTML = '<p>No classes available for this style.</p>';
            }
        })
        .catch(error => console.error('Error fetching classes:', error));
}

function fetchSubClassesByClasse(classeId) {
    fetch(`/get_sub_classes_by_classe/${classeId}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('sub-classe-container');
            container.innerHTML = '';

            const types = data.types;
            console.log('Types found:', types);

            types.forEach((type, index) => {
                const section = document.createElement('div');
                section.classList.add('sub-classe-section');
                section.innerHTML = `
                    <h2>Selecione a Sub-Classe de ${type.name}</h2>
                    <div id="sub-classe-cards-tipo-${index}" class="sub-classe-container"></div>
                `;
                container.appendChild(section);

                data.sub_classes.filter(subClasse => subClasse.tipo_id === type.id).forEach(subClasse => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.setAttribute('data-sub-classe', subClasse.id);
                    card.setAttribute('data-elemento', subClasse.elemento_id);
                    card.innerHTML = `
                        <h2>${subClasse.name}</h2>
                        <img src="${subClasse.image_url}" alt="${subClasse.name}" class="sub-classe-image" />
                    `;

                    if (subClasse.elemento_id == state.obligatoryElement && !obligatoryElementSelected()) {
                        card.classList.add('obrigatoria');
                    }

                    section.querySelector('.sub-classe-container').appendChild(card);

                    card.addEventListener('click', function() {
                        const subClasseId = this.getAttribute('data-sub-classe');
                        const subClasseElement = this.getAttribute('data-elemento');

                        if ((index === 0 && subClasseId === state.selectedSubClasse2) || (index === 1 && subClasseId === state.selectedSubClasse1)) {
                            alert('Você não pode selecionar a mesma sub-classe para ambos os tipos.');
                            return;
                        }

                        if (index === 0) {
                            if (state.selectedSubClasse1) {
                                document.querySelectorAll(`#sub-classe-cards-tipo-1 .card[data-sub-classe="${state.selectedSubClasse1}"]`).forEach(c => c.classList.remove('disabled-card'));
                            }
                            state.selectedSubClasse1 = subClasseId;
                            state.selectedSubClasse1Element = subClasseElement;
                            state.selectedSubClasse1Name = subClasse.name;
                            document.querySelectorAll(`#sub-classe-cards-tipo-0 .card`).forEach(c => c.classList.remove('selected-card'));
                            this.classList.add('selected-card');
                            document.querySelectorAll(`#sub-classe-cards-tipo-1 .card[data-sub-classe="${subClasseId}"]`).forEach(c => c.classList.add('disabled-card'));
                            console.log(`Selected Sub-Classe 1: ${state.selectedSubClasse1Name}`);
                        } else {
                            if (state.selectedSubClasse2) {
                                document.querySelectorAll(`#sub-classe-cards-tipo-0 .card[data-sub-classe="${state.selectedSubClasse2}"]`).forEach(c => c.classList.remove('disabled-card'));
                            }
                            state.selectedSubClasse2 = subClasseId;
                            state.selectedSubClasse2Element = subClasseElement;
                            state.selectedSubClasse2Name = subClasse.name;
                            document.querySelectorAll(`#sub-classe-cards-tipo-1 .card`).forEach(c => c.classList.remove('selected-card'));
                            this.classList.add('selected-card');
                            document.querySelectorAll(`#sub-classe-cards-tipo-0 .card[data-sub-classe="${subClasseId}"]`).forEach(c => c.classList.add('disabled-card'));
                            console.log(`Selected Sub-Classe 2: ${state.selectedSubClasse2Name}`);
                        }

                        const obligatorySelected = obligatoryElementSelected();

                        if (obligatorySelected) {
                            document.querySelectorAll('.card.obrigatoria').forEach(c => c.classList.remove('obrigatoria'));
                        } else {
                            document.querySelectorAll('.card[data-elemento="'+ state.obligatoryElement +'"]').forEach(c => c.classList.add('obrigatoria'));
                        }

                        if (state.selectedSubClasse1 && state.selectedSubClasse2) {
                            document.getElementById('next-button-sub-classe').classList.remove('hidden');
                            document.getElementById('next-button-sub-classe').disabled = false;
                        }
                    });
                });
            });
        })
        .catch(error => console.error('Error fetching sub-classes:', error));
}

function obligatoryElementSelected() {
    return (
        document.querySelector(`#sub-classe-cards-tipo-0 .selected-card[data-elemento="${state.obligatoryElement}"]`) ||
        document.querySelector(`#sub-classe-cards-tipo-1 .selected-card[data-elemento="${state.obligatoryElement}"]`)
    );
}

function fetchGuildas() {
    console.log('Fetching guildas');
    fetch(`/get_guildas`)
        .then(response => response.json())
        .then(data => {
            console.log('Guildas data received:', data);
            const container = document.getElementById('guilda-cards');
            container.innerHTML = '';
            if (data.length > 0) {
                data.forEach(guilda => {
                    console.log('Adding guilda:', guilda);
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.setAttribute('data-guilda', guilda.id);
                    card.innerHTML = `
                        <h2>${guilda.name}</h2>
                        <p>${guilda.description}</p>
                    `;
                    container.appendChild(card);

                    card.addEventListener('click', function() {
                        state.selectedGuilda = this.getAttribute('data-guilda');
                        state.selectedGuildaName = guilda.name;
                        console.log(`Selected Guilda: ${state.selectedGuildaName}`);
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

function fetchProfissoesByGuilda(guilda) {
    console.log(`Fetching profissoes for guilda: ${guilda}`);
    fetch(`/get_profissoes_by_guilda/${guilda}`)
        .then(response => response.json())
        .then(data => {
            console.log('Profissoes data received:', data);
            const container = document.getElementById('profissao-cards');
            container.innerHTML = '';
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
                        state.selectedProfissao = this.getAttribute('data-profissao');
                        state.selectedProfissaoName = profissao.name;
                        console.log(`Selected Profissao: ${state.selectedProfissaoName}`);
                        document.querySelectorAll('.card[data-profissao]').forEach(c => c.classList.remove('selected-card'));
                        this.classList.add('selected-card');
                        document.getElementById('confirm-button-profissao').classList.remove('hidden');
                        document.getElementById('confirm-button-profissao').disabled = false;
                    });
                });
            } else {
                container.innerHTML = '<p>No profissoes available for this guilda.</p>';
            }
        })
        .catch(error => console.error('Error fetching profissoes:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPericias();
});

function fetchPericias() {
    const profissaoId = state.selectedProfissao;
    const ancestryId = state.selectedAncestral;
    const subAncestryId = state.selectedSubAncestral;

    const atributos = {
        forca: parseInt(document.getElementById('forca-value').textContent, 10),
        agilidade: parseInt(document.getElementById('agilidade-value').textContent, 10),
        inteligencia: parseInt(document.getElementById('inteligencia-value').textContent, 10),
        presenca: parseInt(document.getElementById('presenca-value').textContent, 10)
    };

    // Função auxiliar para calcular o bônus
    function calcularBonus(atributoId, treinada) {
        const nivel = parseInt(document.getElementById('nivel-value').textContent);
        const proficiencia = 3 + Math.floor((nivel) / 5);
        let atributoValor;
        switch (atributoId) {
            case 1:
                atributoValor = atributos.forca;
                break;
            case 2:
                atributoValor = atributos.agilidade;
                break;
            case 3:
                atributoValor = atributos.inteligencia;
                break;
            case 4:
                atributoValor = atributos.presenca;
                break;
            default:
                atributoValor = 0;
        }
        return treinada ? atributoValor + proficiencia : atributoValor;
    }

    // Fetch pericias by profissão
    fetch(`/get_pericias_by_profissao/${profissaoId}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('profissao-pericias-container');
            container.innerHTML = '';
            state.selectedProfissaoPericias = data.pericias;
            state.profissaoPericiasBloqueadas = data.pericias.map(p => p.id);

            data.pericias.forEach(pericia => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'profissao_pericias';
                checkbox.value = pericia.id;
                checkbox.disabled = true;
                checkbox.checked = true;
                checkbox.classList.add('trained-checkbox', 'profession-trained');

                const label = document.createElement('label');
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(pericia.name));

                container.appendChild(label);
                container.appendChild(document.createElement('br'));
            });

            document.getElementById('next-button-atributos-pericias').classList.remove('hidden');
        });

    // Fetch pericias by ancestry
    fetch(`/get_pericias_by_ancestry/${ancestryId}/${subAncestryId}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('ancestry-pericias-container');
            container.innerHTML = '';
            data.pericias.forEach(pericia => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'ancestry_pericias';
                checkbox.value = pericia.id;
                checkbox.classList.add('trained-checkbox');

                if (state.profissaoPericiasBloqueadas.includes(pericia.id)) {
                    checkbox.disabled = true;
                    checkbox.checked = true;
                    checkbox.classList.add('profession-trained');
                }

                checkbox.addEventListener('change', function() {
                    // Desmarcar a seleção anterior na lista de todas as perícias
                    const previousSelection = state.selectedAncestryPericias.length > 0 ? state.selectedAncestryPericias[0] : null;
                    if (previousSelection) {
                        const previousCheckbox = document.querySelector(`#coordenacao-pericias-todas [data-pericia-id="${previousSelection.id}"], #sabedoria-pericias-todas [data-pericia-id="${previousSelection.id}"], #social-pericias-todas [data-pericia-id="${previousSelection.id}"], #percepcao-pericias-todas [data-pericia-id="${previousSelection.id}"]`);
                        if (previousCheckbox) {
                            previousCheckbox.checked = false;
                            previousCheckbox.classList.remove('ancestry-trained');
                        }
                    }

                    if (this.checked) {
                        state.selectedAncestryPericias = [{ id: pericia.id, name: pericia.name }];
                        this.classList.add('ancestry-trained');
                    } else {
                        state.selectedAncestryPericias = [];
                        this.classList.remove('ancestry-trained');
                    }
                    document.querySelectorAll('input[name="ancestry_pericias"]').forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });

                    document.querySelectorAll('input[name="ancestry_pericias"]').forEach(cb => {
                        if (state.profissaoPericiasBloqueadas.includes(parseInt(cb.value))) {
                            cb.disabled = true;
                            cb.checked = true;
                        }
                    });

                    // Atualizar a lista de todas as perícias
                    updateAllPericiasFromAncestry();
                    updatePericiaBonuses(); // Adicionado aqui também
                });

                const label = document.createElement('label');
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(pericia.name));

                container.appendChild(label);
                container.appendChild(document.createElement('br'));
            });
        });
    // Fetch all pericias
    fetch(`/get_all_pericias`)
    .then(response => response.json())
    .then(data => {
        const coordenacaoContainer = document.getElementById('coordenacao-pericias-todas');
        const sabedoriaContainer = document.getElementById('sabedoria-pericias-todas');
        const socialContainer = document.getElementById('social-pericias-todas');
        const percepcaoContainer = document.getElementById('percepcao-pericias-todas');

        coordenacaoContainer.innerHTML = '';
        sabedoriaContainer.innerHTML = '';
        socialContainer.innerHTML = '';
        percepcaoContainer.innerHTML = '';

        const atributos = data.atributos.reduce((acc, atributo) => {
            acc[atributo.id] = atributo.name.substring(0, 3);
            return acc;
        }, {});

        data.pericias.forEach(pericia => {
            const label = document.createElement('label');
            label.setAttribute('data-atributo-id', pericia.atributo_id);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('trained-checkbox');
            checkbox.setAttribute('data-pericia-id', pericia.id);
            checkbox.disabled = true;

            if (state.profissaoPericiasBloqueadas.includes(pericia.id)) {
                checkbox.checked = true;
                checkbox.classList.add('profession-trained');
            } else if (state.selectedAncestryPericias.some(p => p.id === pericia.id)) {
                checkbox.checked = true;
                checkbox.classList.add('ancestry-trained');
            }

            const atributoNome = atributos[pericia.atributo_id] || 'Desconhecido';
            const bonus = calcularBonus(pericia.atributo_id, checkbox.checked && checkbox.classList.contains('ancestry-trained') || checkbox.classList.contains('profession-trained'));
            const d20Count = calcularD20(bonus);

            const spanAtributo = document.createElement('span');
            spanAtributo.classList.add('atributo');
            spanAtributo.textContent = `(${atributoNome.substring(0, 3)})`;

            const spanPericia = document.createElement('span');
            spanPericia.classList.add('pericia');
            spanPericia.textContent = pericia.name;

            const spanBonus = document.createElement('span');
            spanBonus.classList.add('bonus-text');
            spanBonus.textContent = `(+${bonus})`;

            const spanD20 = document.createElement('span');
            spanD20.classList.add('d20-text');
            spanD20.textContent = `(${d20Count})`;

            label.appendChild(checkbox);
            label.appendChild(spanAtributo);
            label.appendChild(spanPericia);
            label.appendChild(spanBonus);
            label.appendChild(spanD20);

            switch (pericia.tipo_id) {
                case 1:
                    coordenacaoContainer.appendChild(label);
                    break;
                case 2:
                    sabedoriaContainer.appendChild(label);
                    break;
                case 3:
                    socialContainer.appendChild(label);
                    break;
                case 4:
                    percepcaoContainer.appendChild(label);
                    break;
            }
        });

        updatePericiaBonuses();
    })
    .catch(error => {
        console.error('Error fetching pericias or atributos:', error);
    });

}
 
function updateAllPericiasFromAncestry() {
    const allPericiasCheckboxes = document.querySelectorAll('#coordenacao-pericias-todas .trained-checkbox, #sabedoria-pericias-todas .trained-checkbox, #social-pericias-todas .trained-checkbox, #percepcao-pericias-todas .trained-checkbox');
    allPericiasCheckboxes.forEach(checkbox => {
        const periciaId = parseInt(checkbox.getAttribute('data-pericia-id'));

        // Verificar se a perícia está na lista de profissões bloqueadas
        if (state.profissaoPericiasBloqueadas.includes(periciaId)) {
            checkbox.checked = true;
            checkbox.classList.add('profession-trained');
            checkbox.disabled = true;
            return; // Continuar para a próxima iteração
        }

        // Verificar se a perícia está na lista de ancestralidade selecionada
        if (state.selectedAncestryPericias.some(p => p.id === periciaId)) {
            checkbox.checked = true;
            checkbox.classList.add('ancestry-trained');
        } else {
            checkbox.checked = false;
            checkbox.classList.remove('ancestry-trained');
        }
    });
}

// Função auxiliar para calcular o bônus
function calcularBonus(atributoId, treinada) {
    const nivel = parseInt(document.getElementById('nivel-value').textContent);
    const proficiencia = 3 + Math.floor((nivel) / 5);
    const atributos = {
        1: parseInt(document.getElementById('forca-value').textContent, 10),
        2: parseInt(document.getElementById('agilidade-value').textContent, 10),
        3: parseInt(document.getElementById('inteligencia-value').textContent, 10),
        4: parseInt(document.getElementById('presenca-value').textContent, 10)
    };

    return treinada ? atributos[atributoId] + proficiencia : atributos[atributoId];
}

function updatePericiaBonuses() {
    const allPericiasLabels = document.querySelectorAll('#coordenacao-pericias-todas label, #sabedoria-pericias-todas label, #social-pericias-todas label, #percepcao-pericias-todas label');
    allPericiasLabels.forEach(label => {
        const atributoId = parseInt(label.getAttribute('data-atributo-id'));
        const checkbox = label.querySelector('.trained-checkbox');
        const spanBonus = label.querySelector('.bonus-text');
        const spanD20 = label.querySelector('.d20-text');

        const atributos = {
            1: parseInt(document.getElementById('forca-value').textContent, 10),
            2: parseInt(document.getElementById('agilidade-value').textContent, 10),
            3: parseInt(document.getElementById('inteligencia-value').textContent, 10),
            4: parseInt(document.getElementById('presenca-value').textContent, 10)
        };
        const atributoValor = atributos[atributoId];

        const bonus = calcularBonus(atributoId, checkbox.checked && (checkbox.classList.contains('ancestry-trained') || checkbox.classList.contains('profession-trained')));
        const d20Count = calcularD20(atributoValor, checkbox.checked);

        spanBonus.textContent = `(+${bonus})`;
        spanD20.textContent = `(${d20Count})`;
    });
}

function calcularD20(atributoValor, treinada) {
    if (atributoValor === 0) {
        return '-1';
    }
    const d20Count = treinada ? 1 + Math.floor(atributoValor / 3) : 1;
    return `${d20Count}`;
}

function incrementAttribute(attribute) {
    const input = document.getElementById(attribute + '-value');
    let value = parseInt(input.textContent);
    const maxAttributeValue = updateMaxAttributeValue();

    if (attribute === 'nivel') {
        if (value < 30) {
            value += 1;
            input.textContent = value;
            updatePontosRestantes();
            updatePericiaBonuses(); // Adicione esta linha
        }
    } else {
        if (value < maxAttributeValue && state.pontosRestantes > 0) {
            value += 1;
            input.textContent = value;
            state.pontosRestantes -= 1;
            updatePontosRestantes();
            updatePericiaBonuses(); // Adicione esta linha
        }
    }
}

function decrementAttribute(attribute) {
    const input = document.getElementById(attribute + '-value');
    let value = parseInt(input.textContent);

    if (attribute === 'nivel') {
        if (value > 1) {
            value -= 1;
            input.textContent = value;
            updatePontosRestantes();
            updatePericiaBonuses(); // Adicione esta linha
        }
    } else {
        if (value > 1 || (value === 1 && countZeroAttributes() < 1)) {
            value -= 1;
            input.textContent = value;
            state.pontosRestantes += 1;
            updatePontosRestantes();
            updatePericiaBonuses(); // Adicione esta linha
        }
    }
}

function countZeroAttributes() {
    const attributes = ['forca', 'agilidade', 'inteligencia', 'presenca'];
    let zeroCount = 0;

    attributes.forEach(attr => {
        const value = parseInt(document.getElementById(attr + '-value').textContent);
        if (value === 0) {
            zeroCount++;
        }
    });

    return zeroCount;
}

function updatePontosRestantes() {
    const nivel = parseInt(document.getElementById('nivel-value').textContent);
    const basePontos = 3;
    const pontosPorNivel = Math.floor(nivel / 5);

    const forca = parseInt(document.getElementById('forca-value').textContent);
    const agilidade = parseInt(document.getElementById('agilidade-value').textContent);
    const inteligencia = parseInt(document.getElementById('inteligencia-value').textContent);
    const presenca = parseInt(document.getElementById('presenca-value').textContent);

    const pontosDistribuidos = (forca - 1) + (agilidade - 1) + (inteligencia - 1) + (presenca - 1);

    state.pontosRestantes = basePontos + pontosPorNivel - pontosDistribuidos;
    document.getElementById('pontos-restantes').innerText = state.pontosRestantes;
}

function updateMaxAttributeValue() {
    const nivel = parseInt(document.getElementById('nivel-value').textContent);
    return Math.min(3 + Math.floor(nivel / 5), 6);
}

function populateResumoSection() {
    const resumoContainer = document.getElementById('resumo-cards');
    resumoContainer.innerHTML = '';

    const sections = [
        { title: 'Ancestral', value: state.selectedAncestralName },
        { title: 'Sub-Ancestral', value: state.selectedSubAncestralName },
        { title: 'Estilo', value: state.selectedEstiloName },
        { title: 'Classe', value: state.selectedClasseName },
        { title: 'Sub-Classe 1', value: state.selectedSubClasse1Name },
        { title: 'Sub-Classe 2', value: state.selectedSubClasse2Name },
        { title: 'Guilda', value: state.selectedGuildaName },
        { title: 'Profissao', value: state.selectedProfissaoName }
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

    const periciaProfissaoSection = document.createElement('div');
    periciaProfissaoSection.classList.add('card');
    periciaProfissaoSection.innerHTML = `
        <h2>Perícias da Profissão</h2>
        ${state.selectedProfissaoPericias.map(p => `<p>${p.name}</p>`).join('')}
    `;
    resumoContainer.appendChild(periciaProfissaoSection);

    const periciaAncestrySection = document.createElement('div');
    periciaAncestrySection.classList.add('card');
    periciaAncestrySection.innerHTML = `
        <h2>Perícias do Ancestral</h2>
        ${state.selectedAncestryPericias.map(p => `<p>${p.name}</p>`).join('')}
    `;
    resumoContainer.appendChild(periciaAncestrySection);
}

document.getElementById('create-character-button').addEventListener('click', function() {
    const characterData = {
        name: document.getElementById('nome-personagem').value,
        ancestry_id: state.selectedAncestral,
        sub_ancestry_id: state.selectedSubAncestral,
        estilo_id: state.selectedEstilo,
        classe_id: state.selectedClasse,
        sub_classe1_id: state.selectedSubClasse1,
        sub_classe2_id: state.selectedSubClasse2,
        guilda_id: state.selectedGuilda,
        profissao_id: state.selectedProfissao,
        attributes: {
            forca: parseInt(document.getElementById('forca-value').textContent),
            agilidade: parseInt(document.getElementById('agilidade-value').textContent),
            inteligencia: parseInt(document.getElementById('inteligencia-value').textContent),
            presenca: parseInt(document.getElementById('presenca-value').textContent)
        },
        profissao_pericias: state.selectedProfissaoPericias.map(p => p.id),
        ancestry_pericias: state.selectedAncestryPericias.map(p => p.id)
    };

    fetch('/criarpersonagem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(characterData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/perfil';
        } else {
            alert('Erro ao criar personagem.');
        }
    })
    .catch(error => console.error('Error:', error));
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; cookies.length > i; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}