import Expo
import React
import ReactAppDependencyProvider
import UIKit

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var splashWindow: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = UIColor(patternImage: UIImage(named: "SplashScreen") ?? UIImage())
    
    // Show custom splash screen on top
    showSplashScreen()
    
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    
    // Hide splash after 3 seconds with fade
    DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
      self.hideSplashScreen()
    }
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  private func showSplashScreen() {
    splashWindow = UIWindow(frame: UIScreen.main.bounds)
    splashWindow?.windowLevel = .normal + 1
    splashWindow?.rootViewController = createSplashViewController()
    splashWindow?.makeKeyAndVisible()
  }
  
  private func createSplashViewController() -> UIViewController {
    let viewController = UIViewController()
    let imageView = UIImageView(frame: UIScreen.main.bounds)
    imageView.image = UIImage(named: "SplashScreen")
    imageView.contentMode = .scaleAspectFill
    viewController.view = imageView
    return viewController
  }
  
  private func hideSplashScreen() {
    UIView.animate(withDuration: 0.3, animations: {
      self.splashWindow?.alpha = 0
    }) { _ in
      self.splashWindow?.isHidden = true
      self.splashWindow = nil
    }
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
