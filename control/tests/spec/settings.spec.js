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
      employeeTags: [],
      createdOn: new Date(),
      createdBy: null,
      lastUpdatedOn: new Date(),
      lastUpdatedBy: null,
    };
  });

  it('should get settings data when data exists', (done) => {
    const mockResponse = { settingData: new Setting().toJSON() };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));

    Settings.get().then((data) => {
      expect(data.settingData).toEqual(mockResponse.settingData);
      done();
    });
  });

  it('should initialize and save settings data when no data exists', (done) => {
    const mockResponse = { data: {} };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, { data: new Setting(data).toJSON() }));

    Settings.get().then(({ settingData, isNewInstance }) => {
      delete settingData.createdOn;
      delete settingData.lastUpdatedOn;
      const expectedData = new Setting().toJSON();
      delete expectedData.createdOn;
      delete expectedData.lastUpdatedOn;
      expect(settingData).toEqual(expectedData);
      expect(isNewInstance).toBe(true);
      expect(mockDatastore.save).toHaveBeenCalled();
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
    const mockResponse = { settingData: new Setting(mockSettings).toJSON() };
    mockDatastore.get.and.callFake((tag, callback) => callback(null, mockResponse));
    mockDatastore.save.and.callFake((data, tag, callback) => callback(null, { data: new Setting(data).toJSON() }));

    Settings.save(mockSettings).then((data) => {
      expect(data).toEqual(mockSettings);
      expect(mockDatastore.save).toHaveBeenCalledWith(mockSettings, Settings.TAG, jasmine.any(Function));

      Settings.get().then(({ settingData, isNewInstance }) => {
        expect(settingData).toEqual(mockResponse.settingData);
        done();
      });
    });
  });
});

describe('Settings Controller', () => {
  beforeEach(() => {
    spyOn(Settings, 'get').and.returnValue(Promise.resolve({ settingData: {}, isNewInstance: true }));
    spyOn(UserCodeSequences, 'initializeCodeSequence').and.returnValue(Promise.resolve());
  });

  it('should initialize code sequence after install the plugin', async () => {
    await contentController.getSettings();

    expect(Settings.get).toHaveBeenCalled();
    expect(UserCodeSequences.initializeCodeSequence).toHaveBeenCalled();
  });
});
