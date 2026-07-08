Changes in [1.13.0](https://github.com/agrino-project/web/releases/tag/v1.13.0) (2026-05-16)
================================================================================================

## ✨ Features

* Redesign the login page with a cleaner and more modern interface.
* Redesign the chat filter section and improve navigation experience.
* Add Persian date support across the application.
* Refresh reply message styling for improved readability and consistency.
* Improve user management section and related UI components.

## 🚀 Improvements

* Reduce unnecessary Vector requests during the login flow.
* Improve bot response handling and interaction button behavior.
* Improve overall chat timeline and message rendering experience.
* Align user messages to the right side and bot messages to the left side.
* Remove duplicated sender names and avatars from consecutive messages.

## 🐛 Bug Fixes

* Remove the “Unencrypted messages” warning banner from chat rooms.
* Fix multiple UI inconsistencies in bot interaction components.
* Fix several chat layout and message styling issues.

Changes in [1.14.0](https://github.com/agrino-project/web/releases/tag/v1.14.0) (2026-05-21)
================================================================================================

## ✨ Features

* Display user name and avatar in chat based on the new Figma design.
* Replace the profile side panel with a modal in the chat page.
* Add Figma icons and images to the Home, Services, right panel, and mobile views.

## 🚀 Improvements

* Remove unnecessary top spacing above the chat area.
* Improve user search behavior and automatically include required entries.
* Improve display and resolve overlap with the message "seen" timestamp in chat.
* Change the favicon to Agrino.
* Support login with a Persian keyboard layout.
* Align the profile section in the panel menu.
* Update the filter arrow to a new size.
* Fix several naming issues.

## 🐛 Bug Fixes

* Fix date input bug in chat.

# Changes in [1.15.0](https://github.com/agrino-project/web/releases/tag/v1.15.0) (2026-06-5)

## ✨ Features

* Remove Device Verification during login.
* Update Marketplace and Banking Services layout based on the new design.
* Redesign the Homepage with new business and smart agriculture consultation sections.
* Add new images for Articles and News sections.
* Redesign the chat start page.
* Update chat header according to the latest Figma design.
* Add alphabetical (A-Z) sorting option in the Social section menu.
* Synchronize major business modules with the latest Figma designs.
* Synchronize chat interface with the latest Figma designs.

## 🚀 Improvements

* Update sidebar structure and navigation experience.
* Simplify Settings by keeping only the Account section.
* Remove password change functionality.
* Remove email and personal information sections.
* Support four-digit CVV2 values in banking services.
* Add validation for card expiry month and year fields.
* Improve Banking Services modal behavior after closing dialogs.
* Update organization interaction and discussion forum buttons.
* Refresh support section design and content.
* Update business dashboard and related components based on Figma.
* Move user search identifier formatting from frontend to backend API.
* Automatically append required user domain information during user search on the server side.
* Improve chat header actions and interactions.

## 🐛 Bug Fixes

* Fix navigation issue where closing Banking Services redirects users to the Social section.
* Remove "Recommended for You" section.
* Remove dropdown data display from major business categories.
* Fix incorrect Persian translation of "Forward" and replace it with "بازنشر".
* Remove Share and View Source actions where no longer required.
* Fix multiple UI inconsistencies across homepage, chat, and business sections.
* Remove Thread functionality from Social chats.
* Remove Thread-related actions from hover menus.
* Remove Dark Mode support and related UI inconsistencies.
* Fix several design mismatches between implementation and Figma.

# Changes in [1.16.0](https://github.com/agrino-project/web/releases/tag/v1.16.0) (2026-06-8)

## ✨ Features

* Add card expiry date and CVV2 validation to Top-up Purchase and Bill Payment pages and implement the related validation logic.
* Add successful payment pages for Top-up Purchase, Bill Payment, and Card-to-Card Transfer flows and implement the related payment logic.
* Restore user verification during the login process.
* Add a back-to-top button to the Major Business form page in mobile view, allowing users to quickly return to the business selection page.
* Redesign chat date separators (e.g. "Thursday, 23 Tir") and system notifications (e.g. "This number joined the chat") according to the latest Figma design.

## 🚀 Improvements

* Complete the removal of password change functionality.
* Complete the removal of email and personal information sections.
* Improve payment flow validation and handling across banking services.
* Update chat system messages and timeline presentation according to Figma specifications.
* Remove expand and collapse actions from chat system notifications.

## 🐛 Bug Fixes

* Fix user list menu shrinking when resizing the browser from mobile view to desktop view.
* Fix issue causing navigation from the Home page to Chat and opening an empty dialog when resizing the browser from mobile view to desktop view.
* Fix issue causing navigation from Chat to Home when resizing the browser from desktop view to mobile view.
* Fix issue preventing chats from reopening after leaving them in mobile view.
* Fix issue preventing the Major Business form page from opening in mobile view.
* Fix responsive layout issues related to mobile and desktop viewport transitions.

# Changes in [1.17.0](https://github.com/agrino-project/web/releases/tag/v1.17.0) (2026-06-15)

## ✨ Features

* Add a dedicated Major Business tab to replace the previous Chat Filter section.
* Integrate required APIs for Major Business services and implement dynamic form generation based on backend configuration.
* Restore Dark Mode support and add theme switching functionality.
* Add a theme toggle option to the mobile profile menu.
* Add a navigation link to the Training button on the Home page.

## 🚀 Improvements

* Synchronize and align profile menu behavior across mobile and desktop views.
* Improve the display of user information, including avatar, identifier, and phone number, across different screen sizes.
* Improve profile section positioning and alignment with right panel navigation items across browsers.
* Enhance Major Business navigation flow and state management when switching between application tabs.

## 🐛 Bug Fixes

* Fix profile alignment inconsistencies with right panel tab icons in certain browsers.
* Fix issue causing users to remain on the Major Business form page after navigating to other sections.
* Fix z-index issue causing the Settings dialog to appear behind the Profile dialog.
* Fix multiple Dark Mode related styling and visual inconsistencies.

# Changes in [1.18.0](https://github.com/agrino-project/web/releases/tag/v1.18.0) (2026-06-18)

## ✨ Features

* Add command support for bots.
* Add message pinning and categorized sections in the Farmer Marketplace.
* Add payment capability during product search in the Farmer Marketplace.
* Make the Major Business page dynamic to support backend-configurable icons.
* Add quick access shortcuts for Training and Bot entry.
* Add HTML message rendering support for News content.

## 🚀 Improvements

* Improve logout flow by fully clearing application state after logout and page reload.
* Improve chat search experience by opening the Profile dialog and automatically focusing the search input from the chat header.

## 🐛 Bug Fixes

* No bug fixes in this release.

# Changes in [1.19.0](https://github.com/agrino-project/web/releases/tag/v1.19.0) (2026-06-30)

## ✨ Features

* Add full mobile device support and remove the unsupported device restriction.
* Add Home navigation entry to the desktop user menu.
* Add permanent Agrino page title that remains visible after page refresh.

## 🚀 Improvements

* Increase the font size of Homepage sections, including Marketplace, Banking Services, and related items on desktop.
* Increase the font size of chat rooms and conversation lists on desktop for improved readability.
* Update the Chat Welcome page to fully support Light and Dark themes.
* Simplify the user menu by removing unnecessary Settings entries and moving the Sessions section back into Settings.
* Improve the Home button behavior in the mobile user menu.
* Redesign the Settings dialog with updated styling, improve its mobile responsiveness, and remove horizontal scrolling.
* Update bot command controls to send **"شروع"** and **"توقف"** commands instead of **"s"** and **"q"**.
* Rename the user verification password field label from **"Password"** to **"Verification Code"** (رمز ارسالی).

## 🐛 Bug Fixes

* Fix mobile compatibility issues that incorrectly displayed the application as unsupported.
* Fix Dark Mode styling inconsistencies on the Chat Welcome page.
* Fix page title behavior to ensure **Agrino** is displayed consistently after page refresh.

# Changes in [1.20.0](https://github.com/agrino-project/web/releases/tag/v1.20.0) (2026-07-08)

## ✨ Features

* Introduce the **Bazaar** (بازارگاه) marketplace page with full navigation support on desktop and mobile.
* Add Bazaar entry points in the Space Panel, Mobile Bottom Navigation, and Agriculture page quick access.
* Integrate Bazaar backend APIs for categories, subcategories, dynamic form questions, ad listings, ad submission, and purchase flow.
* Add ad management capabilities: create, edit, and delete ads with an inline edit panel for title, price, amount, province, and city.
* Add ad purchase flow with order confirmation, payment step, and success state including order code display.
* Add **My Ads** and **My Purchases** history tabs for tracking submitted and purchased listings.
* Add ad listing actions: view details, call seller, and copy phone number.
* Add advanced ad filtering by location, province, city, price range, and active-only status.
* Add price sorting options (ascending and descending).
* Add session caching for Bazaar API responses to reduce redundant network requests.
* Add in-memory caching for Great Shops API calls to improve load performance.
* Add new background images for Agriculture page cards (Great Shops and Agriculture Consultant).
* Add a new chat room background image for a more engaging conversation view.
* Add full English and Persian translations for Bazaar-related labels, errors, and status messages.

## 🚀 Improvements

* Improve authentication page responsiveness on mobile, including Setup Encryption, Auth Page, and Complete Security screens.
* Improve message timestamp font size on mobile for better readability.
* Dynamically resolve the Bazaar API base URL from the user's homeserver (`/_synapse/client/bots`) instead of using a hardcoded endpoint.
* Refine BazaarPage layout, spacing, heading margins, and purchase list rendering.
* Implement full Dark Mode support for BazaarPage using Agrino theme variables, consistent with other custom pages.
* Improve selected submenu item text contrast in Bazaar dark theme for better readability.
* Update SpacePanel and MobileBottomNav styling for Bazaar button integration.
* Refine AgriculturePage card gradient overlays and box-shadow styles.
