"use strict";
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
        while (_) try {
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
exports.__esModule = true;
exports.POST = exports.GET = exports.OPTIONS = void 0;
var server_1 = require("next/server");
var IC_API_URL = 'http://127.0.0.1:4943';
var ALLOWED_ORIGINS = ['http://127.0.0.1:4943', 'http://localhost:3000'];
// Common CORS headers
var corsHeaders = function (origin) {
    var headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-Ic-Api-Version',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'production') {
        headers['Access-Control-Allow-Origin'] = origin || '*';
        return headers;
    }
    // In production, only allow whitelisted origins
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }
    else if (origin) {
        console.warn("Blocked request from unauthorized origin: " + origin);
    }
    return headers;
};
// Handle CORS preflight requests
function OPTIONS(request) {
    return __awaiter(this, void 0, void 0, function () {
        var origin, headers;
        return __generator(this, function (_a) {
            origin = request.headers.get('origin');
            headers = corsHeaders(origin);
            // If no origin is allowed, return 403
            if (!headers['Access-Control-Allow-Origin']) {
                return [2 /*return*/, new Response('Not allowed by CORS', { status: 403 })];
            }
            return [2 /*return*/, new Response(null, {
                    status: 204,
                    headers: __assign(__assign({}, headers), { 
                        // Ensure these headers are always set for preflight
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-Ic-Api-Version', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' })
                })];
        });
    });
}
exports.OPTIONS = OPTIONS;
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var origin, urlParam, targetUrl, icHeaders_1, forwardHeaders, response, buffer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    origin = request.headers.get('origin');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    urlParam = request.nextUrl.searchParams.get('url');
                    if (!urlParam) {
                        return [2 /*return*/, new server_1.NextResponse(JSON.stringify({ error: 'URL parameter is required' }), {
                                status: 400,
                                headers: __assign({ 'Content-Type': 'application/json' }, corsHeaders(origin))
                            })];
                    }
                    targetUrl = void 0;
                    try {
                        targetUrl = new URL(urlParam);
                    }
                    catch (e) {
                        // If URL is not absolute, prepend the IC API URL
                        targetUrl = new URL(urlParam, IC_API_URL);
                    }
                    // Ensure the URL is pointing to our IC replica
                    if (!targetUrl.toString().startsWith(IC_API_URL)) {
                        return [2 /*return*/, new server_1.NextResponse(JSON.stringify({
                                error: 'Invalid URL',
                                message: "URL must point to " + IC_API_URL
                            }), {
                                status: 400,
                                headers: __assign({ 'Content-Type': 'application/json' }, corsHeaders(origin))
                            })];
                    }
                    icHeaders_1 = {
                        'Accept': 'application/cbor'
                    };
                    forwardHeaders = [
                        'x-request-id',
                        'x-ic-api-version',
                        'accept',
                    ];
                    forwardHeaders.forEach(function (header) {
                        var value = request.headers.get(header);
                        if (value) {
                            icHeaders_1[header] = value;
                        }
                    });
                    return [4 /*yield*/, fetch(targetUrl.toString(), {
                            method: 'GET',
                            headers: icHeaders_1,
                            credentials: 'omit'
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 3:
                    buffer = _a.sent();
                    // Create a new response with the binary data
                    return [2 /*return*/, new server_1.NextResponse(buffer, {
                            status: response.status,
                            headers: __assign(__assign({ 'Content-Type': response.headers.get('content-type') || 'application/cbor' }, corsHeaders(origin)), { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0', 'Surrogate-Control': 'no-store' })
                        })];
                case 4:
                    error_1 = _a.sent();
                    console.error('Proxy error:', error_1);
                    return [2 /*return*/, new server_1.NextResponse(JSON.stringify({
                            error: 'Failed to process request',
                            details: error_1 instanceof Error ? error_1.message : String(error_1)
                        }), {
                            status: 500,
                            headers: __assign({ 'Content-Type': 'application/json' }, corsHeaders(origin))
                        })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var origin, urlParam, targetUrl, body, icHeaders_2, forwardHeaders, response, buffer, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    origin = request.headers.get('origin');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    urlParam = request.nextUrl.searchParams.get('url');
                    if (!urlParam) {
                        return [2 /*return*/, new server_1.NextResponse(JSON.stringify({ error: 'URL parameter is required' }), {
                                status: 400,
                                headers: __assign({ 'Content-Type': 'application/json' }, corsHeaders(origin))
                            })];
                    }
                    targetUrl = void 0;
                    try {
                        targetUrl = new URL(urlParam);
                    }
                    catch (e) {
                        // If URL is not absolute, prepend the IC API URL
                        targetUrl = new URL(urlParam, IC_API_URL);
                    }
                    // Ensure the URL is pointing to our IC replica
                    if (!targetUrl.toString().startsWith(IC_API_URL)) {
                        return [2 /*return*/, new server_1.NextResponse(JSON.stringify({
                                error: 'Invalid URL',
                                message: "URL must point to " + IC_API_URL
                            }), {
                                status: 400,
                                headers: __assign({ 'Content-Type': 'application/json' }, corsHeaders(origin))
                            })];
                    }
                    return [4 /*yield*/, request.arrayBuffer()];
                case 2:
                    body = _a.sent();
                    icHeaders_2 = {
                        'Content-Type': request.headers.get('content-type') || 'application/cbor',
                        'Accept': 'application/cbor'
                    };
                    forwardHeaders = [
                        'x-request-id',
                        'x-ic-api-version',
                        'content-type',
                        'accept',
                    ];
                    forwardHeaders.forEach(function (header) {
                        var value = request.headers.get(header);
                        if (value) {
                            icHeaders_2[header] = value;
                        }
                    });
                    return [4 /*yield*/, fetch(targetUrl.toString(), {
                            method: 'POST',
                            headers: icHeaders_2,
                            body: body,
                            credentials: 'omit'
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 4:
                    buffer = _a.sent();
                    // Create a new response with the binary data
                    return [2 /*return*/, new server_1.NextResponse(buffer, {
                            status: response.status,
                            headers: __assign(__assign({ 'Content-Type': response.headers.get('content-type') || 'application/cbor' }, corsHeaders(origin)), { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0', 'Surrogate-Control': 'no-store' })
                        })];
                case 5:
                    error_2 = _a.sent();
                    console.error('Proxy error:', error_2);
                    return [2 /*return*/, new server_1.NextResponse(JSON.stringify({
                            error: 'Failed to process request',
                            details: error_2 instanceof Error ? error_2.message : String(error_2)
                        }), {
                            status: 500,
                            headers: __assign({ 'Content-Type': 'application/json' }, corsHeaders(origin))
                        })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
