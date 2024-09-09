describe('Settings Repository', () => {
  let mockDatastore;
  let mockPublicDataStore;
  let mockSettings;

  beforeEach(() => {
    mockDatastore = jasmine.createSpyObj('datastore', ['get', 'save']);
    buildfire.datastore = mockDatastore;
    mockPublicDataStore = jasmine.createSpyObj('publicData', ['search', 'save', 'update']);
    buildfire.publicData = mockPublicDataStore;
    mockSettings = {
      design: {
        stampedImageUrl: '',
        unstampedImageUrl: '',
      },
      introductionWYSIWYG: '',
      rewardName: 'Free Coffee',
      cardSize: 10,
      employeesPermissions: [],
      createdOn: new Date(),
      createdBy: null,
      lastUpdatedOn: new Date(),
      lastUpdatedBy: null,
    };
  });

  it('should get settings data when data exists', (done) => {
    const mockResponse = { data: new Setting().toJSON() };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));

    Settings.get().then((data) => {
      expect(data.data).toEqual(mockResponse.data);
      done();
    });
  });

  it('should initialize and save settings data when no data exists', (done) => {
    const mockResponse = { data: {} };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, { data: new Setting(data).toJSON() }));
    // spyOn(UserCodeSequences, 'initializeCodeSequence').and.returnValue(Promise.resolve());

    Settings.get().then((data) => {
      delete data.data.createdOn;
      delete data.data.lastUpdatedOn;
      const expectedData = new Setting().toJSON();
      delete expectedData.createdOn;
      delete expectedData.lastUpdatedOn;
      expect(data.data).toEqual(expectedData);
      expect(mockDatastore.save).toHaveBeenCalled();
    //  expect(UserCodeSequences.initializeCodeSequence).toHaveBeenCalled();
      done();
    });
  });

  it('should save settings data', (done) => {
    const mockData = new Setting().toJSON();
    const mockResponse = { data: mockData };
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, mockResponse));

    Settings.save(mockData).then((data) => {
      expect(data).toEqual(mockData);
      expect(mockDatastore.save).toHaveBeenCalledWith(mockData, Settings.TAG, jasmine.any(Function));
      done();
    });
  });

  it('should save and retrieve settings data that matches the Setting model', (done) => {
    const mockResponse = { data: new Setting(mockSettings).toJSON() };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, { data: new Setting(data).toJSON() }));

    Settings.save(mockSettings).then((data) => {
      expect(data).toEqual(mockSettings);
      expect(mockDatastore.save).toHaveBeenCalledWith(mockSettings, Settings.TAG, jasmine.any(Function));

      Settings.get().then((data) => {
        expect(data.data).toEqual(mockResponse.data);
        done();
      });
    });
  });
});

describe('Settings Controller', () => {
  beforeEach(() => {
    spyOn(Settings, 'get').and.returnValue(Promise.resolve({ data: {}, init: true }));
    spyOn(UserCodeSequences, 'initializeCodeSequence').and.returnValue(Promise.resolve());
  });

  it('should initialize code sequence after install the plugin', async () => {
    await contentController.getSettings();

    expect(Settings.get).toHaveBeenCalled();
    expect(UserCodeSequences.initializeCodeSequence).toHaveBeenCalled();
  });
});
