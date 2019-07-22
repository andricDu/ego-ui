import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import { compose } from 'recompose';
import { injectState } from 'freactal';
import jwtDecode from 'jwt-decode';

import colors from 'common/colors';
import { googleLogin, facebookLogin } from 'services/login';
import FacebookLogin from 'components/LoginButtons/FacebookLogin';
import GoogleLogin from 'components/LoginButtons/GoogleLogin';
import OktaWidget from 'components/LoginButtons/OktaWidget';
import RedirectLogin from 'components/LoginButtons/RedirectLogin';
import { allRedirectUris } from 'common/injectGlobals';
import ajax from 'services/ajax';

import Aux from 'components/Aux';

const styles = {
  container: {
    backgroundColor: colors.teal,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  logo: {
    marginLeft: 0,
    width: '10%',
  },
  loginIcon: {
    width: 20,
  },
  title: {
    fontWeight: 400,
  },
};

const enhance = compose(injectState);

const oktaLogin = token =>
  ajax.get(`/oauth/okta/token`, {
    headers: { token },
  });

class Component extends React.Component<any, any> {
  static propTypes = {
    effects: PropTypes.object,
    state: PropTypes.object,
  };
  onFacebookLogin = response => {
    this.handleFacebookToken(response.authResponse.accessToken);
  };
  onGoogleLogin = async token => {
    const response = await googleLogin(token);
    this.handleLoginResponse(response);
  };
  onOktaLogin = async token => {
    const response = await oktaLogin(token);
    this.handleLoginResponse(response);
  };
  handleFacebookToken = async token => {
    const response = await facebookLogin(token);
    this.handleLoginResponse(response);
  };
  handleLoginResponse = async response => {
    if (response.status === 200) {
      const jwt = response.data;
      await this.handleJWT(jwt);
    } else {
      console.warn('response error');
    }
  };
  handleJWT = async jwt => {
    const props = this.props as any;
    const jwtData = jwtDecode(jwt);
    const user = {
      ...jwtData.context.user,
      id: jwtData.sub,
    };
    await props.effects.setUser(user);
    await props.effects.setToken(jwt);

    if (user.roles.includes('ADMIN')) {
      if (props.location.pathname === '/') {
        props.history.push('/users');
      }
    } else {
      props.history.push('/no-access');
    }
  };

  render() {
    const { shouldNotRedirect } = this.props;
    const renderSocialLoginButtons =
      shouldNotRedirect || allRedirectUris.includes(window.location.origin);

    return (
      <div className={`Login ${css(styles.container)}`}>
        <img src={require('assets/brand-image.svg')} alt="" className={`${css(styles.logo)}`} />
        <h1 className={`${css(styles.title)}`}>Admin Portal</h1>
        {renderSocialLoginButtons ? (
          <Aux>
            <GoogleLogin onLogin={this.onGoogleLogin} />
            <FacebookLogin onLogin={this.onFacebookLogin} />
            <OktaWidget onLogin={this.onOktaLogin} />
          </Aux>
        ) : (
          <RedirectLogin onLogin={({ token }) => this.handleJWT(token)} />
        )}
      </div>
    );
  }
}

export default enhance(Component);
