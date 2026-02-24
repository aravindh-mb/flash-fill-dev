const STORAGE_KEY = 'flash_fill_config';

export interface FlashFillConfig {
    profiles: Record<string, any>[];
    active_profile_index: number;
    enabled: boolean;
}

const DEFAULT_CONFIG: FlashFillConfig = {
    profiles: [{
        name: "Default",
        data: {}
    }],
    active_profile_index: 0,
    enabled: true
};

export function get_config(): FlashFillConfig {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_CONFIG;
    try {
        return JSON.parse(stored);
    } catch {
        return DEFAULT_CONFIG;
    }
}

export function save_config(config: FlashFillConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
