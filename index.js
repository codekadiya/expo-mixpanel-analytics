import {Platform, Dimensions} from 'react-native';
import {Constants} from 'expo';
import {Buffer} from 'buffer';

const {width, height} = Dimensions.get('window');

export default class Analytics {
  constructor(token) {
    this.ready = false;
    this.queue = [];

    this.token = token;
    this.clientId = Constants.deviceId;

    Constants.getWebViewUserAgentAsync()
      .then(userAgent => {
        this.userAgent = userAgent;
        this.appName = Constants.manifest.name;
        this.appId = Constants.manifest.slug;
        this.appVersion = Constants.manifest.version;
        this.screenSize = `${width}x${height}`;

        this.ready = true;
        this.flush();
      });
  }

  addEvent(name, props, userId) {
    this.queue.push({
      name,
      props,
      userId
    });
    this.flush();
  }

  flush() {
    if (this.ready) {
      while (this.queue.length) {
        const event = this.queue.pop();
        this._sendEvent(event)
          .then(() => event.sent = true);
      }
    }
  }

  _sendEvent(event) {
    let data = {
      event: event.name,
      properties: event.props
    };
    data.properties.distinct_id = event.userId ? event.userId : this.clientId;
    data.properties.token = this.token;
    data.properties.user_agent = this.userAgent;
    data.properties.app_name = this.appName;
    data.properties.app_id = this.appId;
    data.properties.app_version = this.appVersion;
    data.properties.screen_size = this.screenSize;

    data = new Buffer(JSON.stringify(data)).toString('base64');

    const url = `http://api.mixpanel.com/track/?data=${data}`;

    return fetch(url, {
      method: 'get',
      headers: {
        'User-Agent': this.userAgent
      }
    });
  }

  addProfile(userId, firstName, lastName, email, phone) {
    const data = {
      "$token": this.token,
      "$distinct_id": userId,
      "$set": {
        "$first_name": firstName,
        "$last_name": lastName,
        "$email": email,
        "$phone": phone
      }
    };

    this._sendProfile(data);
  }

  updateProfile(userId, op, props) {
    const data = {
      "$token": this.token,
      "$distinct_id": userId,
    };
    data[`$${op}`] = props;

    this._sendProfile(data);
  }

  _sendProfile(data) {

    data = new Buffer(JSON.stringify(data)).toString('base64');

    const url = `http://api.mixpanel.com/engage/?data=${data}`;

    return fetch(url, {
      method: 'get',
      headers: {
        'User-Agent': this.userAgent
      }
    });
  }

}