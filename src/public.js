/**
 * SPDX-FileCopyrightText: 2018 John Molakvoæ <skjnldsv@protonmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { generateFilePath } from '@nextcloud/router'

import CryptoLib from './crypto.js'
import Vue from 'vue'
import Share from './Share.vue'
Object.defineProperty(Vue.prototype, '$cryptolib', { value: new CryptoLib(window.crypto) })

// eslint-disable-next-line
__webpack_public_path__ = generateFilePath(appName, '', 'js/')

Vue.mixin({ methods: { t, n } })

export default new Vue({
	el: '#secret-root',
	render: h => h(Share),
})
