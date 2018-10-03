import React from 'react';

const Logout = (props) => {
  return(
    <button id="logout-button" onClick={props.onLogout}>Ausloggen</button>
  );
}

export default Logout;
