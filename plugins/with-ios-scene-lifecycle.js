/**
 * Adopts the UIScene life cycle, which the iOS 27 SDK made mandatory. UIKit traps at launch
 * — `__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`, EXC_BREAKPOINT — in an
 * app that still builds its window and starts React Native from the app delegate.
 *
 * Expo 57 already ships the runtime half of this: `ExpoAppSceneDelegate` creates the window
 * from the connecting scene, starts React Native into it, and feeds scene, URL and user
 * activity events back to the app delegate. What SDK 57's prebuild template does not yet do
 * is wire it up, and `ios/` is gitignored, so the wiring has to be reapplied on every
 * prebuild. The three edits below are the SDK 58 template ported back.
 *
 * Delete this plugin when the app moves to SDK 58 — its template generates all of it.
 */
const {
  IOSConfig,
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SCENE_DELEGATE_FILENAME = 'SceneDelegate.swift';

const SCENE_DELEGATE_SOURCE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

/**
 * Names the scene delegate for UIKit. Without this key UIKit considers the app un-migrated
 * however the code is written, and traps anyway.
 */
const withSceneManifest = (config) =>
  withInfoPlist(config, (modConfig) => {
    modConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return modConfig;
  });

const withSceneDelegateFile = (config) =>
  withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const { platformProjectRoot, projectName } = modConfig.modRequest;
      const target = path.join(platformProjectRoot, projectName, SCENE_DELEGATE_FILENAME);

      fs.writeFileSync(target, SCENE_DELEGATE_SOURCE);

      return modConfig;
    },
  ]);

const withSceneDelegateCompiled = (config) =>
  withXcodeProject(config, (modConfig) => {
    const project = modConfig.modResults;
    const groupName = modConfig.modRequest.projectName;
    const references = project.hash.project.objects.PBXFileReference ?? {};

    // Prebuild regenerates the project, but a re-run over an existing one must not add it twice.
    if (JSON.stringify(references).includes(SCENE_DELEGATE_FILENAME)) {
      return modConfig;
    }

    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${groupName}/${SCENE_DELEGATE_FILENAME}`,
      groupName,
      project,
    });

    return modConfig;
  });

/**
 * The window and the React Native start-up move to the scene delegate; the app delegate keeps
 * owning the factory and hands it over through `ExpoReactNativeFactoryProvider`. Leaving the
 * old calls in place would build a second window and a second React Native instance.
 *
 * Everything else in the file is left alone on purpose — in particular the generated
 * `FirebaseApp.configure()` block, which its own config plugin writes into this method and
 * expects to find again on the next prebuild.
 */
const withFactoryProvidingAppDelegate = (config) =>
  withAppDelegate(config, (modConfig) => {
    const replacements = [
      [
        'class AppDelegate: ExpoAppDelegate {',
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      ],
      ['    window = UIWindow(frame: UIScreen.main.bounds)\n', ''],
      [
        '    factory.startReactNative(\n      withModuleName: "main",\n      in: window,\n      launchOptions: launchOptions)\n',
        '',
      ],
    ];

    modConfig.modResults.contents = replacements.reduce((contents, [find, replace]) => {
      if (!contents.includes(find)) {
        throw new Error(
          `with-ios-scene-lifecycle: AppDelegate.swift no longer contains ${JSON.stringify(find)}. ` +
            'The Expo template changed — re-check this plugin against it, or drop the plugin if the ' +
            'template now adopts the scene life cycle itself.',
        );
      }
      return contents.replace(find, replace);
    }, modConfig.modResults.contents);

    return modConfig;
  });

const withIosSceneLifecycle = (config) =>
  withFactoryProvidingAppDelegate(
    withSceneDelegateCompiled(withSceneDelegateFile(withSceneManifest(config))),
  );

module.exports = withIosSceneLifecycle;
