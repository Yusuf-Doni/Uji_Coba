import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import VueApexCharts from 'vue3-apexcharts';
import Chart from 'primevue/chart';
import { LMap, LTileLayer, LPopup, LMarker, LControl } from "@vue-leaflet/vue-leaflet";

import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import "leaflet/dist/leaflet.css";

import { definePreset } from '@primevue/themes';

window.global ||= window;
const app = createApp(App);
const pinia = createPinia();

const PLNPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#E6F2F4',
            100: '#c2fff8',
            200: '#8cfff2',
            300: '#3dffea',
            400: '#00ffe4',
            500: '#00fcff',
            600: '#00c8e3',
            700: '#009db5',
            800: '#007c90',
            900: '#00667a',
            950: '#004355'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.900}',
                    hoverColor: '{primary.700}',
                    borderColor: '{primary.900}'
                }
            }
        }
    },
    components: {
        button: {
            colorScheme: {
                light: {
                    outlined: {
                        primary: {
                            color: '{primary.900}',
                            borderColor: '{primary.900}'
                        }
                    }
                }
            }
        }
    }
});

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: PLNPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(VueApexCharts);
app.use(pinia);
app.component("Chart", Chart);
app.component("l-map",LMap);
app.component("l-popup",LPopup);
app.component("l-marker",LMarker);
app.component("l-tile-layer",LTileLayer);
app.component("l-control",LControl);

app.mount('#app');

