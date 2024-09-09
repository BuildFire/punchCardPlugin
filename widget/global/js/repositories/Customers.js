// eslint-disable-next-line no-unused-vars
class Customers {
  /**
     * Get database collection tag
     * @returns {string}
     */
  static get TAG() {
    return 'customers';
  }

  /**
     * get Customers data
     * @returns {Promise}
     */

  static search(options = {}) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.search(options, Customers.TAG, (err, result) => {
        if (err) return reject(err);
        const data = result.map((record) => {
          record.data.id = record.id;
          return new Customer(record.data).toJSON();
        });
        resolve(data);
      });
    });
  }

  /**
     * set Customers data
     * @param {Object} data
     * @returns {Promise}
     */
  static save(data) {
    return new Promise((resolve, reject) => {
      data.customerId = AuthManager.currentUser.userId;
      buildfire.publicData.insert(
        new Customer(data).toJSON(),
        Customers.TAG,
        (err, res) => {
          if (err) return reject(err);
          return resolve(new Customer(res.data).toJSON());
        },
      );
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        id,
        data,
        Customers.TAG,
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        },
      );
    });
  }
}
