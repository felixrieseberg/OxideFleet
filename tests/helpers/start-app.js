import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';
import containerAdapter from '../../adapters/container';
export default function startApp(attrs, assert) {
    var application;
    var attributes = Ember.merge({}, config.APP);
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;
    Ember.run(function () {
        application = Application.create(attributes);
        application.setupForTesting();
        application.injectTestHelpers();
        application.ContainerAdapter = containerAdapter;
    });
    var container = application.__container__;
    var nodeServices = container.lookup('service:node-services');
    nodeServices.set('azureStorage', {
        createBlobService: function () {
            return {
                listContainersSegmented: function (shouldBeNull, callback) {
                    assert.ok(shouldBeNull === null, 'expeceted arg shouldBeNull to be null');
                    assert.ok(callback !== null, 'expeceted arg callback to be non-null');
                    return callback(null, {
                        entries: [{
                            name: 'testcontainer',
                            properties: {
                                'last-modified': new Date(Date.now())
                            }
                        }, {
                            name: 'testcontainer2',
                            properties: {
                                'last-modified': new Date(Date.now())
                            }
                        }]
                    });
                },
                deleteContainer: function (containerName, callback) {
                    assert.ok(containerName !== null, 'expeceted arg containerName to be non-null');
                    assert.ok(callback !== null, 'expeceted arg callback to be non-null');
                    return callback(null);
                },
                getContainerProperties: function (containerName, callback) {
                    assert.ok(containerName !== null, 'expeceted arg containerName to be non-null');
                    assert.ok(callback !== null, 'expeceted arg callback to be non-null');
                    return callback(null, {
                        name: containerName,
                        lastModified: Date.Now()
                    });
                },
                createContainerIfNotExists: function (containerName, callback) {
                    assert.ok(containerName !== null, 'expeceted arg containerName to be non-null');
                    assert.ok(callback !== null, 'expeceted arg callback to be non-null');
                    return callback(null);
                },
                listBlobsSegmented: function (containerName, shouldBeNull, callback) {
                    assert.ok(containerName !== null, 'expeceted arg containerName to be non-null');
                    assert.ok(shouldBeNull === null, 'expeceted arg shouldBeNull to be null');
                    assert.ok(callback !== null, 'expeceted arg callback to be non-null');
                    return callback(null, {
                        entries: [{
                            name: 'test-blob-1.mp4',
                            properties: {
                                'content-type': 'video/mpeg4',
                                'content-length': 12313435,
                                'last-modified': new Date(Date.now())
                            }
                        }, {
                            name: 'test-blob-2.png',
                            properties: {
                                'content-type': 'image/png',
                                'content-length': 12313435,
                                'last-modified': new Date(Date.now())
                            }
                        }, {
                            name: 'test-blob-3.mp4',
                            properties: {
                                'content-type': 'video/mpeg4',
                                'content-length': 12313435,
                                'last-modified': new Date(Date.now())
                            }
                        }, {
                            name: 'test-blob-4.mp3',
                            properties: {
                                'content-type': 'audio/mp3',
                                'content-length': 12313435,
                                'last-modified': new Date(Date.now())
                            }
                        }]
                    });
                },
                generateSharedAccessSignature: function () {
                    assert.ok(true);
                    // litterally just mashed my keyboard here :-)
                    return '32523fdsgjsdkh5r43r89hvsghsdhafkjwerhs';
                },
                getUrl: function () {
                    assert.ok(true);
                    return 'https://testaccount.storage.windows.net/somecontainer/test-blob?expiry=2000';
                },
                BlobUtilities: {
                    SharedAccessPermissions: {
                        READ: 'READ'
                    }
                }
            };
        }
    });
    return application;
}
