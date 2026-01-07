
const API_BASE = 'https://jsonblob.com/api/jsonBlob';

export interface SyncPayload {
  expenses: any[];
  incomeEntries: any[];
  salary: number;
  lastUpdated: string;
}

const generateVaultIdFromEmail = (email: string): string => {
  const cleanEmail = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    const char = cleanEmail.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `deepan-user-${hex}`;
};

export const syncService = {
  getSyncId: (email: string): string => {
    return generateVaultIdFromEmail(email);
  },

  initializeVault: async (syncId: string, data: SyncPayload): Promise<void> => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const location = response.headers.get('Location');
      const assignedId = location?.split('/').pop() || '';
      localStorage.setItem(`deepan_vault_mapping_${syncId}`, assignedId);
    } catch (e) {
      console.warn('Sync initialization failed:', e);
      throw e;
    }
  },

  pushData: async (syncId: string, data: SyncPayload): Promise<void> => {
    const realId = localStorage.getItem(`deepan_vault_mapping_${syncId}`) || syncId;
    try {
      const response = await fetch(`${API_BASE}/${realId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Push failed: ${response.status}`);
    } catch (e) {
      console.error('Push data error:', e);
      throw e;
    }
  },

  pullData: async (syncId: string): Promise<SyncPayload | null> => {
    const realId = localStorage.getItem(`deepan_vault_mapping_${syncId}`) || syncId;
    try {
      const response = await fetch(`${API_BASE}/${realId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Pull failed: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('Pull data error:', e);
      return null;
    }
  }
};
