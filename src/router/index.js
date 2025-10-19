import AppLayout from '@/layout/AppLayout.vue';
import { useAuth } from '@/stores';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/dashboard',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Dashboard', active: true }
                        ]
                    },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/master/business-area',
                    name: 'business-area',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Master' },
                            { label: 'Personal Sub Area', active: true }
                        ]
                    },
                    component: () =>
                        import('@/views/master/businessArea/BusinessArea.vue')
                },
                {
                    path: '/user-management/role',
                    name: 'user-management-rolelist',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Master' },
                            {
                                label: 'Role & Permission',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/role/RoleList.vue')
                },
                // {
                //     path: '/user-management/user',
                //     name: 'user-management-userlist',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'User Management' },
                //             {
                //                 label: 'User',
                //                 active: true
                //             }
                //         ]
                //     },
                //     component: () =>
                //         import('@/views/userManagement/user/UserList.vue')
                // },
                {
                    path: '/transaction/jadwal-rapat-korporat',
                    name: 'jadwal-rapat-korporat',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Jadwal',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/JadwalRapatKorporat.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/add',
                    name: 'jadwal-rapat-korporat-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Add Jadwal Rapat',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/add/AddJadwalRapat.vue')
                },
                {
                    path: '/transaction/jadwal-kepdir-sirkuler/detail/2/:id',
                    name: 'kepdir-sirkuler-detail-kepdir-sirkuler',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail Kepdir Sirkuler',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/kepdirSirkuler/detail/DetailKepdirSirkuler.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/1/:id',
                    name: 'jadwal-rapat-korporat-detail-direksi',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail Direksi',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/DetailRapatKomisDireksidankomite.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/3/:id',
                    name: 'jadwal-rapat-korporat-detail-rups-rkap',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail RUPS dan RKAP',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/DetailRUPSdanRKAPatauLPT.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/4/:id',
                    name: 'jadwal-rapat-korporat-detail-rups-lpt',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail RUPS dan LPT',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/DetailRUPSdanRKAPatauLPT.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/5/:id',
                    name: 'jadwal-rapat-korporat-detail-komite',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail Komite',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/DetailRapatKomisDireksidankomite.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/6/:id',
                    name: 'jadwal-rapat-korporat-detail-dewan-komisaris',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail Dewan Komisaris',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/DetailRapatKomisDireksidankomite.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/7/:id',
                    name: 'jadwal-rapat-korporat-detail-gcg',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Detail GCG',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/DetailGCG.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/add/KepdirSirkuler',
                    name: 'jadwal-rapat-korporat-detail-add-kepdir-sirkuler',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Add Kepdir Sirkuler',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/kepdirSirkuler/add/AddKepdir.vue')
                },
                // {
                //     path: '/transaction/tindak-lanjut/tindak-lanjut-rapat',
                //     name: 'jadwal-rapat-korporat-tindak-lanjut-rapat',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'Jadwal Rapat' },
                //             {
                //                 label: 'Tindak Lanjut Rapat',
                //                 active: true
                //             }
                //         ]
                //     },
                //     component: () =>
                //         import('@/views/transaction/tindakLanjut/TindakLanjutRapat.vue')
                // },
                {
                    path: '/transaction/approval-radir/:id',
                    name: 'jadwal-rapat-korporat-tindak-lanjut-rapat',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Tindak Lanjut Rapat',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/tindakLanjut/TindakLanjutRapat.vue')
                },
                {
                    path: '/transaction/approval-radir/:tahun',
                    name: 'jadwal-rapat-korporat-tindak-lanjut-rapat-with-year',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Tindak Lanjut Rapat',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/tindakLanjut/TindakLanjutRapat.vue')
                },
                {
                    path: '/transaction/approval-radir/:id/:tahun/:jenisRapat',
                    name: 'jadwal-rapat-korporat-tindak-lanjut-rapat-with-year-and-type',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Tindak Lanjut Rapat',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/tindakLanjut/TindakLanjutRapat.vue')
                },
                {
                    path: '/transaction/tindak-lanjut/detail/detail-rapat',
                    name: 'tindak-lanjut-rapat-detail',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Tindak Lanjut Rapat' },
                            {
                                label: 'Detail Tindak Lanjut Rapat',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/tindakLanjut/detail/DetailTindakLanjut.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/add/detail-direksi',
                    name: 'jadwal-rapat-korporat-add-detail-direksi',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Add Detail Direksi',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/add/AddDetailDireksi.vue')
                },
                {
                    path: '/transaction/jadwal-rapat-korporat/detail/add/detail-rups-dan-rkap-atau-lpt',
                    name: 'jadwal-rapat-korporat-add-detail-rups-dan-rkap-atau-lpt',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jadwal Rapat' },
                            {
                                label: 'Add Detail RUPS dan RKAP atau LPT',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/jadwalRapatKorporat/detail/add/addDetailRUPSdanRKAPatauLPT.vue')
                },
                // {
                //     path: '/transaction/jadwal-rapat-korporat/approval-rejected',
                //     name: 'jadwal-rapat-korporat-approval-rejected',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'Jadwal Rapat' },
                //             {
                //                 label: 'Approval Rejected',
                //                 active: true
                //             }
                //         ]
                //     },
                //     component: () =>
                //         import('@/views/transaction/jadwalRapatKorporat/detail/approval/ApprovalRapat.vue')
                // },
                {
                    path: '/transaction/approval-tindak-lanjut/:tahun',
                    name: 'tindak-lanjut-rapat',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Tindak Lanjut Rapat' },
                            {
                                label: 'Tindak Lanjut',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/tindakLanjut/TindakLanjutRapat.vue')
                },
                {
                    path: '/user-management/user',
                    name: 'user-management-userlist',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'User',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/user/UserList.vue')
                },
                {
                    path: '/user-management/user/edit/:idUser',
                    name: 'user-management-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'Edit User',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/user/edit/EditUser.vue')
                },
                {
                    path: '/user-management/user/add',
                    name: 'user-management-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'Add User',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/user/edit/EditUser.vue')
                },
                {
                    path: '/user-management/role',
                    name: 'user-management-rolelist',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'Role',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/role/RoleList.vue')
                },
                {
                    path: '/user-management/role/add',
                    name: 'user-management-tambah-role',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'Tambah Role',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/role/add/AddRole.vue')
                },
                {
                    path: '/user-management/role/edit/:idRole',
                    name: 'user-management-edit-role',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'Edit Role',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/userManagement/role/edit/EditRole.vue')
                },
                {
                    path: '/user-management/permission',
                    name: 'user-management-permissionlist',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Management' },
                            {
                                label: 'Permission',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import(
                            '@/views/userManagement/permission/PermissionList.vue'
                        )
                },
                
                {
                    path: '/user-administration/user',
                    name: 'user-administration-userlist',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Administration' },
                            {
                                label: 'User',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/userAdministration/user/UserList.vue')
                },
                {
                    path: '/user-administration/user/edit/:idUser',
                    name: 'user-administration-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Administration' },
                            {
                                label: 'Edit User',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/userAdministration/user/edit/EditUser.vue')
                },
                {
                    path: '/user-administration/user/add',
                    name: 'user-administration-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User administration' },
                            {
                                label: 'Add User',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/userAdministration/user/edit/EditUser.vue')
                },
                {
                    path: '/user-roles-permissions/role',
                    name: 'user-roles-permissions-userlist',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Roles & Permissions' },
                            {
                                label: 'User Roles & Permissions List',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/userAdministration/role/RoleList.vue')
                },
                {
                    path: '/user-roles-permissions/role/edit/:idUser',
                    name: 'user-roles-permissions-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Roles & Permissions' },
                            {
                                label: 'User Roles & Permissions Edit',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/userAdministration/role/edit/EditRole.vue')
                },
                {
                    path: '/user-roles-permissions/role/add',
                    name: 'user-roles-permissions-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'User Roles & Permissions' },
                            {
                                label: 'User Roles & Permissions Add',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/userAdministration/role/add/AddRole.vue')
                },
                {
                    path: '/jenis-rapat/rapat',
                    name: 'jenis-rapat-list',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jenis Rapat' },
                            {
                                label: 'Rapat List',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/rapatKerja/rapatKerjaList.vue')
                },
                {
                    path: '/jenis-rapat/rapat/add',
                    name: 'jenis-rapat-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jenis Rapat' },
                            {
                                label: 'Rapat Add',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/rapatKerja/edit/editRapatKerja.vue')
                },
                {
                    path: '/jenis-rapat/rapat/edit/:idRapat',
                    name: 'jenis-rapat-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jenis Rapat' },
                            {
                                label: 'Rapat Edit',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/rapatKerja/edit/editRapatKerja.vue')
                },
                {
                    path: '/gcg',
                    name: 'gcg-list',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG' },
                            {
                                label: 'Implementasi',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/gcg/gcg.vue')
                },
                {
                    path: '/gcg/add',
                    name: 'gcg-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG', url: '/gcg/:tahun' },
                            {
                                label: 'Add Implementasi (Dynamic)',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/gcg/form/dynamicParameterForm.vue')
                },
                {
                    path: '/gcg/edit/:id',
                    name: 'gcg-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG', url: '/gcg/:tahun' },
                            {
                                label: 'Edit Implementasi',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/gcg/form/dynamicParameterForm.vue')
                },
                {
                    path: '/gcg/evidence/:id',
                    name: 'gcg-evidence',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG', url: '/gcg/:tahun' },
                            {
                                label: 'Manajemen Evidence',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/gcg/form/manageEvidence.vue')
                },
                {
                    path: '/gcg/score/:id',
                    name: 'gcg-score',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG', url: '/gcg/:tahun' },
                            {
                                label: 'Self Assessment',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/transaction/gcg/form/selfAssessment.vue')
                },
                {
                    path: '/parameter',
                    name: 'parameter',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Parameter' },
                            {
                                label: 'Parameter List',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/parameter/parameterList.vue')
                },
                {
                    path: '/parameter/add',
                    name: 'parameter-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Parameter' },
                            {
                                label: 'Parameter Add',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/parameter/edit/editParameter.vue')
                },
                {
                    path: '/parameter/edit/:id',
                    name: 'parameter-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Parameter' },
                            {
                                label: 'Parameter Edit',
                                active: true
                            }
                        ]
                    },
                    component: () =>
                        import('@/views/master/parameter/edit/editParameter.vue')
                },
                {
                    path: '/aspek',
                    name: 'Aspek',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Aspek' },
                            {
                                label: 'Aspek List',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/aspek/aspekList.vue')
                },
                {
                    path: '/aspek/add',
                    name: 'aspek-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Aspek' },
                            {
                                label: 'Aspek Add',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/aspek/edit/editAspek.vue')
                },
                {
                    path: '/aspek/edit/:id',
                    name: 'aspek-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Aspek' },
                            {
                                label: 'Aspek Edit',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/aspek/edit/editAspek.vue')
                },
                {
                    path: '/jenisFile/file',
                    name: 'jenis-file',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jenis File' },
                            {
                                label: 'Jenis List',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/jenisfile/jenisFileList.vue')
                },
                {
                    path: '/jenisFile/file/add',
                    name: 'jenis-file-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jenis File' },
                            {
                                label: 'Jenis File Add',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/jenisfile/edit/editJenisFile.vue')
                },
                {
                    path: '/jenisFile/file/edit/:id',
                    name: 'jenis-file-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jenis File' },
                            {
                                label: 'Jenis File Edit',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/jenisfile/edit/editJenisFile.vue')
                },
                {
                    path: '/direktorat',
                    name: 'Direktorat',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Direktorat' },
                            {
                                label: 'Direktorat List',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/direktorat/direktoratList.vue')
                },
                {
                    path: '/direktorat/add',
                    name: 'direktorat-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Direktorat' },
                            {
                                label: 'Direktorat Add',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/direktorat/edit/editDirektorat.vue')
                },
                {
                    path: '/direktorat/add/:id',
                    name: 'direktorat-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Direktorat' },
                            {
                                label: 'Direktorat Edit',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/direktorat/edit/editDirektorat.vue')
                },
                {
                    path: '/divisi',
                    name: 'Divisi',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Divisi' },
                            {
                                label: 'Divisi List',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/divisi/divisiList.vue')
                },
                {
                    path: '/divisi/add',
                    name: 'divisi-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Divisi' },
                            {
                                label: 'Divisi Add',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/divisi/edit/editDivisi.vue')
                },
                {
                    path: '/divisi/edit/:id',
                    name: 'divisi-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Divisi' },
                            {
                                label: 'Divisi Edit',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/divisi/edit/editDivisi.vue')
                },
                {
                    path: '/jabatan',
                    name: 'Jabatan',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jabatan' },
                            {
                                label: 'Jabatan List',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/jabatan/jabatanList.vue')
                },
                {
                    path: '/jabatan/add',
                    name: 'jabatan-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jabatan' },
                            {
                                label: 'Jabatan Add',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/jabatan/edit/editJabatan.vue')
                },
                {
                    path: '/jabatan/edit/:id',
                    name: 'jabatan-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Jabatan' },
                            {
                                label: 'Jabatan Edit',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/master/jabatan/edit/editJabatan.vue')
                },
                // {
                //     path: '/emailNotif',
                //     name: 'Email Notif',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'Email Notif' },
                //             {
                //                 label: 'Email Notif List',
                //                 active: true
                //             }
                //         ]
                //     },
                //     component: () => import('@/views/master/emailNotif/EmailNotifList.vue')
                // },
                // {
                //     path: '/emailNotif/add',
                //     name: 'emailNotif-add',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'Email Notif' },
                //             {
                //                 label: 'Email Notif Add',
                //                 active: true
                //             }
                //         ]
                //     },
                //     component: () => import('@/views/master/emailNotif/edit/EditEmailNotif.vue')
                // },
                // {
                //     path: '/emailNotif/edit/:id',
                //     name: 'emailNotif-edit',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'Email Notif' },
                //             {
                //                 label: 'Email Notif Edit',
                //                 active: true
                //             }
                //         ]
                //     },
                //     component: () => import('@/views/master/emailNotif/edit/EditEmailNotif.vue')
                // },
                {
                    path: '/transaction/rapat-direksi/:tahun',
                    name: 'rapat-direksi-redirect',
                    redirect: (to) => `/transaction/rapat-direksi/${to.params.tahun}/1`
                },
                {
                    path: '/transaction/rapat-direksi/:tahun/1',
                    name: 'rapat-direksi',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Rapat Direksi',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/JadwalRapatKorporat.vue')
                },
                {
                    path: '/transaction/rapat-kepdir-sirkular/:tahun',
                    name: 'rapat-kepdir-sirkular',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Rapat Kepdir Sirkuler' },
                            {
                                label: 'Rapat Kepdir Sirkuler',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/kepdirSirkuler/KepdirSirkuler.vue')
                },
                {
                    path: '/transaction/kepdir-sirkuler/:tahun',
                    name: 'kepdir-sirkuler',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.params.tahun;
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Kepdir Sirkuler', url: `/transaction/kepdir-sirkuler/${tahun}` },
                                {
                                    label: 'Kepdir Sirkuler',
                                    active: true
                                }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/kepdirSirkuler/KepdirSirkuler.vue')
                },
                {
                    path: '/transaction/kepdir-sirkuler/add',
                    name: 'kepdir-sirkuler-add',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Kepdir Sirkuler' },
                            {
                                label: 'Kepdir Sirkuler Add',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/kepdirSirkuler/add/AddKepdir.vue')
                },
                {
                    path: '/transaction/kepdir-sirkuler/upload-kajian',
                    name: 'kepdir-sirkuler-upload-kajian',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Kepdir Sirkuler', url: `/transaction/kepdir-sirkuler/${tahun}` },
                                {
                                    label: 'Upload Kajian Rapat',
                                    active: true
                                }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/kepdirSirkuler/add/UploadKajianKepdir.vue')
                },
                {
                    path: '/transaction/kepdir-sirkuler/upload-form-review-governance',
                    name: 'kepdir-sirkuler-upload-form-review-governance',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Kepdir Sirkuler', url: `/transaction/kepdir-sirkuler/${tahun}` },
                                {
                                    label: 'Upload Form Review Governance',
                                    active: true
                                }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/kepdirSirkuler/add/UploadFormReviewGovernance.vue')
                },
                {
                    path: '/transaction/kepdir-sirkuler/detail/:id',
                    name: 'kepdir-sirkuler-detail',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Kepdir Sirkuler', url: `/transaction/kepdir-sirkuler/${tahun}` },
                                {
                                    label: 'Detail Kepdir Sirkuler',
                                    active: true
                                }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/kepdirSirkuler/detail/DetailKepdirSirkuler.vue')
                },
                {
                    path: '/transaction/rapat-komite-audit/:tahun',
                    name: 'rapat-komite-redirect',
                    redirect: (to) => `/transaction/rapat-komite-audit/${to.params.tahun}/5`
                },
                {
                    path: '/transaction/rapat-komite-audit/:tahun/5',
                    name: 'rapat-komite',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Rapat Komite',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/JadwalRapatKorporat.vue')
                },
                {
                    path: '/transaction/rapat-dewan-komisaris/:tahun',
                    name: 'dewan-komisaris-redirect',
                    redirect: (to) => `/transaction/rapat-dewan-komisaris/${to.params.tahun}/6`
                },
                {
                    path: '/transaction/rapat-dewan-komisaris/:tahun/6',
                    name: 'dewan-komisaris',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Rapat Dewan Komisaris',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/JadwalRapatKorporat.vue')
                },
                {
                    path: '/transaction/gcg/:tahun',
                    name: 'gcg-redirect',
                    redirect: (to) => `/transaction/gcg/${to.params.tahun}/7`
                },
                {
                    path: '/transaction/gcg/:tahun/7',
                    name: 'gcg',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG' },
                            {
                                label: 'GCG',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/JadwalRapatKorporat.vue')
                },
                {
                    path: '/transaction/rapat-rups-rkap/:tahun',
                    name: 'rapat-rups-rkap-redirect',
                    redirect: (to) => `/transaction/rapat-rups-rkap/${to.params.tahun}/3`
                },
                {
                    path: '/transaction/rapat-rups-rkap/:tahun/3',
                    name: 'rapat-rups-rkap',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Rapat RUPS dan RKAP',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/JadwalRapatKorporat.vue')
                },
                {
                    path: '/transaction/rapat-rups-lpt/:tahun',
                    name: 'rapat-rups-lpt-redirect',
                    redirect: (to) => `/transaction/rapat-rups-lpt/${to.params.tahun}/4`
                },
                {
                    path: '/transaction/rapat-rups-lpt/:tahun/4',
                    name: 'rapat-rups-lpt',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Rapat RUPS dan LPT',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-lpt/rapatRUPS.vue')
                },
                {
                    path: '/gcg',
                    name: 'gcg',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'GCG' },
                            {
                                label: 'GCG',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/gcg/gcg.vue')
                },
                {
                    path: '/transaction/rups/rapat',
                    name: 'rapat-rups',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Transaction' },
                            { label: 'RUPS' },
                            { label: 'Rapat RUPS LPT', active: true }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-lpt/formRapatRUPS.vue')
                },
                {
                    path: '/transaction/rapat-rups-lpt/edit/:id',
                    name: 'rapat-rups-lpt-edit',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Rapat RUPS dan LPT', url: `/transaction/rapat-rups-lpt/${tahun}/4` },
                                { label: 'Attachment Document & Arahan', active: true }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-lpt/formRapatRUPS.vue')
                },
                {
                    path: '/transaction/rapat-rups-lpt/add',
                    name: 'rapat-rups-lpt-add',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Rapat RUPS dan LPT', url: `/transaction/rapat-rups-lpt/${tahun}/4` },
                                { label: 'Add Jadwal Rapat RUPS LPT', active: true }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-lpt/addRapatRUPS.vue')
                },
                {
                    path: '/transaction/rapat-rups-lpt/detail/:id',
                    name: 'rapat-rups-lpt-detail',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Rapat RUPS dan LPT', url: `/transaction/rapat-rups-lpt/${tahun}/4` },
                                { label: 'Detail Rapat RUPS LPT', active: true }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-lpt/rapatRUPSDetail.vue')
                },
                // RUPS RKAP Routes
                {
                    path: '/transaction/rapat-rups-rkap/:tahun',
                    name: 'rapat-rups-rkap-redirect',
                    redirect: (to) => `/transaction/rapat-rups-rkap/${to.params.tahun}/3`
                },
                {
                    path: '/transaction/rapat-rups-rkap/:tahun/3',
                    name: 'rapat-rups-rkap',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Rapat RUPS dan RKAP',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-rkap/rapatRUPS.vue')
                },
                {
                    path: '/transaction/rapat-rups-rkap/edit/:id',
                    name: 'rapat-rups-rkap-edit',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Rapat RUPS dan RKAP', url: `/transaction/rapat-rups-rkap/${tahun}/3` },
                                { label: 'Attachment Document & Arahan', active: true }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-rkap/formRapatRUPS.vue')
                },
                {
                    path: '/transaction/rapat-rups-rkap/add',
                    name: 'rapat-rups-rkap-add',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Rapat RUPS dan RKAP', url: `/transaction/rapat-rups-rkap/${tahun}/3` },
                                { label: 'Add Jadwal Rapat RUPS RKAP', active: true }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-rkap/addRapatRUPS.vue')
                },
                {
                    path: '/transaction/rapat-rups-rkap/detail/:id',
                    name: 'rapat-rups-rkap-detail',
                    meta: {
                        breadcrumbItems: (route) => {
                            const tahun = route.query.tahun || new Date().getFullYear();
                            return [
                                { label: 'Home', url: '/' },
                                { label: 'Rapat RUPS dan RKAP', url: `/transaction/rapat-rups-rkap/${tahun}/3` },
                                { label: 'Detail Rapat RUPS RKAP', active: true }
                            ];
                        }
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-rkap/rapatRUPSDetail.vue')
                },
                {
                    path: '/transaction/rups/rapat/edit/:id',
                    name: 'rapat-rups-edit',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            { label: 'Transaction' },
                            { label: 'RUPS' },
                            { label: 'Edit Rapat RUPS LPT', active: true }
                        ]
                    },
                    component: () => import('@/views/transaction/jadwalRapatKorporat/rups-lpt/formRapatRUPS.vue')
                },
                // Kepdir Sirkuler Routes
                // {
                //     path: '/transaction/rapat-kepdir-sirkular/:tahun',
                //     name: 'rapat-kepdir-sirkular-redirect',
                //     redirect: (to) => `/transaction/rapat-kepdir-sirkular/${to.params.tahun}/1`
                // },
                // {
                //     path: '/transaction/rapat-kepdir-sirkular/:tahun/1',
                //     name: 'kepdir-sirkuler',
                //     meta: {
                //         breadcrumbItems: [
                //             { label: 'Home', url: '/' },
                //             { label: 'Transaction' },
                //             { label: 'Kepdir Sirkuler', active: true }
                //         ]
                //     },
                //     component: () => import('@/views/transaction/kepdirSirkuler/KepdirSirkulerList.vue')
                // },
                {
                    path: '/transaction/report/rapat-korporat',
                    name: 'report-rapat-korporat',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Report Per Jenis Rapat Korporat',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/report/ReportRapatKorporat.vue')
                },
                {
                    path: '/transaction/report/rups',
                    name: 'report-rups',
                    meta: {
                        breadcrumbItems: [
                            { label: 'Home', url: '/' },
                            {
                                label: 'Report RUPS',
                                active: true
                            }
                        ]
                    },
                    component: () => import('@/views/transaction/report/ReportRUPS.vue')
                },
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

                {
                    path: '/auth/login',
                    name: 'login',
                    component: () => import('@/views/pages/auth/Login.vue')
                },
                {
                    path: '/auth/forgot-password',
                    name: 'forgot-password',
                    component: () => import('@/views/pages/auth/ForgotPassword.vue')
                },
                {
                    path: '/auth/reset-password',
                    name: 'reset-password',
                    component: () => import('@/views/pages/auth/ResetPassword.vue')
                },
                {
                    path: '/oauth/callback',
                    name: 'oauth-callback',
                    component: () => import('@/views/pages/OAuthCallback.vue')
                },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to) => {
    const authStore = useAuth();
    const publicPages = ['/auth/login', '/auth/access', '/sso/validate', '/oauth/callback', '/oauth/azureuri', '/auth/forgot-password', '/auth/reset-password'];
    const authRequired = !publicPages.includes(to.path);
    
    // Simple check: use authStore.isLoggedIn directly
    const isLoggedIn = authStore.isLoggedIn;

    console.log('Router Guard - To:', to.path, 'Auth Required:', authRequired, 'Is Logged In:', isLoggedIn);

    if (authRequired && !isLoggedIn) {
        console.log('Router Guard - Redirecting to login (auth required but not logged in)');
        return '/auth/login';
    } else if (to.path === '/auth/login' && isLoggedIn) {
        console.log('Router Guard - Redirecting to dashboard (already logged in)');
        return '/';
    }
});

export default router;
