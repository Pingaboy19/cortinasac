/**
 * Servicio de sincronización para mantener los datos consistentes entre dispositivos
 * Utiliza localStorage con un mecanismo de timestamp para detectar cambios
 */

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// Tipos de datos para sincronización
export interface SyncData {
  data: any;
  timestamp: number;
  deviceId: string;
  version: number; // Añadido para control de versiones
}

// Generar un ID único para este dispositivo
const generateDeviceId = () => {
  if (!isBrowser) return 'server';
  
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// ID único para este dispositivo
const DEVICE_ID = isBrowser ? generateDeviceId() : 'server';

// Intervalo de sincronización (en milisegundos)
const SYNC_INTERVAL = 2000; // Reducido a 2 segundos para sincronización más rápida

// Función para guardar datos con timestamp
export const saveData = (key: string, data: any): void => {
  if (!isBrowser) return;
  
  try {
    // Obtener la versión actual si existe
    let version = 1;
    const existingData = localStorage.getItem(key);
    if (existingData) {
      try {
        const parsed: SyncData = JSON.parse(existingData);
        version = (parsed.version || 0) + 1;
      } catch (e) {
        console.warn(`Error al parsear datos existentes para ${key}, iniciando nueva versión`);
      }
    }
    
    const syncData: SyncData = {
      data,
      timestamp: Date.now(),
      deviceId: DEVICE_ID,
      version
    };
    
    // Guardar en localStorage
    localStorage.setItem(key, JSON.stringify(syncData));
    
    // Guardar en sessionStorage para acceso rápido
    sessionStorage.setItem(key, JSON.stringify(data));
    
    // Crear una copia de seguridad
    localStorage.setItem(`${key}_backup`, JSON.stringify(syncData));
    
    // Disparar un evento personalizado para notificar a otros componentes en la misma ventana
    if (isBrowser) {
      const event = new CustomEvent('data-updated', { 
        detail: { key, timestamp: syncData.timestamp, version, deviceId: DEVICE_ID } 
      });
      window.dispatchEvent(event);
      
      // Usar BroadcastChannel si está disponible para comunicación entre pestañas
      try {
        const bc = new BroadcastChannel('sync_channel');
        bc.postMessage({ type: 'update', key, timestamp: syncData.timestamp, version, deviceId: DEVICE_ID });
        bc.close();
      } catch (e) {
        // BroadcastChannel no está disponible, usar localStorage como fallback
        const syncMessage = {
          type: 'sync-message',
          key,
          timestamp: Date.now(),
          deviceId: DEVICE_ID
        };
        localStorage.setItem('__sync_message', JSON.stringify(syncMessage));
        // Eliminar inmediatamente para que otros detecten el cambio
        localStorage.removeItem('__sync_message');
      }
    }
    
    console.log(`Datos guardados en ${key} con timestamp ${syncData.timestamp} y versión ${version}`);
  } catch (error) {
    console.error(`Error al guardar datos en ${key}:`, error);
    
    // Intentar guardar solo los datos esenciales si hay error de cuota
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), deviceId: DEVICE_ID, version: 1 }));
    } catch (e) {
      console.error('Error crítico al guardar datos:', e);
    }
  }
};

// Función para cargar datos
export const loadData = (key: string): any => {
  if (!isBrowser) return null;
  
  try {
    // Intentar cargar desde sessionStorage primero (más rápido)
    const sessionData = sessionStorage.getItem(key);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // Cargar desde localStorage
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const syncData: SyncData = JSON.parse(storedData);
      
      // Guardar en sessionStorage para acceso rápido
      sessionStorage.setItem(key, JSON.stringify(syncData.data));
      
      return syncData.data;
    }
    
    // Intentar cargar desde backup
    const backupData = localStorage.getItem(`${key}_backup`);
    if (backupData) {
      const syncData: SyncData = JSON.parse(backupData);
      
      // Restaurar desde backup a localStorage
      localStorage.setItem(key, backupData);
      
      return syncData.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error al cargar datos de ${key}:`, error);
    
    // Intentar cargar desde backup en caso de error
    try {
      const backupData = localStorage.getItem(`${key}_backup`);
      if (backupData) {
        const syncData = JSON.parse(backupData);
        return syncData.data;
      }
    } catch (e) {
      console.error(`Error al cargar backup de ${key}:`, e);
    }
    
    return null;
  }
};

// Función para verificar si hay datos más recientes
export const checkForUpdates = (key: string, currentTimestamp: number): boolean => {
  if (!isBrowser) return false;
  
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const syncData: SyncData = JSON.parse(storedData);
      // Verificar si los datos son más recientes y de otro dispositivo
      return syncData.timestamp > currentTimestamp && syncData.deviceId !== DEVICE_ID;
    }
    return false;
  } catch (error) {
    console.error(`Error al verificar actualizaciones para ${key}:`, error);
    return false;
  }
};

// Función para obtener el timestamp actual de los datos
export const getDataTimestamp = (key: string): number => {
  if (!isBrowser) return 0;
  
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const syncData: SyncData = JSON.parse(storedData);
      return syncData.timestamp;
    }
    return 0;
  } catch (error) {
    console.error(`Error al obtener timestamp para ${key}:`, error);
    return 0;
  }
};

// Configurar listener para eventos de almacenamiento (cuando cambia en otra pestaña)
export const setupStorageListener = (callback: (key: string, newData: any) => void): () => void => {
  if (!isBrowser) return () => {};
  
  // Listener para eventos de localStorage (cambios en otras pestañas)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key && event.newValue) {
      try {
        // Verificar si es uno de nuestros datos sincronizados
        if (event.key.startsWith('crm_') || event.key.startsWith('auth_')) {
          const syncData: SyncData = JSON.parse(event.newValue);
          
          // Solo procesar si viene de otro dispositivo
          if (syncData.deviceId !== DEVICE_ID) {
            // Actualizar sessionStorage
            sessionStorage.setItem(event.key, JSON.stringify(syncData.data));
            
            // Notificar al callback
            callback(event.key, syncData.data);
            
            console.log(`Datos actualizados desde otro dispositivo: ${event.key} (versión ${syncData.version || 'N/A'})`);
          }
        }
        
        // Verificar mensajes de sincronización
        if (event.key === '__sync_message' && event.newValue) {
          const message = JSON.parse(event.newValue);
          if (message.deviceId !== DEVICE_ID) {
            // Forzar recarga de datos
            const key = message.key;
            const newData = loadData(key);
            callback(key, newData);
          }
        }
      } catch (error) {
        console.error('Error al procesar cambio de almacenamiento:', error);
      }
    }
  };
  
  // Listener para eventos de BroadcastChannel (comunicación entre pestañas)
  let broadcastChannel: BroadcastChannel | null = null;
  
  try {
    broadcastChannel = new BroadcastChannel('sync_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'update' && event.data.deviceId !== DEVICE_ID) {
        const key = event.data.key;
        // Forzar recarga de datos
        const newData = loadData(key);
        callback(key, newData);
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel no está disponible, usando localStorage para sincronización');
  }
  
  // Listener para eventos personalizados (en la misma ventana)
  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.deviceId !== DEVICE_ID) {
      const key = customEvent.detail.key;
      const newData = loadData(key);
      callback(key, newData);
    }
  };
  
  // Agregar listeners
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('data-updated', handleCustomEvent);
  
  // Devolver función para eliminar los listeners
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('data-updated', handleCustomEvent);
    if (broadcastChannel) {
      broadcastChannel.close();
    }
  };
};

// Función para sincronizar datos periódicamente
export const startPeriodicSync = (
  keys: string[],
  onDataUpdated: (key: string, data: any) => void
): () => void => {
  if (!isBrowser) return () => {};
  
  // Almacenar los últimos timestamps conocidos
  const lastKnownTimestamps: Record<string, number> = {};
  keys.forEach(key => {
    lastKnownTimestamps[key] = getDataTimestamp(key);
  });
  
  // Función para verificar actualizaciones
  const checkUpdates = () => {
    keys.forEach(key => {
      const currentTimestamp = lastKnownTimestamps[key] || 0;
      
      // Verificar si hay datos más recientes
      if (checkForUpdates(key, currentTimestamp)) {
        // Hay datos más recientes
        const newData = loadData(key);
        const newTimestamp = getDataTimestamp(key);
        
        // Actualizar timestamp conocido
        lastKnownTimestamps[key] = newTimestamp;
        
        // Notificar al callback
        onDataUpdated(key, newData);
        
        console.log(`Datos sincronizados para ${key} con timestamp ${newTimestamp}`);
      }
    });
  };
  
  // Ejecutar una verificación inmediata
  checkUpdates();
  
  // Iniciar intervalo
  const intervalId = setInterval(checkUpdates, SYNC_INTERVAL);
  
  // Devolver función para detener la sincronización
  return () => {
    clearInterval(intervalId);
  };
};

// Función para forzar una sincronización inmediata
export const forceSyncNow = (keys: string[], onDataUpdated: (key: string, data: any) => void): void => {
  if (!isBrowser) return;
  
  keys.forEach(key => {
    // Recargar datos directamente desde localStorage
    localStorage.removeItem(`${key}_temp`);
    sessionStorage.removeItem(key);
    
    const newData = loadData(key);
    onDataUpdated(key, newData);
    
    console.log(`Sincronización forzada para ${key}`);
  });
};

// Exportar un objeto con todas las funciones
const syncService = {
  saveData,
  loadData,
  checkForUpdates,
  getDataTimestamp,
  setupStorageListener,
  startPeriodicSync,
  forceSyncNow,
  DEVICE_ID
};

export default syncService; 