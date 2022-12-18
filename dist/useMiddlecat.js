"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var util_1 = require("./util");
var middlecatOauth_1 = require("./middlecatOauth");
var createMiddlecatUser_1 = require("./createMiddlecatUser");
var authFormGenerator_1 = __importDefault(require("./authFormGenerator"));
var selfRefreshingAxios_1 = require("./selfRefreshingAxios");
function useMiddlecat(_a) {
    var _b = _a === void 0 ? {} : _a, fixedResource = _b.fixedResource, _c = _b.autoReconnect, autoReconnect = _c === void 0 ? true : _c, _d = _b.storeToken, storeToken = _d === void 0 ? false : _d;
    var _e = (0, react_1.useState)(), user = _e[0], setUser = _e[1];
    var runOnce = (0, react_1.useRef)(true);
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var signIn = (0, react_1.useCallback)(function (resource) {
        // action 1. Redirects to middlecat, which will redirect back with code and state
        // parameters. This triggers the authorizationCode flow.
        setLoading(true);
        var r = (0, util_1.safeURL)(fixedResource || resource || "");
        (0, middlecatOauth_1.authorize)(r)
            .then(function (middlecat_redirect) {
            localStorage.setItem("resource", r);
            localStorage.setItem("awaiting_oauth_redirect", "true");
            window.location.href = middlecat_redirect;
        })
            .catch(function (e) {
            console.error(e);
            setLoading(false);
        });
    }, [fixedResource]);
    var signOut = (0, react_1.useCallback)(function (signOutMiddlecat) {
        if (signOutMiddlecat === void 0) { signOutMiddlecat = false; }
        setLoading(true);
        localStorage.setItem("resource", "");
        if (!user)
            return;
        // currently doesn't tell the user if could not kill
        // session because middlecat can't be reached. Should we?
        user
            .killSession(signOutMiddlecat)
            .catch(function (e) { return console.error(e); })
            .finally(function () {
            setLoading(false);
            setUser(undefined);
        });
    }, [user]);
    (0, react_1.useEffect)(function () {
        // This runs once on mount, and can do two things
        // - if there is a 'resource' in localStorage, and there is a code and state url parameter,
        //   then middlecat just redirected here and we should complete the oauth dance
        // - if this is not the case, but we do have a resource and autoReconnect is set to true,
        //   immediately initiate another oauth dance
        if (!runOnce.current)
            return;
        runOnce.current = false;
        var resource = localStorage.getItem("resource");
        if (!resource) {
            setLoading(false);
            return;
        }
        var searchParams = new URLSearchParams(window.location.search);
        var code = searchParams.get("code");
        var state = searchParams.get("state");
        var inFlow = localStorage.getItem("awaiting_oauth_redirect") === "true";
        localStorage.setItem("awaiting_oauth_redirect", "false");
        (0, util_1.silentDeleteSearchParams)(["code", "state"]);
        // If in oauth flow and code and state parameters are given, complete the oauth flow.
        // (the inFlow shouldn't be needed since we remove the URL parameters, but this somehow
        //  doesn't work when useMiddlecat is imported in nextJS. so this is just to be sure)
        if (inFlow && code && state) {
            connectWithAuthGrant(resource, code, state, storeToken, setUser, setLoading);
            return;
        }
        // If autoReconnect and storeToken are used, reconnect with the stored refresh token
        if (autoReconnect && storeToken) {
            connectWithRefresh(resource, storeToken, setUser, setLoading);
            return;
        }
        // If autoReconnect is used without storeToken, redirect to middlecat
        if (autoReconnect)
            signIn(resource);
    }, [autoReconnect, storeToken, signIn]);
    var AuthForm = (0, react_1.useMemo)(function () {
        return (0, authFormGenerator_1.default)({
            fixedResource: fixedResource || "",
            user: user,
            loading: loading,
            signIn: signIn,
            signOut: signOut,
        });
    }, [fixedResource, user, loading, signIn, signOut]);
    return { user: user, AuthForm: AuthForm, loading: loading, signIn: signIn, signOut: signOut };
}
exports.default = useMiddlecat;
function connectWithAuthGrant(resource, code, state, storeToken, setUser, setLoading) {
    (0, middlecatOauth_1.authorizationCode)(resource, code, state)
        .then(function (_a) {
        var access_token = _a.access_token, refresh_token = _a.refresh_token;
        var user = (0, createMiddlecatUser_1.createMiddlecatUser)(access_token, refresh_token, storeToken, setUser);
        localStorage.setItem("resource", resource);
        setUser(user);
    })
        .catch(function (e) {
        console.error(e);
    })
        .finally(function () {
        setLoading(false);
    });
}
function connectWithRefresh(resource, storeToken, setUser, setLoading) {
    var middlecat = localStorage.getItem(resource + "_middlecat") || "";
    var refresh_token = localStorage.getItem(resource + "_refresh") || "";
    (0, selfRefreshingAxios_1.refreshToken)(middlecat, refresh_token)
        .then(function (_a) {
        var access_token = _a.access_token, refresh_token = _a.refresh_token;
        var user = (0, createMiddlecatUser_1.createMiddlecatUser)(access_token, refresh_token, storeToken, setUser);
        localStorage.setItem("resource", resource);
        setUser(user);
    })
        .catch(function (e) {
        console.error(e);
    })
        .finally(function () {
        setLoading(false);
    });
}
