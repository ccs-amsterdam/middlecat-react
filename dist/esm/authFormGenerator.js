var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useState } from "react";
import styled from "styled-components";
var AuthContainer = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  --primary: ", ";\n  --secondary: ", ";\n  color: var(--secondary);\n  display: flex;\n  text-align: center;\n  flex-direction: column;\n  position: relative;\n  font-size: 1.8em;\n\n  & .InnerContainer {\n    box-sizing: border-box;\n    font-size: 1.2em;\n    margin: auto;\n    width: 100%;\n    max-width: 400px;\n    text-align: center;\n  }\n\n  & .User {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    font-weight: 800;\n  }\n\n  & .Image {\n    height: 45px;\n    width: 45px;\n    border-radius: 50%;\n    margin-right: 1rem;\n    border: 1px solid var(--secondary);\n  }\n  & button {\n    width: 100%;\n    background: white;\n    border: 2px solid var(--primary);\n    font-size: inherit;\n    max-width: 400px;\n    padding: 0.6rem 1.5rem;\n    border-radius: 10px;\n    cursor: pointer;\n    transition: background 0.3s;\n\n    &:hover:enabled {\n      color: white;\n      background: var(--primary);\n    }\n  }\n  & input {\n    margin: 1rem 0rem;\n    width: 100%;\n    border-radius: 5px;\n    height: 40px;\n    padding: 10px 10px 10px 10px;\n    font-size: inherit;\n  }\n  .SignOut {\n    display: flex;\n    flex-direction: column;\n    gap: 0.5rem;\n  }\n\n  & .Loader {\n    margin: auto;\n    border: 10px solid #f3f3f3;\n    border-top: 10px solid #3498db;\n    border-radius: 50%;\n    width: 80px;\n    height: 80px;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"], ["\n  --primary: ", ";\n  --secondary: ", ";\n  color: var(--secondary);\n  display: flex;\n  text-align: center;\n  flex-direction: column;\n  position: relative;\n  font-size: 1.8em;\n\n  & .InnerContainer {\n    box-sizing: border-box;\n    font-size: 1.2em;\n    margin: auto;\n    width: 100%;\n    max-width: 400px;\n    text-align: center;\n  }\n\n  & .User {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    font-weight: 800;\n  }\n\n  & .Image {\n    height: 45px;\n    width: 45px;\n    border-radius: 50%;\n    margin-right: 1rem;\n    border: 1px solid var(--secondary);\n  }\n  & button {\n    width: 100%;\n    background: white;\n    border: 2px solid var(--primary);\n    font-size: inherit;\n    max-width: 400px;\n    padding: 0.6rem 1.5rem;\n    border-radius: 10px;\n    cursor: pointer;\n    transition: background 0.3s;\n\n    &:hover:enabled {\n      color: white;\n      background: var(--primary);\n    }\n  }\n  & input {\n    margin: 1rem 0rem;\n    width: 100%;\n    border-radius: 5px;\n    height: 40px;\n    padding: 10px 10px 10px 10px;\n    font-size: inherit;\n  }\n  .SignOut {\n    display: flex;\n    flex-direction: column;\n    gap: 0.5rem;\n  }\n\n  & .Loader {\n    margin: auto;\n    border: 10px solid #f3f3f3;\n    border-top: 10px solid #3498db;\n    border-radius: 50%;\n    width: 80px;\n    height: 80px;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"])), function (p) { return p.primary || "#38c7b9"; }, function (p) { return p.secondary || "#1d7269"; });
/** Returns an AuthForm component in which the
 * props (fixedResource, user, loading, signIn, signOut)
 * are included via closure. This way,
 * the only props that need to be specified for
 * the auth form are the AuthFormProps
 */
export default function authFormGenerator(_a) {
    var user = _a.user, loading = _a.loading, signIn = _a.signIn, signOut = _a.signOut;
    var AuthForm = function (_a) {
        var primary = _a.primary, secondary = _a.secondary, resourceLabel = _a.resourceLabel, resourceExample = _a.resourceExample, resourceSuggestion = _a.resourceSuggestion, resourceFixed = _a.resourceFixed, signInLabel = _a.signInLabel, signOutLabel = _a.signOutLabel;
        function ConditionalRender() {
            if (loading)
                return _jsx("div", { className: "Loader" });
            if (!user)
                return (_jsx(SignInForm, { signIn: signIn, resourceLabel: resourceLabel, resourceExample: resourceExample, resourceSuggestion: resourceSuggestion, resourceFixed: resourceFixed, signInLabel: signInLabel }));
            return (_jsx(SignOutForm, { user: user, signOut: signOut, signOutLabel: signOutLabel }));
        }
        return (_jsx(AuthContainer, __assign({ primary: primary, secondary: secondary }, { children: _jsx("div", __assign({ className: "InnerContainer" }, { children: _jsx(ConditionalRender, {}) })) })));
    };
    return memo(AuthForm);
}
function SignInForm(_a) {
    var signIn = _a.signIn, resourceLabel = _a.resourceLabel, resourceExample = _a.resourceExample, resourceSuggestion = _a.resourceSuggestion, resourceFixed = _a.resourceFixed, signInLabel = _a.signInLabel;
    var _b = useState(resourceFixed || resourceSuggestion || ""), resourceValue = _b[0], setResourceValue = _b[1];
    function invalidUrl(url) {
        return !/^https?:\/\//.test(url);
    }
    return (_jsxs("form", __assign({ onSubmit: function (e) {
            e.preventDefault();
            signIn(resourceValue);
        } }, { children: [_jsx("label", { children: _jsx("b", { children: resourceLabel || "Connect to server" }) }), resourceFixed ? (_jsx("p", { children: resourceFixed })) : (_jsx("input", { type: "url", id: "url", name: "url", placeholder: resourceExample || "https://amcat-server.example", value: resourceValue, onChange: function (e) { return setResourceValue(e.target.value); } })), _jsx("button", __assign({ disabled: invalidUrl(resourceValue), type: "submit" }, { children: signInLabel || "Sign-in" }))] })));
}
function SignOutForm(_a) {
    var user = _a.user, signOut = _a.signOut, signOutLabel = _a.signOutLabel;
    return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: "User" }, { children: [(user === null || user === void 0 ? void 0 : user.image) ? (_jsx("img", { className: "Image", src: user.image, "referrer-policy": "no-referrer", alt: "" })) : null, _jsxs("div", { children: [(user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.email), (user === null || user === void 0 ? void 0 : user.name) ? (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsx("span", __assign({ style: { fontSize: "0.8em" } }, { children: user === null || user === void 0 ? void 0 : user.email }))] })) : null] })] })), _jsx("br", {}), _jsxs("div", __assign({ className: "SignOut" }, { children: [_jsx("button", __assign({ onClick: function () { return signOut(false); } }, { children: signOutLabel || "Sign-out" })), _jsx("button", __assign({ onClick: function () { return signOut(true); } }, { children: "Sign-out MiddleCat" }))] }))] }));
}
var templateObject_1;
