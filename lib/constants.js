exports.topLevelElements = ['guid', 'id', 'name', 'analytics', 'copyright', 'description', 'fullscreen', 'icon', 'navbar-hidden', 'publisher', 'sdk-version', 'url', 'version'];
exports.androidManifestElements = [{
    'attribute' : 'versionName',
    'element' : 'manifest',
    'parent' : 'android'
}, {
    'attribute' : 'versionCode',
    'element' : 'manifest',
    'parent' : 'android'
}, {
    'element' : 'uses-sdk',
    'attribute' : 'minSdkVersion',
    'parent' : 'manifest'
}, {
    'element' : 'uses-sdk',
    'attribute' : 'targetSdkVersion',
    'parent' : 'manifest'
}];
exports.androidApplicationElements = ['allowTaskReparenting', 'allowBackup', 'backupAgent', 'banner', 'debuggable', 'description', 'enabled', 'hasCode', 'hardwareAccelerated', 'icon', 'isGame', 'killAfterRestore', 'largeHeap', 'label', 'logo', 'manageSpaceActivity', 'name', 'permission', 'persistent', 'process', 'restoreAnyVersion', 'requiredAccountType', 'restrictedAccountType', 'supportsRtl', 'taskAffinity', 'testOnly', 'theme', 'uiOptions', 'vmSafeMode'];
exports.androidElements = [{
    'name' : 'action',
    'containedIn' : ['intent-filter'],
    'attributes' : ['name']
}, {
    'name' : 'activity',
    'containedIn' : ['application'],
    'attributes' : ['allowEmbedded', 'allowTaskReparenting', 'alwaysRetainTaskState', 'autoRemoveFromRecents', 'banner', 'clearTaskOnLaunch', 'configChanges', 'documentLaunchMode', 'enabled', 'excludeFromRecents', 'exported', 'finishOnTaskLaunch', 'hardwareAccelerated', 'icon', 'label', 'launchMode', 'maxRecents', 'multiprocess', 'name', 'noHistory', 'parentActivityName', 'permission', 'process', 'relinquishTaskIdentity', 'screenOrientation', 'stateNotNeeded', 'taskAffinity', 'theme', 'uiOptions', 'windowSoftInputMode']
}, {
    'name' : 'activity-alias',
    'containedIn' : ['application'],
    'attributes' : ['enabled', 'exported', 'icon', 'label', 'name', 'permission', 'targetActivity']
}, {
    'name' : 'application',
    'containedIn' : ['manifest'],
    'attributes' : ['allowTaskReparenting', 'allowBackup', 'backupAgent', 'banner', 'debuggable', 'description', 'enabled', 'hasCode', 'hardwareAccelerated', 'icon', 'isGame', 'killAfterRestore', 'largeHeap', 'label', 'logo', 'manageSpaceActivity', 'name', 'permission', 'persistent', 'process', 'restoreAnyVersion', 'requiredAccountType', 'restrictedAccountType', 'supportsRtl', 'taskAffinity', 'testOnly', 'theme', 'uiOptionsvmSafeMode']
}, {
    'name' : 'category',
    'containedIn' : ['intent-filter'],
    'attributes' : ['name']
}, {
    'name' : 'compatible-screens',
    'containedIn' : ['manifest'],
    'attributes' : ['screenSize', 'screenDensity']
}, {
    'name' : 'data',
    'containedIn' : ['intent-filter'],
    'attributes' : ['scheme', 'host', 'port', 'path', 'pathPattern', 'pathPrefix', 'mimeType']
}, {
    'name' : 'grant-uri-permission',
    'containedIn' : ['provider'],
    'attributes' : ['path', 'pathPattern', 'pathPrefix']
}, {
    'name' : 'instrumentation',
    'containedIn' : ['manifest'],
    'attributes' : ['functionalTest', 'handleProfiling', 'icon', 'label', 'android', 'targetPackage']
}, {
    'name' : 'intent-filter',
    'containedIn' : ['activity', 'activity-alias', 'service', 'receiver'],
    'attributes' : ['icon', 'label', 'priority']
}, {
    'name' : 'manifest',
    'containedIn' : ['android'],
    'attributes' : ['package', 'android:sharedUserId', 'android:sharedUserId', 'android:sharedUserLabel', 'android:versionCode', 'android:versionName', 'android:installLocation']
}, {
    'name' : 'meta-data',
    'containedIn' : ['activity', 'activity-alias', 'application', 'provider', 'receiver'],
    'attributes' : ['name', 'resource', 'value']
}, {
    'name' : 'path-permission',
    'containedIn' : ['provider'],
    'attributes' : ['path', 'pathPattern', 'pathPrefix', 'permission', 'readPermission', 'writePermission']
}, {
    'name' : 'permission',
    'containedIn' : ['manifest'],
    'attributes' : ['description', 'icon', 'label', 'name', 'permissionGroup', 'protectionLevel']
}, {
    'name' : 'permission-group',
    'containedIn' : ['manifest'],
    'attributes' : ['description', 'icon', 'label', 'name']
}, {
    'name' : 'permission-tree',
    'containedIn' : ['manifest'],
    'attributes' : ['icon', 'label', 'name']
}, {
    'name' : 'provider',
    'containedIn' : ['application'],
    'attributes' : ['authorities', 'enabled', 'exported', 'grantUriPermissions', 'icon', 'initOrder', 'label', 'multiprocess', 'name', 'permission', 'process', 'readPermission', 'syncable', 'writePermission']
}, {
    'name' : 'receiver',
    'containedIn' : ['application'],
    'attributes' : ['enabled', 'exported', 'icon', 'label', 'name', 'permission', 'process']
}, {
    'name' : 'service',
    'containedIn' : ['application'],
    'attributes' : ['enabled', 'exported', 'icon', 'isolatedProcess', 'label', 'name', 'permission', 'process']
}, {
    'name' : 'supports-gl-texture',
    'containedIn' : ['manifest'],
    'attributes' : ['name']
}, {
    'name' : 'supports-screens',
    'containedIn' : ['manifest'],
    'attributes' : ['resizeable', 'smallScreens', 'normalScreens', 'largeScreens', 'xlargeScreens', 'anyDensity', 'requiresSmallestWidthDp', 'compatibleWidthLimitDp', 'largestWidthLimitDp']
}, {
    'name' : 'uses-configuration',
    'containedIn' : ['manifest'],
    'attributes' : ['reqHardKeyboard', 'reqKeyboardType', 'reqNavigation', 'reqTouchScreen']
}, {
    'name' : 'uses-feature',
    'containedIn' : ['manifest'],
    'attributes' : ['name', 'required', 'glEsVersion']
}, {
    'name' : 'uses-library',
    'containedIn' : ['application'],
    'attributes' : ['name', 'required']
}, {
    'name' : 'uses-permission',
    'containedIn' : ['manifest'],
    'attributes' : ['name', 'maxSdkVersion']
}, {
    'name' : 'uses-sdk',
    'containedIn' : ['manifest'],
    'attributes' : ['minSdkVersion', 'targetSdkVersion', 'maxSdkVersion']
}];