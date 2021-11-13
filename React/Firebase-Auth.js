import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
  } from "firebase/auth";
  import React, { useContext, useEffect, useState } from "react";
  import "../firebase";
  
  //context api creation
  const AuthContext = React.createContext();
  
  //use context api with function
  export function useAuth() {
    return useContext(AuthContext);
  }
  
  //authProvider to wrap all components
  export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState();
  
    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
  
      return unsubscribe;
    }, []);
  
    // signup function
    async function signup(email, password, username) {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
  
      // update profile
      await updateProfile(auth.currentUser, {
        displayName: username,
      });
  
      const user = auth.currentUser;
      setCurrentUser({
        ...user,
      });
    }
  
    // login function
    function login(email, password) {
      const auth = getAuth();
      return signInWithEmailAndPassword(auth, email, password);
    }
  
    // logout function
    function logout() {
      const auth = getAuth();
      return signOut(auth);
    }
  
    const value = {
      currentUser,
      signup,
      login,
      logout,
    };
  
    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  }

  //usages of firebase authentication with useAuth function
        <Router>

          <AuthProvider>
            <Layout>
              <Switch>

              <Route exact path="/" component={Home} />
              <PublicRoute exact path="/signup" component={SignUp} />
              <PublicRoute exact path="/login" component={LoginPage} />
              <PrivateRoute exact path="/quiz" component={Quiz} />
              <PrivateRoute exact path="/result" component={Result} />

              </Switch>
            </Layout>
          </AuthProvider>

        </Router>

// use in signup component
import React, { useState } from 'react';
import Form from './Form';
import styles from '../styles/SignUp.module.css';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import Button from './Button';
import { Link, useHistory } from 'react-router-dom';

import {useAuth} from '../context/AuthContext'; // use

const SignupForm = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agree, setAgree] = useState("");

    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    const history = useHistory();

    const {signup} = useAuth();

    async function handleSubmit (e) {
        e.preventDefault();

        if(password !== confirmPassword) {
            return setError("password don't match")
        }

        try {
            setError("");
            setLoading(true);
            await signup(email, password, userName);
            history.push("/");
        } catch (err) {
            console.log(err);
            setLoading(false);
            setError("failed to create an account")
        }
    }

    return (
        <Form className={`${styles.signup}`} onSubmit={handleSubmit}>

        <TextInput
        type="text" 
        placeholder="Enter name" 
        icon="person"
        required
        value={userName} onChange={(e) => setUserName(e.target.value)}
        > 
        </TextInput>

        <TextInput 
        type="text" 
        placeholder="Enter email" 
        icon="alternate_email"
        required
        value={email} onChange={(e) => setEmail(e.target.value)}
        > 
        </TextInput>

        <TextInput 
        type="password" 
        placeholder="Enter password" 
        icon="lock"
        required
        value={password} onChange={(e) => setPassword(e.target.value)}
        > 
        </TextInput>

        <TextInput 
        type="password" 
        placeholder="Confirm password" 
        icon="lock_clock"
        required
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
        > 
        </TextInput>

        <Checkbox 
        text=" I agree to the Terms &amp; Conditions"
        required
        value={agree} onChange={(e) => setAgree(e.target.value)}
        >
        </Checkbox>

        <Button disabled={loading} type="submit">
        <span> Submit Now </span>
        </Button>

        {error && <p className="error"> {error} </p>}

        <div className="info">
        Already have an account? 
        <Link to={'/login'}>Login </Link>
        instead.
        </div>

        </Form>
    );
};

export default SignupForm;

//use in login component
import React from 'react';
import Form from './Form';
import Button from './Button';
import TextInput from './TextInput';
import styles  from '../styles/LoginPage.module.css';

import { Link, useHistory } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import { useState } from 'react';

const LoginForm = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    const history = useHistory();

    const {login} = useAuth();


    async function handleSubmit (e) {
        e.preventDefault();
        try {
            setError("");
            setLoading(true);
            await login(email, password);
            history.push("/");
        } catch (err) {
            console.log(err);
            setLoading(false);
            setError("failed to login")
        }
    }


    return (
        <Form className={`${styles.login}`} onSubmit={handleSubmit}>
          <TextInput
            type="text"
            placeholder="Enter email"
            icon="alternate_email"
            required
            value={email} onChange={(e) => setEmail(e.target.value)}
          />

          <TextInput 
          type="password" 
          placeholder="Enter password" 
          icon="lock" 
          required
          value={password} onChange={(e) => setPassword(e.target.value)}
          />

          <Button disabled={loading} type="submit">
            <span> Submit Now </span>
          </Button>

          {error && <p className="error"> {error} </p>}

          <div className="info">
            Don't have an account? 
            <Link to={'/signup'}>Signup </Link>
            instead.
          </div>
        </Form>
    );
};

export default LoginForm;

// use in private route
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';


const PrivateRoute = ({component: Component, ...rest}) => {
    const {currentUser} = useAuth();

    return currentUser ? (
        <Route {...rest}>{(props) => <Component {...props} />}</Route>
    ) : (
        <Redirect to="/login" />
    );
};

export default PrivateRoute;

//use in public route
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';


const PublicRoute = ({component: Component, ...rest}) => {
    const {currentUser} = useAuth();

    return !currentUser ? (
        <Route {...rest}>{(props) => <Component {...props} />}</Route>
    ) : (
        <Redirect to="/" />
    );
};

export default PublicRoute;


