import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LocationItem, Review, Report, Category, SavedPlace } from '../types';

interface DataContextType {
  locations: LocationItem[];
  reviews: Review[];
  reports: Report[];
  categories: Category[];
  savedPlaces: SavedPlace[];
  loading: boolean;
  userCount: number;
  addLocation: (loc: Omit<LocationItem, 'id' | 'createdAt' | 'averageRating' | 'reviewCount' | 'verificationStatus' | 'isActive'>) => Promise<string>;
  approveLocation: (id: string) => Promise<void>;
  requestChangesLocation: (id: string, reason: string) => Promise<void>;
  rejectLocation: (id: string, reason?: string) => Promise<void>;
  resubmitLocation: (id: string, updatedData: Partial<LocationItem>) => Promise<void>;
  addReview: (locationId: string, rating: number, comment: string, userId: string, userName: string, userPhoto?: string) => Promise<void>;
  approveReview: (reviewId: string) => Promise<void>;
  rejectReview: (reviewId: string, reason?: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  toggleSaveLocation: (locationId: string, userId: string) => Promise<boolean>;
  isLocationSaved: (locationId: string, userId: string) => boolean;
  getSavedLocations: (userId: string) => LocationItem[];
  addReport: (targetType: 'location' | 'review', targetId: string, reason: string, description?: string, reportedBy?: string, reportedByName?: string, targetTitle?: string) => Promise<void>;
  updateReportStatus: (reportId: string, status: 'REVIEWED' | 'RESOLVED' | 'DISMISSED', adminUid?: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  toggleCategoryActive: (id: string) => Promise<void>;
  getLocationById: (id: string) => LocationItem | undefined;
  getReviewsByLocationId: (locationId: string, includePendingForUser?: string) => Review[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ---------- row <-> app object mappers (database uses snake_case) ----------
const toLocation = (r: any): LocationItem => ({
  id: r.id,
  name: r.name,
  description: r.description ?? '',
  category: r.category,
  address: r.address ?? '',
  latitude: r.latitude,
  longitude: r.longitude,
  googleMapsUrl: r.google_maps_url ?? undefined,
  imageUrls: r.image_urls ?? [],
  createdBy: r.created_by ?? 'osm',
  createdByName: r.created_by_name ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at ?? undefined,
  verificationStatus: r.verification_status,
  rejectionReason: r.rejection_reason ?? undefined,
  averageRating: Number(r.average_rating),
  reviewCount: r.review_count,
  isActive: r.is_active,
});

const locToRow = (d: Partial<LocationItem>) => {
  const r: Record<string, any> = {};
  if (d.name !== undefined) r.name = d.name;
  if (d.description !== undefined) r.description = d.description;
  if (d.category !== undefined) r.category = d.category;
  if (d.address !== undefined) r.address = d.address;
  if (d.latitude !== undefined) r.latitude = d.latitude;
  if (d.longitude !== undefined) r.longitude = d.longitude;
  if (d.googleMapsUrl !== undefined) r.google_maps_url = d.googleMapsUrl;
  if (d.imageUrls !== undefined) r.image_urls = d.imageUrls;
  return r;
};

const toReview = (r: any): Review => ({
  id: r.id,
  locationId: r.location_id,
  userId: r.user_id,
  userName: r.user_name,
  userPhoto: r.user_photo ?? undefined,
  rating: r.rating,
  comment: r.comment ?? '',
  createdAt: r.created_at,
  updatedAt: r.updated_at ?? undefined,
  status: r.status,
  rejectionReason: r.rejection_reason ?? undefined,
  isReported: r.is_reported ?? false,
});

const toReport = (r: any): Report => ({
  id: r.id,
  reportedBy: r.reported_by ?? '',
  reportedByName: r.reported_by_name ?? undefined,
  targetType: r.target_type,
  targetId: r.target_id,
  targetTitle: r.target_title ?? undefined,
  reason: r.reason,
  description: r.description ?? undefined,
  status: r.status,
  createdAt: r.created_at,
  resolvedAt: r.resolved_at ?? undefined,
  resolvedBy: r.resolved_by ?? undefined,
});

const toCategory = (r: any): Category => ({
  id: r.id,
  name: r.name,
  iconName: r.icon_name,
  description: r.description ?? '',
  color: r.color ?? '',
  isActive: r.is_active ?? true,
});

const toSaved = (r: any): SavedPlace => ({
  id: r.id,
  userId: r.user_id,
  locationId: r.location_id,
  createdAt: r.created_at,
});

// Supabase returns max 1000 rows per request, so page through everything
async function fetchAll(table: string, orderCol: string, ascending: boolean): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table).select('*').order(orderCol, { ascending }).range(from, from + 999);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

const must = ({ error }: { error: any }) => {
  if (error) throw error;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userCount, setUserCount] = useState<number>(0);

  const reloadLocations = useCallback(async () => {
    try { setLocations((await fetchAll('locations', 'created_at', false)).map(toLocation)); }
    catch (e) { console.warn('Load locations failed:', e); }
  }, []);
  const reloadReviews = useCallback(async () => {
    try { setReviews((await fetchAll('reviews', 'created_at', false)).map(toReview)); }
    catch (e) { console.warn('Load reviews failed:', e); }
  }, []);
  const reloadReports = useCallback(async () => {
    try { setReports((await fetchAll('reports', 'created_at', false)).map(toReport)); }
    catch (e) { console.warn('Load reports failed:', e); }
  }, []);
  const reloadCategories = useCallback(async () => {
    try { setCategories((await fetchAll('categories', 'sort_order', true)).map(toCategory)); }
    catch (e) { console.warn('Load categories failed:', e); }
  }, []);
  const reloadSaved = useCallback(async () => {
    try { setSavedPlaces((await fetchAll('saved_places', 'created_at', false)).map(toSaved)); }
    catch (e) { console.warn('Load saved places failed:', e); }
  }, []);

  const reloadUserCount = useCallback(async () => {
  try {
    const { data, error } = await supabase.rpc('get_user_count');

    if (error) throw error;

    setUserCount(Number(data ?? 0));
  } catch (e) {
    console.warn('Load user count failed:', e);
  }
}, []);

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadLocations(), reloadReviews(), reloadReports(), reloadCategories(), reloadSaved(), reloadUserCount()]);
    setLoading(false);
  }, [reloadLocations, reloadReviews, reloadReports, reloadCategories, reloadSaved, reloadUserCount]);

  useEffect(() => {
    reloadAll();

    // Live updates (replaces PostgreSQL onSnapshot)
    const handlers: Record<string, () => void> = {
      locations: reloadLocations,
      reviews: reloadReviews,
      reports: reloadReports,
      categories: reloadCategories,
      saved_places: reloadSaved,
    };
    const channel = supabase.channel('crowdmap-sync');
    Object.entries(handlers).forEach(([table, fn]) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => fn());
    });
    channel.subscribe();

    // Row Level Security changes what each person can see, so reload on login/logout
    const { data: auth } = supabase.auth.onAuthStateChange(() => {
      setTimeout(reloadAll, 0);
    });

    return () => {
      supabase.removeChannel(channel);
      auth.subscription.unsubscribe();
    };
  }, [reloadAll, reloadLocations, reloadReviews, reloadReports, reloadCategories, reloadSaved]);

  // ---------------- Locations ----------------
  const addLocation: DataContextType['addLocation'] = async (locData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please log in to add a location.');
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...locToRow(locData),
        created_by: user.id,
        created_by_name: locData.createdByName,
        verification_status: 'PENDING', // community submissions always start as PENDING
        source: 'user',
      })
      .select()
      .single();
    if (error) throw error;
    await reloadLocations();
    return data.id as string;
  };

  const setLocationStatus = async (id: string, fields: Record<string, any>) => {
    must(await supabase.from('locations').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id));
    await reloadLocations();
  };

  const approveLocation = (id: string) =>
    setLocationStatus(id, { verification_status: 'APPROVED', rejection_reason: null });
  const requestChangesLocation = (id: string, reason: string) =>
    setLocationStatus(id, { verification_status: 'NEEDS_CHANGES', rejection_reason: reason });
  const rejectLocation = (id: string, reason?: string) =>
    setLocationStatus(id, { verification_status: 'REJECTED', rejection_reason: reason ?? null });
  const resubmitLocation = (id: string, updatedData: Partial<LocationItem>) =>
    setLocationStatus(id, { ...locToRow(updatedData), verification_status: 'PENDING', rejection_reason: null });

  // ---------------- Reviews ----------------
  const addReview: DataContextType['addReview'] = async (locationId, rating, comment, userId, userName, userPhoto) => {
    const existing = reviews.find(r => r.locationId === locationId && r.userId === userId && r.status !== 'REJECTED');
    if (existing) throw new Error('You have already submitted a review for this location.');

    const { error } = await supabase.from('reviews').insert({
      location_id: locationId,
      user_id: userId,
      user_name: userName,
      user_photo: userPhoto ?? null,
      rating,
      comment,
      status: 'PENDING', // needs admin approval
    });
    if (error) {
      if (error.code === '23505') throw new Error('You have already submitted a review for this location.');
      throw error;
    }
    await reloadReviews(); // ratings are recalculated by a database trigger
  };

  const setReviewStatus = async (id: string, fields: Record<string, any>) => {
    must(await supabase.from('reviews').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id));
    await Promise.all([reloadReviews(), reloadLocations()]);
  };
  const approveReview = (id: string) => setReviewStatus(id, { status: 'APPROVED', rejection_reason: null });
  const rejectReview = (id: string, reason?: string) => setReviewStatus(id, { status: 'REJECTED', rejection_reason: reason ?? null });
  const deleteReview = async (id: string) => {
    must(await supabase.from('reviews').delete().eq('id', id));
    await Promise.all([reloadReviews(), reloadLocations()]);
  };

  // ---------------- Saved places ----------------
  const toggleSaveLocation = async (locationId: string, userId: string): Promise<boolean> => {
    const existing = savedPlaces.find(s => s.locationId === locationId && s.userId === userId);
    if (existing) {
      must(await supabase.from('saved_places').delete().eq('id', existing.id));
      await reloadSaved();
      return false;
    }
    must(await supabase.from('saved_places').insert({ user_id: userId, location_id: locationId }));
    await reloadSaved();
    return true;
  };

  const isLocationSaved = (locationId: string, userId: string) =>
    savedPlaces.some(s => s.locationId === locationId && s.userId === userId);

  const getSavedLocations = (userId: string) => {
    const ids = new Set(savedPlaces.filter(s => s.userId === userId).map(s => s.locationId));
    return locations.filter(l => ids.has(l.id));
  };

  // ---------------- Reports ----------------
  const addReport: DataContextType['addReport'] = async (targetType, targetId, reason, description, _reportedBy, reportedByName, targetTitle) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please log in to submit a report.');
    must(await supabase.from('reports').insert({
      reported_by: user.id,
      reported_by_name: reportedByName ?? 'Community Member',
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle ?? null,
      reason,
      description: description ?? null,
      status: 'OPEN',
    }));
    await reloadReports();
  };

  const updateReportStatus: DataContextType['updateReportStatus'] = async (reportId, status, adminUid) => {
    const { data: { user } } = await supabase.auth.getUser();
    must(await supabase.from('reports').update({
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id ?? adminUid ?? null,
    }).eq('id', reportId));
    await reloadReports();
  };

  // ---------------- Categories ----------------
  const addCategory: DataContextType['addCategory'] = async (cat) => {
    must(await supabase.from('categories').insert({
      name: cat.name,
      icon_name: cat.iconName,
      description: cat.description,
      color: cat.color,
      is_active: true,
      sort_order: categories.length + 1,
    }));
    await reloadCategories();
  };

  const updateCategory: DataContextType['updateCategory'] = async (id, data) => {
    const row: Record<string, any> = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.iconName !== undefined) row.icon_name = data.iconName;
    if (data.description !== undefined) row.description = data.description;
    if (data.color !== undefined) row.color = data.color;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    must(await supabase.from('categories').update(row).eq('id', id));
    await reloadCategories();
  };

  const toggleCategoryActive = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    await updateCategory(id, { isActive: !(cat.isActive ?? true) });
  };

  // ---------------- Getters ----------------
  const getLocationById = (id: string) => locations.find(l => l.id === id);

  const getReviewsByLocationId = (locationId: string, includePendingForUser?: string) =>
    reviews.filter(r => {
      if (r.locationId !== locationId) return false;
      if (r.status === 'APPROVED') return true;
      return Boolean(includePendingForUser && r.userId === includePendingForUser);
    });

  return (
    <DataContext.Provider value={{
      locations, reviews, reports, categories, savedPlaces, loading,  userCount,
      addLocation, approveLocation, requestChangesLocation, rejectLocation, resubmitLocation,
      addReview, approveReview, rejectReview, deleteReview,
      toggleSaveLocation, isLocationSaved, getSavedLocations,
      addReport, updateReportStatus,
      addCategory, updateCategory, toggleCategoryActive,
      getLocationById, getReviewsByLocationId,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
