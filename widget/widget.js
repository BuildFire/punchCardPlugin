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
const parseDeeplinkData = (deeplinkQueryString) => {
  let cleanedString;
  if (typeof deeplinkQueryString === 'string') {
    cleanedString = deeplinkQueryString.replace(/^&dld=/, '');
  } else {
    return deeplinkQueryString;
  }

  try {
    const decodedString = decodeURIComponent(cleanedString);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Error decoding deepLinkData:', error);
    return null;
  }
};
const initApp = async () => {
  buildfire.appearance.titlebar.show();
  applySafeAreaStyles();
  try {
    const settingsData = await Settings.get();
    widgetAppState.settings = settingsData.data;
    await AuthManager.getUserPermission();
    if (AuthManager.isEmployee) {
      widgetAppRouter.init();
      EmployeeView.init();
    } else {
      CustomerView.toggleSkeleton('start', !!widgetAppState.settings.introductionWYSIWYG);
      await CustomerController.handleCustomerIdGeneration();
      CustomerView.init();
      widgetAppRouter.init();
      CustomerView.toggleSkeleton('stop');
    }
    handleCPSync.receivedMessage();
    NotificationsManager.init();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};
window.onload = async () => {
  await initApp();
};

buildfire.auth.onLogin(() => {
  window.location.reload();
}, true);
buildfire.auth.onLogout(() => {
  window.location.reload();
}, true);

buildfire.deeplink.onUpdate((deeplinkData) => {
  const deeplinkPayload = parseDeeplinkData(deeplinkData);
  if (deeplinkPayload && deeplinkPayload.earned) {
    if (widgetAppRouter.currentPage === 'home') {
      widgetAppRouter.goToPage('customerTransaction');
      widgetAppRouter.push({ pageId: 'customerTransaction', pageName: 'customerTransaction', name: 'history' });
      TransactionView._initCustomerListView();
    } else {
      TransactionView._initCustomerListView();
    }
  }
});
