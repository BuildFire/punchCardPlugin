// eslint-disable-next-line no-unused-vars
const getLanguage = (key) => new Promise((resolve, reject) => {
  buildfire.language.get({ stringKey: key }, (err, res) => {
    if (err) {
      reject(err);
    }
    resolve(res);
  });
});
