export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';

export type CategoryName =
  | 'Study'
  | 'Food'
  | 'Wi-Fi'
  | 'Repair'
  | 'Shopping'
  | 'Healthcare'
  | 'Transport'
  | 'Other';

export interface Category {
  id: string;
  name: CategoryName;
  iconName: string;
  description: string;
  color: string;
  isActive?: boolean;
}

export interface LocationItem {
  id: string;
  name: string;
  description: string;
  category: CategoryName;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  imageUrls: string[];
  createdBy: string; // User UID
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
}

export interface SavedPlace {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt?: string;
  status: ReviewStatus; // PENDING, APPROVED, REJECTED
  rejectionReason?: string;
  isReported?: boolean;
}

export type ReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reportedBy: string;
  reportedByName?: string;
  targetType: 'location' | 'review';
  targetId: string;
  targetTitle?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface FilterState {
  category: string;
  minRating: number;
  verifiedOnly: boolean;
  searchQuery: string;
  sortBy: 'newest' | 'rating' | 'reviews';
}

