const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

class AuthError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthError(
        response.status,
        json.message || 'Error al registrar usuario'
      );
    }

    // Backend now returns user only, tokens are in httpOnly cookies
    return {
      user: json.data?.user,
      accessToken: '', // Not used anymore
      refreshToken: '', // Not used anymore
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Error en registro:', error);
    throw new AuthError(500, 'Error de conexión al servidor');
  }
}

export async function login(data: LoginDto): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthError(
        response.status,
        json.message || 'Error al iniciar sesión'
      );
    }

    // Backend now returns user only, tokens are in httpOnly cookies
    return {
      user: json.data?.user,
      accessToken: '', // Not used anymore
      refreshToken: '', // Not used anymore
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Error en login:', error);
    throw new AuthError(500, 'Error de conexión al servidor');
  }
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies with request
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthError(
        response.status,
        json.message || 'Error al refrescar token'
      );
    }

    // Tokens are now in httpOnly cookies, return empty strings
    return {
      accessToken: '',
      refreshToken: '',
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Error al refrescar token:', error);
    throw new AuthError(500, 'Error de conexión al servidor');
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies with request
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthError(
        response.status,
        json.message || 'Error al cerrar sesión'
      );
    }

    return json;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Error al cerrar sesión:', error);
    throw new AuthError(500, 'Error de conexión al servidor');
  }
}

