/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../../../../../MatrixClientPeg";
import { type FieldValue, type FormStructure, type FormValues } from "./formTypes";

/**
 * Build the submission payload as an array of `{ field_id, value }` answers.
 * Used for both JSON and multipart variants below.
 */
function buildAnswers(form: FormStructure, values: FormValues): Array<{ field_id: number; value: unknown }> {
    const fieldIds = form.steps.flatMap((s) => s.fields.map((f) => f.id));
    return fieldIds
        .filter((id) => values[id] !== undefined && values[id] !== null)
        .map((id) => {
            const v = values[id];
            // Files are attached separately in multipart mode; here we emit just the
            // filename so the backend can correlate it with the uploaded part.
            if (v instanceof File) return { field_id: id, value: v.name };
            return { field_id: id, value: v as unknown };
        });
}

function hasAnyFile(values: FormValues): boolean {
    return Object.values(values).some((v) => v instanceof File);
}

/**
 * POST the values for a completed form to the Synapse submissions endpoint:
 *   POST /_synapse/client/forms/submissions/{subcategoryId}
 *
 * If any value is a `File`, the request is sent as `multipart/form-data` with
 * an `answers` JSON part and one part per file (keyed by `file_{fieldId}`);
 * otherwise the body is plain JSON `{ answers: [...] }`.
 */
export async function submitGreatShopForm(
    subcategoryId: string,
    form: FormStructure,
    values: FormValues,
): Promise<unknown> {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const token = cli.getAccessToken();
    const url = `${baseUrl}/_synapse/client/forms/submissions/${encodeURIComponent(subcategoryId)}`;

    const answers = buildAnswers(form, values);

    let res: Response;
    if (hasAnyFile(values)) {
        const fd = new FormData();
        fd.append("answers", JSON.stringify(answers));
        for (const [fieldIdStr, v] of Object.entries(values)) {
            if (v instanceof File) fd.append(`file_${fieldIdStr}`, v, v.name);
        }
        res = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
        });
    } else {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ answers }),
        });
    }

    if (!res.ok) {
        let detail = "";
        try {
            const j = await res.json();
            detail = j?.error || j?.message || JSON.stringify(j);
        } catch {
            detail = await res.text().catch(() => "");
        }
        throw new Error(`HTTP ${res.status}${detail ? `: ${detail}` : ""}`);
    }

    try {
        return await res.json();
    } catch {
        return null;
    }
}

// Re-export the value type for callers that build payloads themselves.
export type { FieldValue };
