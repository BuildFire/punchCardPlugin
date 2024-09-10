const initApp = async () => {
  buildfire.appearance.titlebar.show();
  applySafeAreaStyles();
  try {
    const { settingData } = await Settings.get();
     widgetAppState.settings = settingData;
    await AuthManager.getUserPermission();
    if (AuthManager.isEmployee) {
      EmployeeView.init();
      widgetAppRouter.init();
    } else {
      CustomerView.init();
      widgetAppRouter.init();
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
