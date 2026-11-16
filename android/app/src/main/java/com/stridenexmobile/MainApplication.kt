package com.stridenexmobile

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Ensure high-priority StrideNex notification channel exists for push notifications
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(android.app.NotificationManager::class.java)
      val channel = android.app.NotificationChannel(
        "stridenex_notifications",
        "StrideNex Notifications",
        android.app.NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "StrideNex app notifications, course updates, and alerts"
        enableLights(true)
        enableVibration(true)
      }
      notificationManager?.createNotificationChannel(channel)
    }
  }
}
