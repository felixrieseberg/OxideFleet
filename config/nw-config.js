module.exports = {
    appName: 'oxide',
    platforms: ['osx64'],
    buildType: function () {
        return this.appVersion;
    }
};