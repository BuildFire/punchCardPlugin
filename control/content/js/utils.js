// eslint-disable-next-line no-unused-vars
const contentHelper = {
  toggleLoadingScreen(isLoading) {
    const loadingContainer = document.getElementById('introLoadingScreen');
    if (isLoading) {
      loadingContainer.classList.remove('hidden');
      loadingContainer.innerHTML = '<h5><div class="loader"></div>Loading...</h5>';
    } else {
      loadingContainer.classList.add('hidden');
    }
  },

};
