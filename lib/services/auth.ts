const url = process.env.NEXT_PUBLIC_API_URL

// Define a type for the login response
export type LoginResponse = 
  | { token?: string; auth: boolean; error?: never }
  | { error: string; token?: never; auth?: never };

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${url}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { error: data.message || 'حدث خطأ في تسجيل الدخول' }
    }
   
    // Return auth status even if token is not defined
    return { 
      token: data.token, 
      auth: data.isAdmin || false 
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'حدث خطأ في الاتصال بالخادم' }
  }
}
