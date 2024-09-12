// eslint-disable-next-line no-unused-vars
const designState = { settings: null };
const initDesign = async () => {
  try {
    await AuthManager.refreshCurrentUser();
    const { settingData } = await Settings.get();
    designState.settings = settingData;
  } catch (error) {
    console.error('Error in initDesign:', error);
  }
};

window.onload = async () => {
  initDesign().then(() => {
    const stampedImage = new buildfire.components.images.thumbnail('#stampedImage',
      { title: 'Stamped Image', dimensionsLabel: 'Recommended ratio: 1:1' });
    const unStampedImage = new buildfire.components.images.thumbnail('#unStampedImage',
      { title: 'Un-stamped Image', dimensionsLabel: 'Recommended ratio: 1:1' });

    stampedImage.loadbackground(designState.settings.design.stampedImageUrl);
    unStampedImage.loadbackground(designState.settings.design.unstampedImageUrl);

    stampedImage.onChange = (imageUrl) => {
      designState.settings.design.stampedImageUrl = imageUrl;
      Settings.save(designState.settings).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: designState.settings.design } });
      });
    };

    unStampedImage.onChange = (imageUrl) => {
      designState.settings.design.unstampedImageUrl = imageUrl;
      Settings.save(designState.settings).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: designState.settings.design } });
      });
    };

    stampedImage.onDelete = () => {
      designState.settings.design.stampedImageUrl = '';
      Settings.save(designState.settings).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: designState.settings.design } });
      });
    };

    unStampedImage.onDelete = () => {
      designState.settings.design.unstampedImageUrl = '';
      Settings.save(designState.settings).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: designState.settings.design } });
      });
    };
  }).catch((error) => {
    console.error(error);
  });
};
