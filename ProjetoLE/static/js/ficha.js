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