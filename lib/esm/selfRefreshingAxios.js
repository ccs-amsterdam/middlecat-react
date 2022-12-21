var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import axios from "axios";
import jwtDecode from "jwt-decode";
import { refreshToken } from "./middlecatOauth";
/**
 * Creates an axios instance for making api requests to the AmCAT server.
 * The tokens are stored in the closure, and are automatically refreshed
 * when a request is made and the access token is about to expire.
 *
 * @param middlecat
 * @param resource
 * @param access_token
 * @param refresh_token
 * @returns
 */
export default function selfRefreshingAxios(resource, access_token, refresh_token, storeToken, bff, setUser) {
    var _this = this;
    var api = axios.create();
    // use in intercepter as closure
    var currentAccessToken = access_token;
    var currentRefreshToken = refresh_token;
    if (storeToken)
        localStorage.setItem("".concat(resource, "_refresh"), currentRefreshToken);
    api.interceptors.request.use(function (config) { return __awaiter(_this, void 0, void 0, function () {
        var _a, access_token, refresh_token;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getTokens(currentAccessToken, currentRefreshToken, resource, bff)];
                case 1:
                    _a = _b.sent(), access_token = _a.access_token, refresh_token = _a.refresh_token;
                    currentAccessToken = access_token;
                    currentRefreshToken = refresh_token;
                    if (storeToken && !bff)
                        localStorage.setItem("".concat(resource, "_refresh"), currentRefreshToken);
                    if (!currentAccessToken) {
                        setUser(undefined);
                        throw new Error("Could not refresh token");
                    }
                    // ensure that resource is the base url, so that its not easy to
                    // to send a request with the tokens somewhere else
                    config.baseURL = resource;
                    config.headers = {
                        Authorization: "Bearer ".concat(currentAccessToken),
                    };
                    return [2 /*return*/, config];
            }
        });
    }); }, function (error) {
        Promise.reject(error);
    });
    return api;
}
/**
 * Checks if access token is about to expire. If so, we first refresh the tokens.
 */
function getTokens(access_token, refresh_token, resource, bff) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, now, nearfuture;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = jwtDecode(access_token);
                    now = Date.now() / 1000;
                    nearfuture = now + 10;
                    if (!(payload.exp < nearfuture)) return [3 /*break*/, 2];
                    return [4 /*yield*/, refreshToken(payload.middlecat, refresh_token, resource, bff)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, { access_token: access_token, refresh_token: refresh_token }];
            }
        });
    });
}
