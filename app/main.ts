// main entry point
import './assets/global.css';
import './assets/bot.css';

import './augmentations';

require("font-awesome-webpack!../font-awesome.config.js");

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import {enableProdMode} from '@angular/core';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
