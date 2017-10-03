import './assets/global.css';
import './assets/bot.css';

require("font-awesome-webpack!../font-awesome.config.js");

import {platformBrowser} from "@angular/platform-browser";
import {AppModuleNgFactory} from "../aot/app/app.module.ngfactory";

import { enableProdMode } from '@angular/core';

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);