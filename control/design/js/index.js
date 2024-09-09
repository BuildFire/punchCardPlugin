// eslint-disable-next-line no-unused-vars
let settings = null;

const initDesign = async () => {
  try {
    await AuthManager.refreshCurrentUser();
    settings = await Settings.get();
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

    stampedImage.loadbackground(settings.data.design.stampedImageUrl);
    unStampedImage.loadbackground(settings.data.design.unstampedImageUrl);

    stampedImage.onChange = (imageUrl) => {
      settings.data.design.stampedImageUrl = imageUrl;
      Settings.save(settings.data).then(()=> {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: settings.data.design } });
      });
    };

    unStampedImage.onChange = (imageUrl) => {
      settings.data.design.unstampedImageUrl = imageUrl;
      Settings.save(settings.data).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: settings.data.design } });
      });
    };

    stampedImage.onDelete = () => {
      settings.data.design.stampedImageUrl = '';
      Settings.save(settings.data).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: settings.data.design } });
      });
    };

    unStampedImage.onDelete = () => {
      settings.data.design.unstampedImageUrl = '';
      Settings.save(settings.data).then(() => {
        cpShared.syncWithWidget({ cmd: 'designChanged', data: { design: settings.data.design } });
      });
    };
  }).catch((error) => {
    throw error;
  });
};
