// eslint-disable-next-line no-unused-vars
class UserCodeSequences {
  /**
     * Get database collection tag
     * @returns {string}
     */
  static get TAG() {
    return 'sequenceCollection';
  }

  /**
     * get code sequence data
     * @returns {Promise}
     */
  static search(options = {}) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.search(
        options,
        UserCodeSequences.TAG,
        (err, result) => {
          if (err) return reject(err);
          const data = result.map((record) => {
            record.data.id = record.id;
            return record.data;
          });
          resolve(data);
        },
      );
    });
  }

  static save(data) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.save(data, UserCodeSequences.TAG, (err, res) => {
        if (err) return reject(err);
        return resolve(new UserCodeSequence(res.data).toJSON());
      });
    });
  }

  static incrementSequence(id) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        id,
        { $inc: { sequence: 1 } },
        UserCodeSequences.TAG,
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        },
      );
    });
  }

  static getNextSequenceValue() {
    return new Promise((resolve, reject) => {
      UserCodeSequences.search({
        filter: {
          '_buildfire.index.string1': 'sequenceCollection',
        },
        limit: 1,
      })
        .then((result) => {
          if (result.length > 0) {
            const { id } = result[0];
            UserCodeSequences.incrementSequence(id).then((res) => {
              resolve(res.data.sequence);
            });
          } else {
            reject(new Error('No document found to update'));
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  static generateUserCode() {
    return UserCodeSequences.getNextSequenceValue().then(
      (nextCode) => nextCode,
    );
  }

  static initializeCodeSequence() {
    return this.save(new UserCodeSequence().toJSON());
  }
}
