/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../../../../MatrixClientPeg";

/**
 * Base URL for the AdvertiseBot Synapse module endpoints.
 * Postman collection uses this as `{{base_url}}`. Change the suffix here if
 * the server exposes the API under a different path.
 */
export function bazaarBaseUrl(): string {
    return "https://bots.agridemo.ir/api";
}

export function bazaarAuthHeader(): { Authorization: string } {
    return { Authorization: `Bearer ${MatrixClientPeg.safeGet().getAccessToken()}` };
}
