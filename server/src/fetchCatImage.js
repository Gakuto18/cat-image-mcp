"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCatImage = void 0;
const fetchCatImage = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const API_KEY = process.env.CAT_API_KEY;
    if (!API_KEY)
      throw new Error("CAT_API_KEY environment variable is not set");
    const response = yield fetch(
      `https://api.thecatapi.com/v1/images/search?limit=1&api_key=${API_KEY}`
    );
    const data = yield response.json();
    const imageResponse = yield fetch(data[0].url);
    const arrayBuffer = yield imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return base64;
  });
exports.fetchCatImage = fetchCatImage;
