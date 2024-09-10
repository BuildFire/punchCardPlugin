const initContent = async () => {
  contentHelper.toggleLoadingScreen(true);
  await contentController.getSettings();
  contentController.initIntroWysiwyg();
  contentView.init();
  contentHelper.toggleLoadingScreen(false);
};

window.onload = () => {
  initContent();
};
