// main entry point
import './assets/global.css';
import './assets/bot.css';

import './augmentations';

require("font-awesome-webpack!../font-awesome.config.js");

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import {enableProdMode} from '@angular/core';

// Uncomment the below line if you would like to test prod mode
//enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
