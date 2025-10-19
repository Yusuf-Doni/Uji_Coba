<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuth } from '@/stores';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import NotificationService from '@/service/NotificationService';
import Stomp from "webstomp-client";
import IParams from '@/interface/IParams';
import router from '@/router';

const { onMenuToggle } = useLayout();
const authStore = useAuth();
const toast = useToast();

const stompClient = ref();
const connected = ref();

const currentYear = ref(null);
const currentMonth = ref(null);
const currentDay = ref(null);
const isLoadingNotification = ref(false);
const paramNotification = ref({ ...IParams });
const notificationOpt = ref([]);
const notificationCount = ref(0);
const op = ref();
const toggleNotif = (event) => {
    op.value.toggle(event);
    getOptNotificationList();
}
const topic = ref('');
const userMenus = ref([
    {
        label: `${authStore.username} `,
        icon: 'pi pi-id-card',
        command: () => { }
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
            onClickLogout();
        }
    }
]);
const refUserMenus = ref();

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

onMounted(() => {
    getCurrentyear();
    connect();
    getCountNotification();
});

const getCurrentyear = () => {
    const currentDate = new Date();
    currentYear.value = currentDate.getFullYear();
    currentMonth.value = monthNames[currentDate.getMonth()];
    currentDay.value = currentDate.getDate().toString().padStart(2, '0');
};

const toggleUserMenu = (event) => {
    refUserMenus.value.toggle(event);
};

const getDisplayRole = () => {
    if (!authStore.role) return 'User';
    
    // Jika role adalah array, join dengan koma
    if (Array.isArray(authStore.role)) {
        return authStore.role.join(', ');
    }
    
    // Jika role adalah string, tampilkan langsung
    if (typeof authStore.role === 'string') {
        try {
            // Coba parse jika berupa JSON string
            const parsedRole = JSON.parse(authStore.role);
            if (Array.isArray(parsedRole)) {
                return parsedRole.join(', ');
            }
            return parsedRole;
        } catch {
            // Jika bukan JSON, tampilkan string langsung
            return authStore.role;
        }
    }
    
    return 'User';
};

const onClickLogout = () => {
    authStore
        .logout()
        .finally(() => {
            location.href = '/auth/login';
        });
};

// handle business area
const getOptNotificationList = async () => {
    isLoadingNotification.value = true;
    const param = paramNotification.value;
    delete param.search;
    await NotificationService.get({ ...paramNotification.value, size: 20 })
        .then((response) => {
            notificationOpt.value = response.data.data;
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingNotification.value = false;
        });
};

const getCountNotification = async () => {
    await NotificationService.count()
        .then((response) => {
            notificationCount.value = response.data?.data?.total_unread ?? 0;
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        });
};

const readNotification = async (id) => {
    await NotificationService.read(null, id)
        .then((response) => {
            getCountNotification();
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        });
};

const connect = () => {
    if (localStorage.getItem('username') == null)
        return;
    topic.value = import.meta.env.VITE_NOTIFICATION_TOPIC + "." + localStorage.getItem('userId') ?? '';
    stompClient.value = Stomp.client(import.meta.env.VITE_NOTIFICATION_URI);
    stompClient.value.connect(
        import.meta.env.VITE_NOTIFICATION_USERNAME,
        import.meta.env.VITE_NOTIFICATION_PASSWORD,
        frame => {
            connected.value = true;
            stompClient.value.subscribe(topic.value, tick => {
                const dt = JSON.parse(tick.body);
                getCountNotification();
                toast.add({
                    severity: dt.color,
                    summary: dt.subject,
                    detail: dt.message,
                    life: 3000,
                    onClick: () => {
                        gotoUrl(dt.id, dt.url)
                    }
                });
            });
        },
        error => {
            connected.value = false;
        }
    );
};

const gotoUrl = (id, url) => {
    readNotification(id);
    if (url == null) {
        return;
    } else {
        const query = {};
        if (url.includes("?")) {
            const urls = url.split("?");
            const _query = urls[1];
            const _dtQuery = _query.split("&");
            _dtQuery.forEach(el => {
                const dt = el.split("=");
                query[dt[0]] = dt[1];
            });
        }
        router.push({
            path: url,
            query: query
        });
    }
}

const stompDisconnect = () => {
    topic.value
    stompClient.value.unsubscribe(topic.value);
    stompClient.value.disconnect();
}
window.setInterval(function () {
    if (localStorage.getItem('username') == null) {
        stompDisconnect();
    }
}, 1000 * 60);  //5000 is 5 Seconds

</script>

<template>
    <div class="layout-topbar print:hidden shadow-lg">
        <div class="layout-topbar-logo-container">
            <router-link to="/" class="layout-topbar-logo">
                <img :src="'/demo/images/logo_plnepi.png'" alt="logo pln" width="110" />
                <img :src="'/demo/images/Synergi_GCG_6.png'" alt="logo pln" width="130" />
                <!-- <span class="font-bold text-primary-900">M-Action</span> -->
            </router-link>
        </div>

        <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
            <i class="pi pi-bars"></i>
        </button>

        <div class="layout-topbar-actions">
            <button class="layout-topbar-menu-button layout-topbar-action" v-styleclass="{
                selector: '@next',
                enterFromClass: 'hidden',
                enterActiveClass: 'animate-scalein',
                leaveToClass: 'hidden',
                leaveActiveClass: 'animate-fadeout',
                hideOnOutsideClick: true
            }">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content flex-row text-primary items-center gap-1">
                    <i class="pi pi-calendar"></i>
                    <div class="text-primary">
                        {{
                            currentDay + ' ' + currentMonth + ' ' + currentYear
                        }}
                    </div>
                    <div class="vl"></div>

                    <OverlayBadge :value="notificationCount" class="text-primary mt-[7px]" size="small">
                        <Button icon="pi pi-bell" type="button" variant="text"
                            class="layout-topbar-action text-primary w-[2rem] h-[2rem]" badge="2" @click="toggleNotif">
                            <i class="pi pi-bell"></i>
                            <span>Notification</span>
                        </Button>
                    </OverlayBadge>

                    <Menu ref="refUserMenus" id="user_menu" :model="userMenus" :popup="true" />
                    <!-- <Button type="button" variant="text" class="layout-topbar-action text-primary" aria-haspopup="true"
                        aria-controls="user_menu" @click="toggleUserMenu">
                        <div class="flex flex-row gap-1">
                            <i class="pi pi-user"></i>
                        </div>
                    </Button> -->
                    <Button type="button" variant="text" class="layout-topbar-info-action text-primary"
                        aria-haspopup="true" aria-controls="user_menu" @click="toggleUserMenu">
                        <div class="flex flex-row gap-2 items-center">
                            <i class="pi pi-user"></i>

                            <div class="flex flex-col gap-[0.2]">
                                <!-- <div class="font-semibold text-md">User 1</div>
                                <div class="font-light text-sm">Admin</div> -->
                                <div class="font-semibold text-md">{{ authStore.name || 'User' }}</div>
                                <div class="font-light text-sm">{{ getDisplayRole() }}</div>
                            </div>
                        </div>
                    </Button>

                    <Menu ref="refUserMenus" id="user_menu" :model="userMenus" :popup="true" />
                </div>
            </div>
        </div>
    </div>
    <Popover ref="op" :unstyled="false">
        <div v-if="notificationOpt.length > 0" class="flex flex-col gap-4 w-[300px] ">
            <ScrollPanel :value="notificationOpt" style="width: 100%; height: 400px">
                <DataView :value="notificationOpt">
                    <template #list="slotProps">
                        <div class="flex flex-col">
                            <div v-for="(item, index) in slotProps.items" :key="index">
                                <Tag class="w-full my-[1px] cursor-pointer" :severity="item.color"
                                    @click="gotoUrl(item.id, item.url)">
                                    <div class="w-full flex flex-row justify-start p-4 gap-4 ">
                                        <div class="w-10 relative">
                                            <i :class="'pi ' + item.icon ?? 'pi pi-info-circle'"
                                                style="font-size: 2rem"></i>
                                        </div>
                                        <div class="flex flex-col justify-start md:items-start gap-6">
                                            <div class="flex flex-col justify-between items-start gap-2">
                                                <div>
                                                    <span :class="['font-semibold text-lg mt-2']">{{
                                                        item.subject }}</span>
                                                    <div
                                                        class=" font-medium  text-surface-500 dark:text-surface-400 text-sm">
                                                        {{ item.message }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="relative">
                                            <i v-if="item.status != 'READ'" class="pi pi-circle-fill text-blue-700"
                                                style="font-size: 10px"></i>
                                        </div>
                                    </div>
                                </Tag>
                            </div>

                        </div>
                    </template>
                </DataView>
            </ScrollPanel>

        </div>
        <div v-else class="flex flex-col w-[240px] h-[400px] justify-center">
            <label class="w-full flex flex-row justify-center">Tidak ada data</label>
        </div>
    </Popover>
    <Toast />
</template>
