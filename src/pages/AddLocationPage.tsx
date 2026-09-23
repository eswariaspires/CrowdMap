import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  ImageIcon,
  Compass,
  Building2,
  FileText,
  Map as MapIcon,
  Check
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MapView } from '../components/map/MapView';
import { CategoryName } from '../types';
import { uploadImageToStorage } from '../services/storageService';

export const AddLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addLocation, categories } = useData();
  const { user } = useAuth();

  // Wizard Step State (Step 1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Data State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryName>('Study');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(42.3601);
  const [longitude, setLongitude] = useState<number>(-71.0589);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Image Upload State
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // File Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter((file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
      );

      if (validFiles.length !== filesArray.length) {
        setError('Only JPG, JPEG, PNG, and WEBP formats are supported.');
      } else {
        setError(null);
      }

      setImages((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setLatitude(Number(lat.toFixed(6)));
    setLongitude(Number(lng.toFixed(6)));
    setGoogleMapsUrl(`https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`);
  };

  // Step Nav validation
  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setError('Please enter a location name.');
        return;
      }
      if (!description.trim()) {
        setError('Please provide a description for the place.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!address.trim()) {
        setError('Please enter an address or landmark for the place.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(20);

      // Upload photos to Storage (with Data URL fallback)
      const uploadedUrls: string[] = [];
      const totalImages = images.length;
      
      if (totalImages > 0) {
        for (let i = 0; i < totalImages; i++) {
          const url = await uploadImageToStorage(images[i], 'locations');
          uploadedUrls.push(url);
          setUploadProgress(20 + Math.round(((i + 1) / totalImages) * 60));
        }
      }

      setUploadProgress(90);

      const locId = await addLocation({
        name: name.trim(),
        category,
        description: description.trim(),
        address: address.trim(),
        latitude,
        longitude,
        googleMapsUrl: googleMapsUrl || `https://maps.google.com/?q=${latitude},${longitude}`,
        imageUrls: uploadedUrls.length > 0 ? uploadedUrls : [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
        ],
        createdBy: user?.uid || 'anon-user',
        createdByName: user?.name || 'Community Member',
      });

      setUploadProgress(100);
      setSubmittedId(locId);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'We couldn\'t save this place. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Success Confirmation Screen
  if (submittedId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Thanks for sharing this place.
            </h2>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Status: Under review</span>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Your contribution will be reviewed to ensure accuracy and community usefulness. 
              Once verified, it will become visible to everyone on CrowdMap.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/my-contributions"
                className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition-colors shadow-sm text-center"
              >
                View My Contributions
              </Link>
              <button
                onClick={() => {
                  setSubmittedId(null);
                  setCurrentStep(1);
                  setName('');
                  setDescription('');
                  setAddress('');
                  setImages([]);
                  setImagePreviews([]);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Share another place
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep > 1 ? 'Back to previous step' : 'Back'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Know somewhere worth sharing?
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Discover local places and resources through knowledge shared by the community around you.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Details', icon: Building2 },
              { num: 2, title: 'Location', icon: MapIcon },
              { num: 3, title: 'Photos', icon: ImageIcon },
              { num: 4, title: 'Review', icon: CheckCircle2 }
            ].map((s) => {
              const IconComp = s.icon;
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  disabled={s.num > currentStep}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 sm:p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-brand-50 border border-brand-200 text-brand-700 font-bold'
                      : isDone
                      ? 'bg-slate-50 text-slate-700 font-medium cursor-pointer'
                      : 'text-slate-400 font-normal opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-brand-700 text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-xs text-center sm:text-left hidden sm:inline">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {/* Wizard Form Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-600" />
                  Step 1: Basic Information
                </h3>
                <p className="text-xs text-slate-500">
                  Provide the title, category, and a clear description of the place.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Place Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Central Library Quiet Reading Room, Campus Tech Hub"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-medium text-sm placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {categories.filter(c => c.isActive !== false).map((cat) => {
                    const isSel = category === cat.name;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.name)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                          isSel
                            ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isSel ? 'text-brand-800' : 'text-slate-800'}`}>
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {cat.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this place is useful (e.g. availability of power outlets, noise level, seating capacity, pricing)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-medium text-sm placeholder:text-slate-400"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  <span>Continue to Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location Pinning */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-brand-600" />
                  Step 2: Location & Address
                </h3>
                <p className="text-xs text-slate-500">
                  Search or click on the map to accurately place the marker for community members.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Address or Landmark *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 75 Boylston St, Boston, MA 02116 (or nearest street intersection)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-medium text-sm placeholder:text-slate-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Interactive Location Map
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {latitude}, {longitude}
                  </span>
                </div>

                <div className="h-72 rounded-2xl overflow-hidden border border-slate-200">
                  <MapView
                    locations={[]}
                    center={[latitude, longitude]}
                    zoom={14}
                    pickerMode={true}
                    selectedLatLng={{ lat: latitude, lng: longitude }}
                    onLocationSelect={handleMapLocationSelect}
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  <span>Continue to Photos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Photographs Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-600" />
                  Step 3: Photographs (Optional)
                </h3>
                <p className="text-xs text-slate-500">
                  Add clear photographs of the place entrance, interior, or amenities.
                </p>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  Click to choose photos or drop files here
                </p>
                <p className="text-xs text-slate-500">
                  Supports JPG, PNG, WEBP up to 5MB each
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Selected Images ({imagePreviews.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  <span>Review Submission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  Step 4: Review Submission
                </h3>
                <p className="text-xs text-slate-500">
                  Please confirm your submission details before sending to moderation.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/60 px-2.5 py-0.5 rounded-md">
                      {category}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-2">{name}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{address}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{description}</p>
                </div>

                {imagePreviews.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Attached Photographs</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {imagePreviews.map((src, i) => (
                        <img key={i} src={src} alt="Attached" className="w-20 h-16 object-cover rounded-lg border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar if submitting */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Uploading submission content...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm transition-colors shadow-md shadow-brand-700/20 disabled:opacity-50"
                >
                  {uploading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submit place</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
