Expo Mixpanel Analytics
=========

Mixpanel integration for use with React Native apps built on Expo.

## Installation

```
npm install https://github.com/codekadiya/expo-mixpanel-analytics.git --save
```

## Usage

Your React Native app's screen resolution, app name, app ID, app version and multiple other parameters will be automatically resolved and sent with each event.
```
import Analytics from 'expo-mixpanel-analytics';
```

##### Events
```
const analytics = new Analytics([token|String]);

analytics.addEvent([event|String], [properties|Object]);
// analytics.addEvent('Signed Up', { 'Referred By': 'Friend' });
```

##### Profiles
```
const analytics = new Analytics([token|String]);

analytics.addProfile([userId|String], [firstName|String], [lastName|String], [email|String], [phone|String]);
// analytics.addProfile(1, 'John', 'Doe', 'john@doe.com', '1234567890');

analytics.updateProfile([userId|String], [op|String], [properties|Object]);
// analytics.updateProfile(1, 'add', { 'Number of Logins': 1 });
```