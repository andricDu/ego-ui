import React from 'react';
import { css } from 'glamor';

import OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';
import '@okta/okta-signin-widget/dist/css/okta-theme.css';

import { oktaId, oktaUrl } from 'common/injectGlobals';

const styles = {
  oktaDiv: {
    marginTop: '-50px',
  },
};

export default class extends React.Component<any, any> {
  componentDidMount() {
    var signIn = new OktaSignIn({
      baseUrl: oktaUrl,
      clientId: oktaId,
      authParams: {
        issuer: 'default',
        responseType: ['id_token'],
        display: 'page',
      },
    });

    var _self = this; //TODO: Fix This

    if (!signIn.token.hasTokensInUrl()) {
      signIn.renderEl({ el: '#okta-container' });
    } else {
      signIn.token.parseTokensFromUrl(
        function success(res) {
          console.log(res);
          _self.props.onLogin(res[0].idToken);
        },
        function error(err) {
          console.log(err);
          console.log('Something went wrong with Okta login.');
        },
      );
    }
  }
  render() {
    return <div className={`${css(styles.oktaDiv)}`} id="okta-container" />;
  }
}
