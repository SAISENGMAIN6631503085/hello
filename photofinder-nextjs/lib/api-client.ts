const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`
    const token = localStorage.getItem("auth_token")

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    })

    const data = await response.json()

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error,
      status: response.status,
    }
  } catch (error) {
    return {
      error: "Network error",
      status: 0,
    }
  }
}

export const apiClient = {
  // Auth
  exchangeOIDC: (code: string, state: string) =>
    apiCall("/auth/oidc/exchange", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    }),

  // Events
  getEvents: () => apiCall("/events"),
  createEvent: (data: any) => apiCall("/events", { method: "POST", body: JSON.stringify(data) }),
  uploadPhotos: (eventId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    return fetch(`${API_BASE}/events/${eventId}/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }).then((r) => r.json())
  },

  // Search
  searchByFace: (imageData: string, eventId?: string) =>
    apiCall("/search/face", {
      method: "POST",
      body: JSON.stringify({ imageData, eventId }),
    }),

  // Photos
  getMyPhotos: () => apiCall("/me/my-photos"),
  requestPhotoRemoval: (photoId: string, requestType: string, reason?: string) =>
    apiCall("/removal-requests", {
      method: "POST",
      body: JSON.stringify({ photoId, requestType, reason }),
    }),

  // Deliveries
  triggerDelivery: (userId: string, eventId: string, deliveryMethod: string) =>
    apiCall("/deliveries/trigger", {
      method: "POST",
      body: JSON.stringify({ userId, eventId, deliveryMethod }),
    }),

  // Privacy
  optOut: (userId: string, optOutType: string, reason?: string) =>
    apiCall(`/persons/${userId}/opt-out`, {
      method: "POST",
      body: JSON.stringify({ optOutType, reason }),
    }),

  // Analytics
  getAnalytics: () => apiCall("/analytics"),
}
