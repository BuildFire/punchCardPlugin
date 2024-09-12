// eslint-disable-next-line no-unused-vars
class UserCodeSequence {
  constructor(data = {}) {
    this.bfId = 'sequenceCollection';
    this.sequence = data.sequence || 9999;
    this.createdOn = data.createdOn || new Date();
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || new Date();
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }

  toJSON() {
    return {
      bfId: this.bfId,
      sequence: this.sequence,
      createdOn: this.createdOn,
      createdBy: this.createdBy,
      lastUpdatedOn: this.lastUpdatedOn,
      lastUpdatedBy: this.lastUpdatedBy,
      _buildfire: {
        index: {
          string1: this.bfId,
        },
      },
    };
  }
}
