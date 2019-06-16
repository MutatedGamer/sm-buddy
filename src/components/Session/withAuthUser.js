
import React from 'react';
import AuthUserContext from './context';

const withAuthUser = Component => {
  return (props) => (
    <AuthUserContext.Consumer>
      {state => <Component {... props} context={state} />}
    </AuthUserContext.Consumer>
  )
};

export default withAuthUser;
