<template>
	<!--
	SPDX-FileCopyrightText: Tobias Knöppler <thecalcaholic@web.de>
	SPDX-License-Identifier: AGPL-3.0-or-later
	-->
	<div id="content-wrapper" class="app-secrets">
		<AppContent class="centered">
			<h2>The following secret has been shared with you securely:</h2>
			<!--v-on:secret-changed="changeSecret"-->
			<div class="secret-container">
				<div>
					<NoteCard type="warning">
						<p>
							{{ t('secrets', 'Please make sure you have copied and stored the secret before closing this page! It is now deleted on the server.') }}
						</p>
					</NoteCard>
				</div>
				<Actions class="secret-actions">
					<ActionButton :icon="copyButtonIcon"
						@click="copyToClipboard(decrypted)">
						{{ t('secrets', 'Copy to Clipboard') }}
					</ActionButton>
				</Actions>
				<textarea v-if="decrypted"
					v-model="decrypted"
					disabled="disabled" />
				<div v-else-if="loading" id="emptycontent">
					<div class="icon-loading" />
					<h2>{{ t('secrets', 'Retrieving secret...') }}</h2>
				</div>
				<div v-else id="emptycontent">
					<div class="icon-password" />
					<h2>{{ t('secrets', 'Error loading secret. Is your link correct?') }}</h2>
				</div>
			</div>
		</AppContent>
	</div>
</template>

<script>
import AppContent from '@nextcloud/vue/dist/Components/NcAppContent.js'
import NoteCard from '@nextcloud/vue/dist/Components/NcNoteCard.js'
import Actions from '@nextcloud/vue/dist/Components/NcActions.js'
import ActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'

import '@nextcloud/dialogs/styles/toast.scss'
import { showError } from '@nextcloud/dialogs'
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'Share',
	components: {
		AppContent,
		Actions,
		ActionButton,
		NoteCard,
	},
	data() {
		return {
			decrypted: null,
			loading: true,
			copyState: 'ready',
		}
	},
	computed: {

		copyButtonIcon() {
			if (this.copyState === 'success') { return 'icon-checkmark' }
			if (this.copyState === 'error') { return 'icon-error' }
			return 'icon-clippy'
		},
	},
	async mounted() {
		try {
			let uuid = window.location.pathname
			uuid = uuid.substring(uuid.lastIndexOf('/') + 1)
			const response = await axios.post(generateUrl('/apps/secrets/api/get'), { uuid })
			const secret = response.data
			const iv = this.$cryptolib.b64StringToArrayBuffer(secret.iv)
			console.log("to decrypt:", secret.encrypted, secret.iv, window.location.hash.substring(1));
			const key = await this.$cryptolib.importDecryptionKey(window.location.hash.substring(1), iv)
			console.log(key);
			this.decrypted = await this.$cryptolib.decrypt(secret.encrypted, key, iv)
			console.log("decrypted", this.decrypted)
		} catch (e) {
			console.error(e)
			showError(t('secrets', 'Could not decrypt secret'))
		}
		this.loading = false
	},
	methods: {

		async copyToClipboard(content) {
			try {
				await navigator.clipboard.writeText(content)
				this.copyState = 'success'
				setTimeout(() => { this.copyState = 'ready' }, 3000)
			} catch (e) {
				showError(e.message)
				console.error(e)
				this.copyState = 'error'
				setTimeout(() => { this.copyState = 'ready' }, 3000)
			}

		},
	},
}
</script>

<style scoped>
	div.secret-container {
		width: 100%;
		min-height: 50%;
		padding: 20px;
		display: flex;
		flex-direction: column;
		height: calc(100% - 42px);
	}

	.centered {
		text-align: center;
		margin-left: auto;
		margin-right: auto;
	}

	textarea {
		width: 100%;
		margin: 0;
		height: 400px;
		min-width: calc(100% - 4em);
		font-family: 'Lucida Console', monospace;
		flex-grow: 1;
	}

	input[type='button'] {
		display: block;
		margin: auto;
	}

	#content-wrapper {
		display: flex;
		width: 100%;
		border-radius: var(--body-container-radius);
		overflow: hidden;
	}

</style>
<style>
	.app-content {
		padding: 44px 20px 20px;
	}
</style>
