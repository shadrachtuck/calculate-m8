# App Store Deployment Guide

This guide covers the requirements and steps for deploying Calculate M8 to both the Apple App Store and Google Play Store.

## Table of Contents
- [iOS App Store Deployment](#ios-app-store-deployment)
- [Android Play Store Deployment](#android-play-store-deployment)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Post-Deployment](#post-deployment)

---

## iOS App Store Deployment

### Prerequisites

1. **Apple Developer Account**
   - Cost: $99/year
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Required for app submission

2. **Xcode** (latest version)
   - Available on macOS only
   - Download from Mac App Store
   - Required for building and submitting apps

3. **macOS** (for building iOS apps)
   - iOS apps can only be built on macOS

### Step-by-Step Process

#### 1. Configure App in Xcode

1. Open the iOS project:
   ```bash
   npx cap open ios
   ```

2. In Xcode, select your project in the navigator
3. Go to **Signing & Capabilities** tab
4. Ensure **Bundle Identifier** matches your App Store Connect app ID
   - Current: `com.shadrachtuck.calculatem8`
5. Enable **Automatically manage signing** (recommended)
6. Select your **Team** (your Apple Developer account)

#### 2. Update App Configuration

1. Set **Version** and **Build** numbers:
   - Version: e.g., `1.0.0` (user-facing)
   - Build: e.g., `1` (increments with each submission)
2. Set **Deployment Target** (minimum iOS version)
   - Recommended: iOS 13.0 or higher
3. Configure **App Icon**:
   - Size: 1024×1024 px
   - Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
4. Configure **Launch Screen** (already configured in project)

#### 3. Set Up App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: Calculate M8
   - **Primary Language**: English
   - **Bundle ID**: `com.shadrachtuck.calculatem8`
   - **SKU**: `calculate-m8-ios` (unique identifier)
   - **User Access**: Full Access (or Limited if using a team)

#### 4. Prepare App Metadata

In App Store Connect, you'll need to provide:

1. **App Information**:
   - Category: Utilities or Productivity
   - Subcategory: (optional)
   - Privacy Policy URL: (required if app collects data)
   - Support URL: Your website or GitHub repo

2. **Pricing and Availability**:
   - Price: Free or Paid
   - Availability: Countries where app will be available

3. **App Privacy**:
   - Answer questions about data collection
   - Since we use Supabase, we collect:
     - User account data (email)
     - Computation history (user-generated content)
   - Privacy Policy URL is required

4. **Version Information**:
   - Screenshots (required for all device sizes):
     - iPhone 6.7" (iPhone 14 Pro Max, etc.)
     - iPhone 6.5" (iPhone 11 Pro Max, etc.)
     - iPhone 5.5" (iPhone 8 Plus, etc.)
     - iPad Pro 12.9" (if supporting iPad)
   - Description: App description (up to 4000 characters)
   - Keywords: Search keywords (up to 100 characters)
   - Support URL: Your support website
   - Marketing URL: (optional)
   - Promotional Text: (optional, up to 170 characters)
   - What's New: Release notes for updates

5. **App Review Information**:
   - Contact Information
   - Demo Account (if app requires login)
   - Notes: Any special instructions for reviewers

#### 5. Build and Archive

1. In Xcode, select **Any iOS Device** or a connected device
2. Go to **Product** → **Archive**
3. Wait for the build to complete
4. The **Organizer** window will open automatically

#### 6. Validate and Upload

1. In the Organizer, select your archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Click **Next**
5. Choose **Upload** (not Export)
6. Select your distribution options
7. Click **Upload**
8. Wait for upload to complete (can take 10-30 minutes)

#### 7. Submit for Review

1. Go back to App Store Connect
2. Navigate to your app → **TestFlight** tab
3. Wait for processing (can take 10-60 minutes)
4. Once processed, go to the **App Store** tab
5. Select your build from the **Build** dropdown
6. Fill in any remaining metadata
7. Click **Submit for Review**

#### 8. Review Process

- **Timeline**: Usually 24-48 hours, can take up to 7 days
- **Status Updates**: You'll receive email notifications
- **Common Rejection Reasons**:
  - Missing privacy policy
  - App crashes
  - Missing functionality described in description
  - Violation of App Store guidelines

---

## Android Play Store Deployment

### Prerequisites

1. **Google Play Developer Account**
   - Cost: One-time $25 registration fee
   - Sign up at [play.google.com/console](https://play.google.com/console)

2. **Android Studio** (latest version)
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Required for building and testing Android apps

3. **Java Development Kit (JDK)**
   - JDK 11 or higher
   - Usually included with Android Studio

### Step-by-Step Process

#### 1. Configure App in Android Studio

1. Open the Android project:
   ```bash
   npx cap open android
   ```

2. In Android Studio, open `android/app/build.gradle`
3. Verify **applicationId**: `com.shadrachtuck.calculatem8`
4. Set **versionCode** and **versionName**:
   ```gradle
   defaultConfig {
       applicationId "com.shadrachtuck.calculatem8"
       versionCode 1
       versionName "1.0.0"
       // ...
   }
   ```
5. Set **minSdkVersion** (minimum Android version):
   ```gradle
   minSdkVersion 21  // Android 5.0 (Lollipop)
   ```

#### 2. Generate Signed App Bundle

1. In Android Studio, go to **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle** (required for Play Store)
3. Create a new keystore (if you don't have one):
   - **Key store path**: Choose a secure location
   - **Password**: Create a strong password (save it securely!)
   - **Key alias**: e.g., `calculate-m8-key`
   - **Key password**: Create a strong password
   - **Validity**: 25 years (recommended)
   - **Certificate information**: Fill in your details
4. Click **OK** to create the bundle
5. **IMPORTANT**: Save the keystore file and passwords securely - you'll need them for all future updates!

#### 3. Set Up Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in app details:
   - **App name**: Calculate M8
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
   - **Declarations**: Accept terms

#### 4. Complete Store Listing

1. **App access**: 
   - All functionality available without restrictions
   - Or specify if certain features require login

2. **Ads**: 
   - Indicate if your app contains ads (Calculate M8 doesn't)

3. **Content rating**: 
   - Complete the questionnaire
   - Usually results in "Everyone" rating for a calculator

4. **Target audience**: 
   - Age groups your app targets

5. **Data safety**: 
   - Declare what data you collect
   - Since we use Supabase:
     - User account data (email)
     - Computation history
   - Privacy Policy URL is required

6. **Store listing**:
   - **App name**: Calculate M8
   - **Short description**: Up to 80 characters
   - **Full description**: Up to 4000 characters
   - **App icon**: 512×512 px (high-res icon)
   - **Feature graphic**: 1024×500 px (banner)
   - **Screenshots**: 
     - Phone: At least 2, up to 8
     - Tablet: (if supporting tablets)
     - TV: (if supporting Android TV)
   - **Category**: Utilities or Productivity
   - **Contact details**: Email and website

#### 5. Set Up App Content

1. **Privacy Policy**: 
   - URL is required (can be a GitHub page or website)
   - Must disclose data collection practices

2. **App content**: 
   - Answer questions about content
   - For a calculator, usually straightforward

#### 6. Create Release

1. Go to **Production** (or **Testing** for beta)
2. Click **Create new release**
3. Upload your **Android App Bundle** (.aab file)
4. Add **Release notes**: What's new in this version
5. Review and **Save**
6. Click **Review release**

#### 7. Submit for Review

1. Complete all required sections (marked with red warnings)
2. Once all sections are complete, click **Start rollout to Production**
3. Review and confirm
4. Your app will be submitted for review

#### 8. Review Process

- **Timeline**: Usually 1-3 days for new apps
- **Status**: Check in Play Console
- **Common Issues**:
   - Missing privacy policy
   - App crashes on launch
   - Missing required permissions explanation
   - Content rating issues

---

## Pre-Deployment Checklist

### Code & Build

- [ ] Build passes without errors
- [ ] App tested on physical devices (iOS and Android)
- [ ] All features work correctly
- [ ] No console errors or warnings
- [ ] Environment variables configured correctly
- [ ] Supabase connection working
- [ ] Authentication flow tested
- [ ] Calculator functionality tested

### Assets

- [ ] App icon (1024×1024 for iOS, 512×512 for Android)
- [ ] Launch screen configured
- [ ] Screenshots prepared for all required device sizes
- [ ] Feature graphic (Android): 1024×500 px
- [ ] Privacy Policy URL ready

### Configuration

- [ ] Bundle ID/Application ID matches App Store Connect/Play Console
- [ ] Version numbers set correctly
- [ ] App name matches in all places
- [ ] Signing certificates configured
- [ ] Keystore file backed up securely (Android)

### Metadata

- [ ] App description written
- [ ] Keywords selected
- [ ] Category chosen
- [ ] Support URL provided
- [ ] Privacy Policy URL provided
- [ ] Age rating completed
- [ ] Data safety information completed

### Testing

- [ ] TestFlight (iOS) or Internal Testing (Android) completed
- [ ] Beta testers have tested the app
- [ ] No critical bugs reported
- [ ] Performance is acceptable

---

## Post-Deployment

### After Approval

1. **Monitor Reviews**: Respond to user reviews
2. **Track Analytics**: Use App Store Connect and Play Console analytics
3. **Update Regularly**: Fix bugs and add features
4. **Maintain Privacy Policy**: Keep it updated with any changes

### Updating Your App

**iOS**:
1. Update version/build numbers
2. Build and archive in Xcode
3. Upload new build to App Store Connect
4. Update "What's New" section
5. Submit for review

**Android**:
1. Update versionCode and versionName
2. Generate new signed bundle
3. Upload to Play Console
4. Add release notes
5. Submit for review

---

## Additional Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## Notes

- **Privacy Policy**: Required for both stores if you collect any user data. Since Calculate M8 uses Supabase authentication and stores computation history, a privacy policy is mandatory.

- **Testing**: Use TestFlight (iOS) and Internal Testing (Android) to test before public release.

- **Updates**: Both stores require review for updates, though updates are usually faster than initial submissions.

- **Rejections**: Don't be discouraged by rejections. Address the feedback and resubmit. Most apps go through at least one revision.
