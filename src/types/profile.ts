// Profile-related types
export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface Address {
  country?: string;
  city?: string;
  street?: string;
  number?: string;
  complement?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  bio: string | null;
  username: string | null;
  postal_code: string | null;
  location_text: string | null;
  address: Address | null;
  social_media: SocialMedia | null;
  is_verified: boolean | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
