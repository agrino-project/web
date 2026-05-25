import type { Room } from "matrix-js-sdk/src/matrix";
import type { Filter } from ".";
import { FilterKey } from ".";

export class GreatShopsFilter implements Filter {
    public matches(room: Room): boolean {
        return room.name?.toLowerCase().includes("shop") ?? false;
    }

    public get key(): FilterKey {
        return FilterKey.GreatShops;
    }
}
