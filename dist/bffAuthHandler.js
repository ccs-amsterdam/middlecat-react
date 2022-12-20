"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cookies_1 = __importDefault(require("cookies"));
/**
 * If useMiddlecat is used on a client that has a samesite backend, the backend
 * can be used to secure the refresh token. This handler should then be
 * put at an endpoint (like api/bffAuth), and in useMiddlecat the settings
 * bff should be set to this endpoint (e.g., bff = '/api/bffAuth')
 *
 * To secure the refresh_token, this handler intercepts the
 * authorization_code and refresh_token grant flows. The refresh
 * token is then not returned directly to the client application, but
 * instead stored in a httponly samesite cookie.
 * @param req
 * @param res
 * @returns
 */
function bffAuthHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var cookies, resource64, refreshCookie, tokens_res, tokens, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cookies = new cookies_1.default(req, res);
                    resource64 = Buffer.from(req.body.resource).toString("base64");
                    refreshCookie = "refresh_" + resource64;
                    // if bff auth is used, request will not contain the refresh_token,
                    // but the token is instead stored in a httponly samesite cookie
                    if (req.body.grant_type === "refresh_token")
                        req.body.refresh_token = cookies.get(refreshCookie);
                    return [4 /*yield*/, fetch(req.body.middlecat_url, {
                            method: "POST",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(req.body),
                        })];
                case 1:
                    tokens_res = _a.sent();
                    return [4 /*yield*/, tokens_res.json()];
                case 2:
                    tokens = _a.sent();
                    cookies.set(refreshCookie, tokens.refresh_token, {
                        secure: process.env.NODE_ENV !== "development",
                        httpOnly: true,
                        sameSite: "strict",
                        maxAge: 60 * 60 * 24 * 30 * 1000, //    30 days
                    });
                    // remove refresh_token from response, so that it is not returned to the client
                    tokens.refresh_token = null;
                    return [2 /*return*/, res.status(200).json(tokens)];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [2 /*return*/, res.status(500).json({ error: "Could not fetch token" })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.default = bffAuthHandler;
