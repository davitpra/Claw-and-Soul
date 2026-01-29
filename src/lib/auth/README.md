# Autenticación con Tokens de Corta Duración

Este sistema implementa autenticación segura con tokens de corta duración y refresh automático.

## 🔐 Características de Seguridad

1. **httpOnly Cookies**: Los tokens se almacenan en cookies httpOnly, protegidos contra XSS
2. **Tokens de Corta Duración**:
   - Access Token: 15 minutos
   - Refresh Token: 7 días
3. **Refresh Automático**: Los tokens se renuevan automáticamente antes de expirar
4. **Retry en 401**: Las peticiones fallidas por token expirado se reintentan automáticamente

## 📖 Uso

### Opción 1: Hook useAuthFetch (Recomendado)

El hook `useAuthFetch` maneja automáticamente el refresh de tokens:

```tsx
'use client';

import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

export function ProfileComponent() {
  const { get, post } = useAuthFetch();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // GET request - automáticamente maneja refresh si el token expiró
    get<UserProfile>('/users/profile')
      .then(setProfile)
      .catch(console.error);
  }, [get]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      // POST request - automáticamente maneja refresh si el token expiró
      const updated = await post<UserProfile>('/users/profile', data);
      setProfile(updated);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // ... resto del componente
}
```

### Opción 2: fetchWithRefresh Directamente

Para más control, usa `fetchWithRefresh` directamente:

```tsx
import { fetchWithRefresh, fetchJSON } from '@/lib/auth/fetch-with-refresh';

// Fetch básico con manejo automático de refresh
const response = await fetchWithRefresh('/api/some-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ data: 'value' }),
});

// Fetch JSON con manejo automático de refresh
const data = await fetchJSON<MyDataType>('/api/some-endpoint');
```

### Opción 3: Fetch Normal (Sin Auto-Refresh)

Si necesitas hacer una petición sin auto-refresh:

```tsx
const response = await fetch('/api/some-endpoint', {
  credentials: 'include', // IMPORTANTE: incluir cookies
  method: 'GET',
});
```

## 🔄 Refresh Proactivo

El sistema automáticamente refresca el token cada 13 minutos (2 minutos antes de que expire), para que el usuario nunca experimente interrupciones.

Esto se maneja automáticamente en el `AuthProvider`, no necesitas hacer nada adicional.

## 🚨 Manejo de Errores

Si el refresh falla (por ejemplo, refresh token expirado), el sistema:
1. Intenta refrescar el token
2. Si falla, redirige automáticamente a `/login`
3. El usuario debe iniciar sesión nuevamente

## 📝 Ejemplos Completos

### Ejemplo: Componente de Lista de Mascotas

```tsx
'use client';

import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useState, useEffect } from 'react';

interface Pet {
  id: string;
  name: string;
  species: string;
}

export function PetList() {
  const { get, post, delete: del } = useAuthFetch();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar mascotas
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await get<Pet[]>('/pets');
      setPets(data);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar mascota
  const addPet = async (pet: Omit<Pet, 'id'>) => {
    try {
      const newPet = await post<Pet>('/pets', pet);
      setPets([...pets, newPet]);
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  // Eliminar mascota
  const removePet = async (id: string) => {
    try {
      await del(`/pets/${id}`);
      setPets(pets.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error removing pet:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {pets.map(pet => (
        <div key={pet.id}>
          <h3>{pet.name}</h3>
          <p>{pet.species}</p>
          <button onClick={() => removePet(pet.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo: Server Action con Refresh

```tsx
// app/actions/pets.ts
'use server';

import { cookies } from 'next/headers';

export async function getPets() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken');

  const response = await fetch('http://localhost:3001/api/pets', {
    headers: {
      Cookie: `accessToken=${accessToken?.value}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pets');
  }

  return response.json();
}
```

## ⚙️ Configuración

### Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (NestJS)

El backend debe tener configurado:

```env
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## 🔍 Debugging

Para ver los logs de refresh automático, abre la consola del navegador:

```
[Auth] Proactively refreshing token...
[Auth] Token refreshed successfully
```

Si ves errores de refresh, verifica:
1. El backend está corriendo
2. Las cookies están configuradas correctamente
3. CORS permite `credentials: true`
