const applySafeAreaStyles = () => {
  const { navbarEnabled } = buildfire.getContext();
  const rootElement = document.querySelector('html');
  const isSafeAreaEnabled = rootElement.getAttribute('safe-area') === 'true';
  if (isSafeAreaEnabled) {
    if (!navbarEnabled) {
      const body = document.querySelector('body');
      body.classList.add('has-safe-area');
    }
  }
};
