// eslint-disable-next-line no-unused-vars
const widgetAppRouter = {
  currentPage: null,

  back() {
    buildfire.history.pop();
  },

  push({ pageId, pageName, showLabel = false }) {
    buildfire.history.push(pageName, {
      showLabelInTitlebar: showLabel,
      pageId,
    });
    this.goToPage(pageId);
    this.currentPage = pageId;
  },

  goToPage(pageId) {
    const sections = document.querySelectorAll('.screen');
    sections.forEach((section) => section.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
  },

  getBreadcrumbs() {
    return new Promise((resolve, reject) => {
      buildfire.history.get(
        {
          pluginBreadcrumbsOnly: true,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
    });
  },

  init() {
    buildfire.history.onPop((breadcrumbs) => {
      if (this.currentPage === 'customerTransaction') {
        widgetAppRouter.back();
        widgetAppRouter.goToPage('home');
        widgetAppRouter.currentPage = null;
        return;
      }
      if (AuthManager.isEmployee) {
        if (this.currentPage === 'home') {
          widgetAppRouter.back();
          widgetAppRouter.goToPage('employeeTransaction');
          return;
        }
      }
      this.currentPage = breadcrumbs.options.pageId;
      if (breadcrumbs.options.pageId === 'employeeTransaction') {
        CustomerView.reset();
      }
    });
  },
};
