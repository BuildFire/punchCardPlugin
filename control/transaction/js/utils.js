// eslint-disable-next-line no-unused-vars
const transactionUtils = {

  handleEmptyState(isLoading, showEmptyState, key = 'noTransaction') {
    const emptyStateContainer = document.getElementById('emptyTableContainer');

    let emptyMessage = '';
    switch (key) {
      case 'noTransaction':
        emptyMessage = '<h5>There are no transaction yet</h5>';
        break;
      default:
        emptyMessage = '<h5><div class="loader"></div>Loading...</h5>';
    }

    if (isLoading) {
      emptyStateContainer.classList.remove('hidden');
      emptyStateContainer.innerHTML = '<h5><div class="loader"></div>Loading...</h5>';
    } else if (showEmptyState) {
      emptyStateContainer.classList.remove('hidden');
      emptyStateContainer.innerHTML = emptyMessage;
    } else {
      emptyStateContainer.classList.add('hidden');
    }
  },

};
