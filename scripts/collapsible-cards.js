document.querySelectorAll('.collapsible-content-button').forEach(link => {
  link.addEventListener('click', event => {
    event.stopPropagation(); // prevent click from bubbling up to the button
  });
});

document.querySelectorAll('.collapsible-card').forEach(card => {
  const headerHeight = card.querySelector('h2').offsetHeight + parseFloat(getComputedStyle(card).paddingTop) + parseFloat(getComputedStyle(card).paddingBottom);
  card.style.height = headerHeight + 'px';
  card.addEventListener('click', () => {
    const isOpen = card.classList.toggle('open');
    card.classList.toggle('collapsed');

    if (isOpen) {
        const expandedHeight = card.scrollHeight;
        card.style.height = expandedHeight + 'px';
    } else {
        card.style.height = headerHeight + 'px';
    }
  });
});
