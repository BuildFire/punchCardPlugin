const getSettings = async () => {
  await AuthManager.refreshCurrentUser();
  const settingData = await Settings.get();
  contentState.settings = settingData.data || settingData;
  if (settingData.init) {
    await UserCodeSequences.initializeCodeSequence();
    await AnalyticsManager.init();
  }
};

const initContent = async () => {
  contentHelper.toggleLoadingScreen(true);
  await getSettings();
  contentController.initIntroWysiwyg();
  contentView.init();
  contentHelper.toggleLoadingScreen(false);
};

window.onload = () => {
  initContent();
};
