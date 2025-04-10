"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlCaller = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const APPSYNC_URL = process.env.APPSYNC_URL;
const API_KEY = process.env.APPSYNC_API_KEY;
const graphqlCaller = async (event) => {
    const body = event.body ? JSON.parse(event.body) : {};
    const id = body.id;
    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "id is required in the request body" }),
        };
    }
    const query = `
    query GetUser($id: ID!) {
      getUser(id: $id) {
        id
        name
        email
      }
    }
  `;
    const variables = { id };
    try {
        const response = await axios_1.default.post(APPSYNC_URL, { query, variables }, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
            },
        });
        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    }
    catch (err) {
        console.error("Error calling AppSync:", err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
exports.graphqlCaller = graphqlCaller;
