function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (section.id === sectionId + '-section') {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    showSection('geral');

    const saveButton = document.getElementById('save-traits-button');
    const textAreas = document.querySelectorAll('#personalidade, #ideais, #objetivos, #defeitos_medos');
    const initialValues = {};

    textAreas.forEach(textArea => {
        initialValues[textArea.id] = textArea.value;
        textArea.addEventListener('input', function() {
            if (textArea.value !== initialValues[textArea.id]) {
                saveButton.classList.remove('hidden');
            }
        });
    });
});

function saveTraits() {
    const characterId = document.getElementById('character-id').value;
    const characterData = {
        personalidade: document.getElementById('personalidade').value,
        ideais: document.getElementById('ideais').value,
        objetivos: document.getElementById('objetivos').value,
        defeitos_medos: document.getElementById('defeitos_medos').value,
    };

    fetch(`/update_traits/${characterId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token')
        },
        body: JSON.stringify(characterData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Exibe o botão "Salvo" e oculta o botão "Salvar"
            document.getElementById('save-traits-button').classList.add('hidden');
            document.getElementById('saved-button').style.display = 'inline-block';

            // Esconde o botão "Salvo" após alguns segundos
            setTimeout(() => {
                document.getElementById('saved-button').style.display = 'none';
            }, 2000); // Ajuste o tempo conforme necessário
        } else {
            alert('Erro ao salvar os dados');
        }
    })
    .catch(error => console.error('Error:', error));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function updateInitialValues() {
    const textAreas = document.querySelectorAll('#personalidade, #ideais, #objetivos, #defeitos_medos');
    textAreas.forEach(textArea => {
        initialValues[textArea.id] = textArea.value;
    });
}