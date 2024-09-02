let timerDelay = null;
const saveWithDelay = (key) => {
  clearTimeout(timerDelay);
  timerDelay = setTimeout(() => {
    Settings.save(contentState.settings)
      .then(() => {
        // CPSyncManager.syncWithWidget({ scope: 'settings', [key]: contentState.settings[key], key });
      })
      .catch((error) => {
        console.error('Error in saveWithDelay:', error);
      });
  }, 500);
};
const initIntroWysiwyg = () => {
  tinymce.init({
    selector: '#introductionWYSIWYGContent',
    setup: (editor) => {
      editor.on('change keyUp', () => {
        const wysiwygContent = editor.getContent();
        contentState.settings.introContent = wysiwygContent;
        saveWithDelay('introContent');
      });

      editor.on('init', () => {
        editor.setContent(contentState.settings.introContent || '');
      });
    },
  });
};

const initContent = async () => {
  try {
    contentHelper.toggleLoadingScreen(true);
    contentState.settings = await Settings.get();
    initIntroWysiwyg();
    contentHelper.toggleLoadingScreen(false);
  } catch (error) {
    console.error('Error in initContent:', error);
  }
};
window.onload = async () => {
  await initContent();
};

