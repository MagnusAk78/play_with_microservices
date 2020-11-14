// The identity projection is used to load an identity by running all events through it,
// if it finds a 'Registered' type event it sets the isRegistered flag.
const identityProjection = {
  $init() {
    return {
      userId: null,
      username: null,
      isRegistered: false,
    };
  },
  Registered(identity, registered) {
    identity.userId = registered.data.userId;
    identity.username = registered.data.username;
    identity.isRegistered = true;

    return identity;
  },
};

module.exports = identityProjection;
