/**
 * Servicio de sincronización para mantener los datos consistentes entre dispositivos
 * Utiliza localStorage con un mecanismo de timestamp para detectar cambios
 */

// Tipos de datos para sincronización
export interface SyncData {
  data: any;
  timestamp: number;
  deviceId: string;
}

// Generar un ID único para este dispositivo
const generateDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// ID único para este dispositivo
const DEVICE_ID = generateDeviceId();

// Intervalo de sincronización (en milisegundos)
const SYNC_INTERVAL = 5000; // 5 segundos

const isBrowser = typeof window !== 'undefined';

// Función para guardar datos con timestamp
export const saveData = (key: string, data: any): void => {
  if (!isBrowser) return;
  
  try {
    const syncData: SyncData = {
      data,
      timestamp: Date.now(),
      deviceId: DEVICE_ID
    };
    
    // Guardar en localStorage
    localStorage.setItem(key, JSON.stringify(syncData));
    
    // Crear una copia de seguridad
    localStorage.setItem(`${key}_backup`, JSON.stringify(syncData));
    
    // Guardar en sessionStorage para acceso rápido
    sessionStorage.setItem(key, JSON.stringify(data));
    
    // Disparar un evento personalizado para notificar a otros componentes
    const event = new CustomEvent('data-updated', { 
      detail: { key, data: syncData.data, timestamp: syncData.timestamp } 
    });
    window.dispatchEvent(event);
    
    console.log(`Datos guardados en ${key} con timestamp ${syncData.timestamp}`);
  } catch (error) {
    console.error(`Error al guardar datos en ${key}:`, error);
  }
};

// Función para cargar datos
export const loadData = (key: string): any => {
  if (!isBrowser) return null;
  
  try {
    // Intentar cargar desde localStorage primero
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const syncData: SyncData = JSON.parse(storedData);
      
      // Guardar en sessionStorage para acceso rápido
      sessionStorage.setItem(key, JSON.stringify(syncData.data));
      
      return syncData.data;
    }
    
    // Intentar cargar desde backup si no hay datos en localStorage
    const backupData = localStorage.getItem(`${key}_backup`);
    if (backupData) {
      const syncData: SyncData = JSON.parse(backupData);
      return syncData.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error al cargar datos de ${key}:`, error);
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
      return syncData.timestamp > currentTimestamp;
    }
    return false;
  } catch (error) {
    console.error(`Error al verificar actualizaciones para ${key}:`, error);
    return false;
  }
};

// Función para obtener el timestamp actual de los datos
export const getDataTimestamp = (key: string): number => {
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

// Configurar listener para eventos de almacenamiento
export const setupStorageListener = (callback: (key: string, newData: any) => void): () => void => {
  if (!isBrowser) return () => {};
  
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key && event.newValue) {
      try {
        // Verificar si es uno de nuestros datos sincronizados
        if (event.key.startsWith('crm_')) {
          const syncData: SyncData = JSON.parse(event.newValue);
          
          // Actualizar sessionStorage
          sessionStorage.setItem(event.key, JSON.stringify(syncData.data));
          
          // Notificar al callback
          callback(event.key, syncData.data);
          
          console.log(`Datos actualizados desde otro dispositivo: ${event.key}`);
        }
      } catch (error) {
        console.error('Error al procesar cambio de almacenamiento:', error);
      }
    }
  };
  
  // Agregar listener para storage events
  window.addEventListener('storage', handleStorageChange);
  
  // Agregar listener para eventos personalizados
  const handleCustomEvent = (event: CustomEvent) => {
    const { key, data, timestamp } = event.detail;
    callback(key, data);
  };
  
  window.addEventListener('data-updated', handleCustomEvent as EventListener);
  
  // Devolver función para eliminar los listeners
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('data-updated', handleCustomEvent as EventListener);
  };
};

// Función para sincronizar datos periódicamente
export const startPeriodicSync = (
  keys: string[],
  onDataUpdated: (key: string, data: any) => void
): () => void => {
  // Almacenar los últimos timestamps conocidos
  const lastKnownTimestamps: Record<string, number> = {};
  keys.forEach(key => {
    lastKnownTimestamps[key] = getDataTimestamp(key);
  });
  
  // Función para verificar actualizaciones
  const checkUpdates = () => {
    keys.forEach(key => {
      const currentTimestamp = lastKnownTimestamps[key] || 0;
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
  
  // Iniciar intervalo
  const intervalId = setInterval(checkUpdates, SYNC_INTERVAL);
  
  // Devolver función para detener la sincronización
  return () => {
    clearInterval(intervalId);
  };
};

export default {
  saveData,
  loadData,
  checkForUpdates,
  getDataTimestamp,
  setupStorageListener,
  startPeriodicSync,
  DEVICE_ID
}; 