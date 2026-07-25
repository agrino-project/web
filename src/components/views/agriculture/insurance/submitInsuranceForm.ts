/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../../../../MatrixClientPeg";
import { SdkContextClass } from "../../../../contexts/SDKContext";
import {
    type Field,
    type FieldValue,
    type FormStructure,
    type FormValues,
} from "../../rooms/RoomListPanel/great-shops/formTypes";

interface Answer {
    question_id: number;
    value: unknown;
}

function castValue(field: Field, v: FieldValue): unknown {
    if (v === null || v === undefined) return v;

    switch (field.type) {
        case "number": {
            const n = typeof v === "number" ? v : Number(v);
            return Number.isNaN(n) ? v : n;
        }
        case "multi_choice": {
            if (!Array.isArray(v)) return v;
            const idByValue = new Map(field.options.map((o) => [o.value, o.id]));
            return v.map((val) => idByValue.get(val)).filter((id): id is number => id !== undefined);
        }
        case "geo": {
            if (v && typeof v === "object" && !(v instanceof File) && !Array.isArray(v)) {
                const { lat, lng } = v as { lat: string; lng: string };
                return {
                    lat: lat === "" || lat === undefined ? null : Number(lat),
                    lng: lng === "" || lng === undefined ? null : Number(lng),
                };
            }
            return v;
        }
        case "boolean":
            return Boolean(v);
        case "file":
            return v instanceof File ? v.name : v;
        default:
            return v;
    }
}

function buildAnswers(form: FormStructure, values: FormValues): Answer[] {
    const allFields = form.steps.flatMap((s) => s.fields);
    return allFields
        .filter((f) => values[f.id] !== undefined && values[f.id] !== null)
        .map((f) => ({ question_id: f.id, value: castValue(f, values[f.id]) }));
}

function hasAnyFile(values: FormValues): boolean {
    return Object.values(values).some((v) => v instanceof File);
}

/**
 * POST insurance form answers:
 *   POST /_synapse/client/forms/insurance/submissions/{subcategoryId}
 */
export async function submitInsuranceForm(
    subcategoryId: string,
    form: FormStructure,
    values: FormValues,
): Promise<unknown> {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const token = cli.getAccessToken();
    const url = `${baseUrl}/_synapse/client/forms/insurance/submissions/${encodeURIComponent(subcategoryId)}`;

    const answers = buildAnswers(form, values);
    const roomId = SdkContextClass.instance.roomViewStore.getRoomId() ?? undefined;
    const payload: { room_id?: string; answers: Answer[] } = roomId ? { room_id: roomId, answers } : { answers };

    let res: Response;
    if (hasAnyFile(values)) {
        const fd = new FormData();
        fd.append("answers", JSON.stringify(answers));
        if (roomId) fd.append("room_id", roomId);
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
            body: JSON.stringify(payload),
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
