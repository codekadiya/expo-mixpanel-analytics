import {Platform, Dimensions} from 'react-native';
import {Constants} from 'expo';
import {Buffer} from 'buffer';

const {width, height} = Dimensions.get('window');

const MIXPANEL_API_URL = 'http://api.mixpanel.com';

export default class ExpoMixpanelAnalytics {
  constructor(token) {
    this.ready = false;
    this.queue = [];

    this.token = token;
    this.userId = null;
    this.clientId = Constants.deviceId;
    this.identify(this.clientId);

    Constants.getWebViewUserAgentAsync()
      .then(userAgent => {
        this.userAgent = userAgent;
        this.appName = Constants.manifest.name;
        this.appId = Constants.manifest.slug;
        this.appVersion = Constants.manifest.version;
        this.screenSize = `${width}x${height}`;
        this.deviceName = Contants.deviceName;
        this.platform = Contants.platform.ios.platform;
        this.model = Contants.platform.ios.model;
        this.osVersion = Contants.platform.ios.systemVersion;

        this.ready = true;
        this._flush();
      });
  }

  track(name, props) {
    this.queue.push({
      name,
      props
    });
    this._flush();
  }

  identify(userId) {
    this.userId = userId;
  }

  people_set(props) {
    this._people('set', props);
  }

  people_set_once(props) {
    this._people('set_once', props);
  }

  people_unset(props) {
    this._people('unset', props);
  }

  people_increment(props) {
    this._people('add', props);
  }

  people_append(props) {
    this._people('append', props);
  }

  people_union(props) {
    this._people('union', props);
  }

  people_delete_user() {
    this._people('delete', '');
  }

  // ===========================================================================================

  _flush() {
    if (this.ready) {
      while (this.queue.length) {
        const event = this.queue.pop();
        this._pushEvent(event)
          .then(() => event.sent = true);
      }
    }
  }

  _people(operation, props) {
    if (this.userId) {
      const data = {
        "$token": this.token,
        "$distinct_id": this.userId
      };
      data[`$${operation}`] = props;

      this._pushProfile(data);
    }
  }

  _pushEvent(event) {
    let data = {
      event: event.name,
      properties: event.props
    };
    if (this.userId) {
      data.properties.distinct_id = this.userId;
    }
    data.properties.token = this.token;
    data.properties.user_agent = this.userAgent;
    data.properties.app_name = this.appName;
    data.properties.app_id = this.appId;
    data.properties.app_version = this.appVersion;
    data.properties.screen_size = this.screenSize;
    data.properties.client_id = this.clientId;
    data.properties.device_name = this.deviceName;
    if (this.platform) {
      data.properties.platform = this.platform;
    }
    if (this.model) {
      data.properties.model = this.model;
    }
    if (this.osVersion) {
      data.properties.osVersion = this.osVersion;
    }

    data = new Buffer(JSON.stringify(data)).toString('base64');

    return fetch(`${MIXPANEL_API_URL}/track/?data=${data}`);
  }

  _pushProfile(data) {
    data = new Buffer(JSON.stringify(data)).toString('base64');
    return fetch(`${MIXPANEL_API_URL}/engage/?data=${data}`);
  }
}